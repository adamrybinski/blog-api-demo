import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BlogPostsService } from './blog-post.service';
import { CreateBlogPostDto } from './dto/create-BlogPost.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Blog Posts')
@Controller('v1/blog-posts')
export class BlogPostsController {
  constructor(private readonly postsService: BlogPostsService) {}

  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({
    status: 201,
    description: 'The blog post has been successfully created.',
  })
  @ApiBody({ type: CreateBlogPostDto })
  @Post()
  create(@Body() createPostDto: CreateBlogPostDto) {
    return this.postsService.create(createPostDto);
  }

  @ApiOperation({ summary: 'Create multiple blog posts' })
  @ApiResponse({
    status: 201,
    description: 'The blog posts have been successfully created.',
  })
  @ApiBody({
    type: [CreateBlogPostDto],
    examples: {
      example: {
        summary: 'A batch of blog posts',
        description: 'An array of blog posts to be created in bulk',
        value: [
          { title: 'Test Post 1', body: 'This is test post 1' },
          { title: 'Test Post 2', body: 'This is test post 2' },
          { title: 'Test Post 3', body: 'This is test post 3' },
          { title: 'Test Post 4', body: 'This is test post 4' },
          { title: 'Test Post 5', body: 'This is test post 5' },
        ],
      },
    },
  })
  @Post('bulk')
  createMany(@Body() createPostsDto: CreateBlogPostDto[]) {
    return this.postsService.createMany(createPostsDto);
  }

  @ApiOperation({ summary: 'Retrieve all blog posts with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({ status: 200, description: 'The list of blog posts' })
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.postsService.findAll(page, limit);
  }

  @ApiOperation({ summary: 'Retrieve a single blog post by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the blog post', example: 1 })
  @ApiResponse({ status: 200, description: 'The blog post with the given ID' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }
}
