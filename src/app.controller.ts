import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import type { IResponse } from './interfaces/index.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  health(): IResponse {
    console.log('HEALTH-CONTROLLER');
    return this.appService.health();
  }
}
