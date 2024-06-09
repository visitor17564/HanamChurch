import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@notionhq/client';

@Injectable()
export class AppService {
  private notion: Client;

  constructor(private configService: ConfigService) {
    this.notion = new Client({
      auth: this.configService.get('NOTION_API_KEY'),
    });
  }
  getHello(): string {
    // console.log(this.configService.get('NOTION_API_KEY'));
    return 'Hello World!';
  }

  async getStudentById() {
    const databaseId = this.configService.get('NOTION_PEOPLE_DATABASE_ID');
    const response = await this.notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'id',
        unique_id: {
          equals: 1,
        },
      },
    });

    return response;
  }
}
