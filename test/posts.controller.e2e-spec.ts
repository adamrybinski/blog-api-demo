import { CreateBlogPostDto } from '../src/blog-posts/dto/create-BlogPost.dto';
import { BlogPost } from '../src/blog-posts/entities/BlogPost.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let postRepository: Repository<BlogPost>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    postRepository = moduleFixture.get<Repository<BlogPost>>(
      getRepositoryToken(BlogPost),
    );
  });

  afterAll(async () => {
    await postRepository.clear();
    await app.close();
  });

  afterEach(async () => {
    await postRepository.clear();
  });

  it('/v1/blog-posts (POST) should create a single post', async () => {
    const createPostDto: CreateBlogPostDto = {
      title: 'Test Post',
      body: 'This is a test post',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/blog-posts')
      .send(createPostDto)
      .expect(201);

    expect(response.body).toMatchObject(createPostDto);
  });

  it('/v1/blog-posts/bulk (POST) should create multiple posts', async () => {
    const createPostsDto: CreateBlogPostDto[] = [
      { title: 'Test Post 1', body: 'This is test post 1' },
      { title: 'Test Post 2', body: 'This is test post 2' },
    ];

    const response = await request(app.getHttpServer())
      .post('/v1/blog-posts/bulk')
      .send(createPostsDto)
      .expect(201);

    expect(response.body.length).toBe(2);
    expect(response.body[0]).toMatchObject(createPostsDto[0]);
    expect(response.body[1]).toMatchObject(createPostsDto[1]);
  });

  it('/v1/blog-posts (GET) should return all posts with pagination', async () => {
    await postRepository.save([
      { title: 'Post 1', body: 'Content 1' },
      { title: 'Post 2', body: 'Content 2' },
      { title: 'Post 3', body: 'Content 3' },
    ]);

    const response = await request(app.getHttpServer())
      .get('/v1/blog-posts')
      .query({ page: 1, limit: 2 })
      .expect(200);

    expect(response.body.length).toBe(2);
  });

  it('/v1/blog-posts/:id (GET) should return a single post by ID', async () => {
    const savedPost = await postRepository.save({
      title: 'Post 1',
      body: 'Content 1',
    });

    const response = await request(app.getHttpServer())
      .get(`/v1/blog-posts/${savedPost.id}`)
      .expect(200);

    expect(response.body).toMatchObject({ title: 'Post 1', body: 'Content 1' });
  });

  it('/v1/blog-posts/:id (GET) should return 404 for non-existent post', async () => {
    await request(app.getHttpServer()).get('/v1/blog-posts/9999').expect(404);
  });
});
