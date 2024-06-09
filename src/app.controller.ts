import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<QueryDatabaseResponse> {
    return this.appService.getStudentById();
  }
}
