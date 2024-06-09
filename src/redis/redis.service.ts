import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis.Redis;

  onModuleInit() {
    this.client = new Redis.default({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    });
  }

  getClient(): Redis.Redis {
    return this.client;
  }
}
