import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { BlogPost } from './blog-posts/entities/BlogPost.entity';
import { BlogPostsModule } from './blog-posts/blog-post.module';
import { RedisModule } from './redis/redis.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'blog',
      entities: [BlogPost],
      synchronize: true,
    }),
    RedisModule,
    BlogPostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
