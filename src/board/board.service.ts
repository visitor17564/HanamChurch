import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { pool } from '../mssql';
import * as fs from 'fs';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

@Injectable()
export class BoardService {
  private pool;

  constructor() {
    this.pool = pool;
  }

  async checkConnection() {
    try {
      // For pool initialization, see above
      const [rows, fields] = await this.pool.query(
        'SELECT * FROM `organization`',
      );
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

  async addUserFromCsv() {
    fs.readFile('list.csv', 'utf8', async (err, data) => {
      const rowToData = data.split(/\r?\n/);
      // rowToData.length - 1;
      for (let e = 0; e < rowToData.length - 1; e++) {
        const dataToKey = rowToData[e].split(',');
        const dataObject = {};
        // 데이터 분석
        const grade = parseInt(dataToKey[0]);
        const classNum = parseInt(dataToKey[1]);
        let gender = 0;
        if (
          (grade === 1 && classNum > 3) ||
          (grade === 2 && classNum > 2) ||
          (grade === 3 && classNum > 1)
        ) {
          gender = 1;
        }
        const name = dataToKey[2];
        const isOnList = dataToKey[3].toUpperCase() === 'TRUE' ? 1 : 0;
        // 데이터베이스에 추가
        let userId;
        try {
          const [result] = await this.pool.execute(
            'INSERT INTO users (name, gender) VALUES (?, ?)',
            [name, gender],
          );
          userId = result.insertId;
        } catch (error) {
          console.error('Error inserting user:', error);
          throw error;
        }

        try {
          const [result] = await this.pool.execute(
            'INSERT INTO organization (userId, grade, class, year, department, role, is_on_list) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, grade, classNum, 2024, '고등부', 0, isOnList],
          );
        } catch (error) {
          console.error('Error inserting user:', error);
          throw error;
        }
      }
    });
  }

  async addBoardFromCsv() {
    fs.readFile('board.csv', 'utf8', async (err, data) => {
      const rowToData = data.split(/\r?\n/);

      // 비동기문제고 dateArray를 따로 만들어서 해결
      const dateArray = [];
      const date = new Date('2024-1-7');
      const lastDate = new Date('2024-12-31');

      while (date <= lastDate) {
        dateArray.push(new Date(date)); // 새로운 Date 객체를 배열에 추가
        date.setDate(date.getDate() + 7);
      }
      const christmas = new Date(2024, 11, 25);
      dateArray.push(christmas);

      for (let e = 0; e < rowToData.length - 1; e++) {
        const dataToKey = rowToData[e].split(',');
        const grade = parseInt(dataToKey[0]);
        const classNum = parseInt(dataToKey[1]);
        const name = dataToKey[2];
        const user = await this.getUser(name, grade, classNum);
        const organizationId = user[0].id;
        for (let a = 3; a < dataToKey.length; a++) {
          const check = dataToKey[a].toUpperCase() === 'TRUE' ? 1 : 0;
          this.checkBoard(organizationId, dateArray[a - 3], check, null);
        }
      }
    });
  }

  async getUser(name: string, grade: number, classNum: number) {
    try {
      const [rows] = await this.pool.execute(
        `SELECT *
         FROM users u
         JOIN organization o ON o.userId = u.id
         WHERE u.name = ? AND o.grade = ? AND o.class = ?`,
        [name, grade, classNum],
      );
      return rows;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      throw error;
    }
  }

  async checkBoard(
    organizationId: number,
    date: Date,
    check: number,
    checkerId: number,
  ) {
    try {
      const [rows] = await this.pool.execute(
        `SELECT *
         FROM board_check
         WHERE organizationId = ? AND date = ?`,
        [organizationId, date],
      );
      if (rows.length > 0) {
        await this.pool.execute(
          `UPDATE board_check
           SET board_check = ?, checkerId = ?
           WHERE organizationId = ? AND date = ?`,
          [check, checkerId, organizationId, date],
        );
      } else {
        await this.pool.execute(
          `INSERT INTO board_check (organizationId, date, board_check, checkerId)
           VALUES (?, ?, ?, ?)`,
          [organizationId, date, check, checkerId],
        );
      }
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  }
}
