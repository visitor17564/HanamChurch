import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { pool } from '../mssql';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

@Injectable()
export class BoardService {
  private pool;

  constructor() {
    this.pool = pool;
    this.checkConnection();
  }

  async checkConnection() {
    try {
      // For pool initialization, see above
      const [rows, fields] = await this.pool.query(
        'SELECT * FROM `organization`',
      );
      console.log(rows);
      console.log(fields);
      // Connection is automatically released when query resolves
    } catch (err) {
      console.log(err);
    }
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
    const response = '';
    return response;
  }

  async getClassBoard(checkedDate, gradeNum, classNum) {
    const response = '';
    return response;
  }
}
