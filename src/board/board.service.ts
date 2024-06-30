import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { promises } from 'dns';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

@Injectable()
export class BoardService {
  private studentsDatabaseId: string;
  private checkDatabaseId: string;
  private commentsDatabaseId: string;

  constructor() {
    this.studentsDatabaseId = process.env.NOTION_STUDENTS_DATABASE_ID;
    this.checkDatabaseId = process.env.NOTION_CHECK_DATABASE_ID;
    this.commentsDatabaseId = process.env.NOTION_COMMENTS_DATABASE_ID;
  }

  async getBoard(
    checkedDate: string,
    gradeNumber: number,
    classNumber: number,
  ) {
    // 모든 학생 리스트 가져오기
    const classMembers = await this.getClassMembers(gradeNumber, classNumber);
    const classBoard = await this.getClassBoard(
      checkedDate,
      gradeNumber,
      classNumber,
    );
    // classBoard의 id값을 배열로 만듭니다.
    const result = [];
    result.push(classMembers);
    result.push(classBoard);

    return result;
  }

  async getClassMembers(gradeNum, classNum) {
    const response = await notion.databases.query({
      database_id: this.studentsDatabaseId,
      filter: {
        and: [
          {
            property: 'grade',
            select: {
              equals: gradeNum,
            },
          },
          {
            property: 'class',
            select: {
              equals: classNum,
            },
          },
        ],
      },
    });
    return response.results;
  }

  async getClassBoard(checkedDate, gradeNum, classNum) {
    const response = await notion.databases.query({
      database_id: this.checkDatabaseId,
      filter: {
        and: [
          {
            property: 'grade',
            rollup: {
              any: {
                select: {
                  equals: gradeNum,
                },
              },
            },
          },
          {
            property: 'class',
            rollup: {
              any: {
                select: {
                  equals: gradeNum,
                },
              },
            },
          },
          {
            property: 'date',
            date: {
              equals: checkedDate,
            },
          },
        ],
      },
    });
    return response.results;
  }
}
