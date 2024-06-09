import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getExample(): string {
    throw new Error('Method not implemented.');
  }
  getHello(): string {
    return 'Hello! The Blog API is up and running!';
  }

  healthCheck(): { status: string } {
    return { status: 'OK' };
  }
}
