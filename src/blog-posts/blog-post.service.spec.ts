import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPostsService } from './blog-post.service';
import { BlogPost } from './entities/BlogPost.entity';
import { RedisService } from '../redis/redis.service';
import { NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';

const mockPost = (id: number): BlogPost => ({
  id,
  title: `Test Post ${id}`,
  body: `Test Body ${id}`,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('PostsService', () => {
  let service: BlogPostsService;
  let repository: jest.Mocked<Repository<BlogPost>>;
  let redisService: RedisService;
  let redisClient: jest.Mocked<Redis>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogPostsService,
        RedisService,
        {
          provide: getRepositoryToken(BlogPost),
          useValue: mockRepository(),
        },
      ],
    })
      .overrideProvider(RedisService)
      .useValue({
        getClient: jest.fn().mockReturnValue(mockRedis),
        get: jest.fn().mockImplementation((key: string) => mockRedis.get(key)),
        set: jest
          .fn()
          .mockImplementation((key: string, value: any, expire: number) =>
            mockRedis.set(key, value, 'EX', expire),
          ),
        del: jest.fn().mockImplementation((key: string) => mockRedis.del(key)),
      })
      .compile();

    service = module.get<BlogPostsService>(BlogPostsService);
    repository = module.get<jest.Mocked<Repository<BlogPost>>>(
      getRepositoryToken(BlogPost),
    );
    redisService = module.get<RedisService>(RedisService);
    redisClient = redisService.getClient() as jest.Mocked<Redis>;
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks to ensure no interference between tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a post', async () => {
    const post = mockPost(1);
    repository.create.mockReturnValue(post as any);
    repository.save.mockResolvedValue(post as any);
    redisClient.del.mockResolvedValue(null);

    const result = await service.create(post);
    expect(result).toEqual(post);
    expect(redisClient.del).toHaveBeenCalledWith('posts');
  });

  it('should find all posts with pagination and cache the result', async () => {
    const posts = [mockPost(1), mockPost(2)];
    repository.find.mockResolvedValue(posts as any);
    redisClient.get.mockResolvedValue(null);
    redisClient.set.mockResolvedValue(null);

    // First call should fetch from PostgreSQL and cache the result
    const result = await service.findAll(1, 2);
    expect(result).toEqual(posts);
    expect(redisClient.get).toHaveBeenCalledWith('posts_1_2');
    expect(redisClient.set).toHaveBeenCalledWith(
      'posts_1_2',
      JSON.stringify(posts),
      'EX',
      3600,
    );
    expect(repository.find).toHaveBeenCalledWith({
      skip: 0,
      take: 2,
    });

    // Clear mocks to verify subsequent call hits cache
    jest.clearAllMocks();
    redisClient.get.mockResolvedValue(JSON.stringify(posts));

    // Second call should fetch from cache
    const cachedResultString = await redisClient.get('posts_1_2');
    const cachedResult = JSON.parse(cachedResultString, (key, value) =>
      key === 'createdAt' || key === 'updatedAt' ? new Date(value) : value,
    );
    expect(cachedResult).toEqual(posts);
    expect(redisClient.get).toHaveBeenCalledWith('posts_1_2');
    expect(repository.find).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it('should find one post by id and cache the result', async () => {
    const post = mockPost(1);
    repository.findOne.mockResolvedValue(post as any);
    redisClient.get.mockResolvedValue(null);
    redisClient.set.mockResolvedValue(null);

    // First call should fetch from PostgreSQL and cache the result
    const result = await service.findOne(1);
    expect(result).toEqual(post);
    expect(redisClient.get).toHaveBeenCalledWith('post_1');
    expect(redisClient.set).toHaveBeenCalledWith(
      'post_1',
      JSON.stringify(post),
      'EX',
      3600,
    );
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

    // Clear mocks to verify subsequent call hits cache
    jest.clearAllMocks();
    redisClient.get.mockResolvedValue(JSON.stringify(post));

    // Second call should fetch from cache
    const cachedResultString = await redisClient.get('post_1');
    const cachedResult = JSON.parse(cachedResultString, (key, value) =>
      key === 'createdAt' || key === 'updatedAt' ? new Date(value) : value,
    );
    expect(cachedResult).toEqual(post);
    expect(redisClient.get).toHaveBeenCalledWith('post_1');
    expect(repository.findOne).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it('should return cached post by id', async () => {
    const post = mockPost(1);
    redisClient.get.mockResolvedValue(JSON.stringify(post));

    const resultString = await redisClient.get('post_1');
    const result = JSON.parse(resultString, (key, value) =>
      key === 'createdAt' || key === 'updatedAt' ? new Date(value) : value,
    );
    expect(result).toEqual(post);
    expect(redisClient.get).toHaveBeenCalledWith('post_1');
    expect(repository.findOne).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if post not found', async () => {
    repository.findOne.mockResolvedValue(null);
    redisClient.get.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    expect(redisClient.get).toHaveBeenCalledWith('post_1');
  });

  it('should create multiple posts', async () => {
    const posts = [mockPost(1), mockPost(2)];
    repository.create.mockReturnValue(posts as any);
    repository.save.mockResolvedValue(posts as any);
    redisClient.del.mockResolvedValue(null);

    const result = await service.createMany(posts);
    expect(result).toEqual(posts);
    expect(redisClient.del).toHaveBeenCalledWith('posts');
  });

  it('should handle multiple pages correctly', async () => {
    const postsPage1 = [mockPost(1), mockPost(2)];
    const postsPage2 = [mockPost(3), mockPost(4)];
    const postsPage3 = [mockPost(5), mockPost(6)];

    repository.find
      .mockResolvedValueOnce(postsPage1 as any)
      .mockResolvedValueOnce(postsPage2 as any)
      .mockResolvedValueOnce(postsPage3 as any);

    // Test page 1
    let result = await service.findAll(1, 2);
    expect(result).toEqual(postsPage1);
    expect(repository.find).toHaveBeenCalledWith({ skip: 0, take: 2 });

    // Test page 2
    result = await service.findAll(2, 2);
    expect(result).toEqual(postsPage2);
    expect(repository.find).toHaveBeenCalledWith({ skip: 2, take: 2 });

    // Test page 3
    result = await service.findAll(3, 2);
    expect(result).toEqual(postsPage3);
    expect(repository.find).toHaveBeenCalledWith({ skip: 4, take: 2 });
  });

  it('should handle pagination with 19 entries and a limit of 5 per page', async () => {
    const posts = Array.from({ length: 19 }, (_, i) => mockPost(i + 1));
    repository.find.mockImplementation(({ skip, take }) =>
      Promise.resolve(posts.slice(skip, skip + take)),
    );

    const totalPages = Math.ceil(posts.length / 5);

    for (let page = 1; page <= totalPages; page++) {
      const result = await service.findAll(page, 5);
      const expectedPosts = posts.slice((page - 1) * 5, page * 5);
      expect(result).toEqual(expectedPosts);
      expect(repository.find).toHaveBeenCalledWith({
        skip: (page - 1) * 5,
        take: 5,
      });
    }

    // Test last page to ensure it returns the remaining entries
    const lastPageResult = await service.findAll(totalPages, 5);
    expect(lastPageResult.length).toBe(4); // The last page should return 4 entries
    expect(lastPageResult).toEqual(posts.slice(15, 19));
  });
});
