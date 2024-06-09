import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities/BlogPost.entity';
import { BlogPostsService } from './blog-post.service';
import { BlogPostsController } from './blog-post.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost])],
  providers: [BlogPostsService],
  controllers: [BlogPostsController],
})
export class BlogPostsModule {}
