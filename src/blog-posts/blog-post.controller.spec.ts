import { Test, TestingModule } from '@nestjs/testing';
import { BlogPostsController } from './blog-post.controller';
import { BlogPostsService } from './blog-post.service';
import { CreateBlogPostDto } from './dto/create-BlogPost.dto';
import { BlogPost } from './entities/BlogPost.entity';

const mockPost: BlogPost = {
  id: 1,
  title: 'Test Post',
  body: 'Test Body',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PostsController', () => {
  let controller: BlogPostsController;
  let service: BlogPostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogPostsController],
      providers: [
        {
          provide: BlogPostsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockPost),
            createMany: jest.fn().mockResolvedValue([mockPost]),
            findAll: jest.fn().mockResolvedValue([mockPost]),
            findOne: jest.fn().mockResolvedValue(mockPost),
          },
        },
      ],
    }).compile();

    controller = module.get<BlogPostsController>(BlogPostsController);
    service = module.get<BlogPostsService>(BlogPostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a post', async () => {
    const createPostDto: CreateBlogPostDto = {
      title: 'Test Post',
      body: 'Test Body',
    };
    const result = await controller.create(createPostDto);
    expect(result).toEqual(mockPost);
  });

  it('should create multiple posts', async () => {
    const createPostsDto: CreateBlogPostDto[] = [
      { title: 'Test Post', body: 'Test Body' },
    ];
    const result = await controller.createMany(createPostsDto);
    expect(result).toEqual([mockPost]);
  });

  it('should find all posts', async () => {
    const result = await controller.findAll(1, 10);
    expect(result).toEqual([mockPost]);
  });

  it('should find one post by id', async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual(mockPost);
  });
});
