import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck(): { status: string } {
    return this.appService.healthCheck();
  }

  @ApiOperation({ summary: 'Get example data' })
  @ApiResponse({ status: 200, description: 'Success' })
  getExample(): string {
    return this.appService.getExample();
  }
}
