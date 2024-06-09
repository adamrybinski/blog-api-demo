import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CreateBlogPostDto } from './dto/create-BlogPost.dto';
import { BlogPost } from './entities/BlogPost.entity';

@Injectable()
export class BlogPostsService {
  constructor(
    @InjectRepository(BlogPost)
    private postsRepository: Repository<BlogPost>,
    private readonly redisService: RedisService,
  ) {}

  private get redisClient() {
    return this.redisService.getClient();
  }

  async create(createPostDto: CreateBlogPostDto): Promise<BlogPost> {
    const post = this.postsRepository.create(createPostDto);
    const savedPost = await this.postsRepository.save(post);
    try {
      await this.redisClient.del('posts'); // Invalidate cache when a new post is created
    } catch (err) {
      console.error(`Error invalidating cache: ${err.message}`);
    }
    return savedPost;
  }

  async createMany(createPostsDto: CreateBlogPostDto[]): Promise<BlogPost[]> {
    const posts = this.postsRepository.create(createPostsDto);
    const savedPosts = await this.postsRepository.save(posts);
    try {
      await this.redisClient.del('posts'); // Invalidate cache when new posts are created
    } catch (err) {
      console.error(`Error invalidating cache: ${err.message}`);
    }
    return savedPosts;
  }

  async findAll(page: number, limit: number): Promise<BlogPost[]> {
    const cacheKey = `posts_${page}_${limit}`;
    let cachedPosts: string | null;

    try {
      cachedPosts = await this.redisClient.get(cacheKey);
    } catch (err) {
      console.error(`Error fetching from cache: ${err.message}`);
      cachedPosts = null;
    }

    if (cachedPosts) {
      return JSON.parse(cachedPosts);
    }

    const posts = await this.postsRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });

    try {
      const cacheTTL = process.env.CACHE_TTL || 3600;
      await this.redisClient.set(
        cacheKey,
        JSON.stringify(posts),
        'EX',
        cacheTTL,
      );
    } catch (err) {
      console.error(`Error setting cache: ${err.message}`);
    }

    return posts;
  }

  async findOne(id: number): Promise<BlogPost> {
    const cacheKey = `post_${id}`;
    let cachedPost: string | null;

    try {
      cachedPost = await this.redisClient.get(cacheKey);
    } catch (err) {
      console.error(`Error fetching from cache: ${err.message}`);
      cachedPost = null;
    }

    if (cachedPost) {
      return JSON.parse(cachedPost);
    }

    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    try {
      const cacheTTL = process.env.CACHE_TTL || 3600;
      await this.redisClient.set(
        cacheKey,
        JSON.stringify(post),
        'EX',
        cacheTTL,
      );
    } catch (err) {
      console.error(`Error setting cache: ${err.message}`);
    }

    return post;
  }
}
