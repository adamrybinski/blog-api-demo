# Blog API

This project implements a Blog API using NestJS, TypeORM with PostgreSQL, Redis caching, and Swagger for API documentation.

## Setup for Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or Yarn
- Docker and Docker Compose

### Installation

1. **Clone the repository:**

```sh
git clone https://github.com/yourusername/blog-api.git
cd blog-api
```

2. **Install dependencies:**

```sh
npm install
```

3. **Configure environment variables:**

Create a `.env` file in the root of the project with the following content:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=blog
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. **Run PostgreSQL and Redis using Docker Compose:**

```sh
npm run start:db
```

5. **Start the application:**

```sh
npm run start:dev
```

The application will be running on `http://localhost:3000`. Swagger documentation is available at `http://localhost:3000/api`.

### Objectives

#### 1. Set up API endpoints for creating and retrieving blog posts

- Endpoints for creating a single post, bulk creation, retrieving all posts with pagination, and retrieving a single post by ID.

#### 2. Implement Redis caching to enhance read performance

- Redis caching implemented in the `PostsService`.

#### 3. Ensure data integrity and security

- **ValidationPipe**: Global validation of incoming requests.
- **Class-validator**: Validation rules in DTOs.

#### 4. Provide input validation

- DTOs with validation using `class-validator`.

#### 5. Generate API documentation using Swagger

- Swagger documentation setup using `@nestjs/swagger`.

#### 6. Implement unit and integration tests

- Comprehensive unit and integration tests for services and controllers.

#### 7. Follow best practices for code quality and efficient use of technologies

- Modular architecture, TypeORM for database interactions, Redis for caching, and comprehensive testing.

### Naming Conventions

- **Classes (DTOs, Controllers, Entities, Services)**: PascalCase
  - Example: `CreateBlogPostDto`, `BlogPostsController`, `BlogPost`, `BlogPostsService`
- **Filenames**: kebab-case
  - Example: `create-blog-post.dto.ts`, `blog-posts.controller.ts`, `blog-post.entity.ts`, `blog-posts.service.ts`
- **Endpoints**: Plural nouns for collections
  - Example: `/v1/blog-posts`
