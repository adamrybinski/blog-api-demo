import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBlogPostDto {
  @ApiProperty({
    description: 'The title of the blog post',
    example: 'An interesting blog post',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The body content of the blog post',
    example: 'This is the content of the blog post',
  })
  @IsString()
  body: string;
}
