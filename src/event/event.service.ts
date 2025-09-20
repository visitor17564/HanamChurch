import { Injectable } from '@nestjs/common';
import { pool } from '../mssql';
import * as fs from 'fs';

@Injectable()
export class EventService {
  private pool;

  constructor() {
    this.pool = pool;
    // this.checkConnection();
  }

  async checkConnection() {
    try {
      // For pool initialization, see above
      const [rows, fields] = await this.pool.query('SELECT * FROM `users`');
      console.log(rows, fields);
      // Connection is automatically released when query resolves
    } catch (err) {
      console.log(err);
    }
  }

  async getAllYearEvent(department: string, year: number) {
    try {
      const request = this.pool.request();
      request.input('year', year);
      request.input('department', department);
      const result = await request.query(`
        SELECT bc.id, bc.date, bc.board_check, o.grade, o.class, u.name 
        FROM [hanam-church-database].board_check bc 
          LEFT JOIN [hanam-church-database].organization o ON o.id = bc.organizationId
          LEFT JOIN [hanam-church-database].users u ON u.id = o.userId
        WHERE o.year = @year AND o.department = @department
      `);
      const rows = result.recordset;
      const response = {};
      rows.forEach((row) => {
        const date = this.formatDate(row.date);
        if (response[row.grade] === undefined) {
          response[row.grade] = {};
        }
        if (response[row.grade][row.class] === undefined) {
          response[row.grade][row.class] = {};
        }
        if (response[row.grade][row.class][row.name] === undefined) {
          response[row.grade][row.class][row.name] = {};
        }
        if (response[row.grade][row.class][row.name][date] === undefined) {
          response[row.grade][row.class][row.name][date] = {};
        }
        response[row.grade][row.class][row.name][date] = {
          id: row.id,
          check: row.board_check,
        };
      });
      return response;
    } catch (error) {
      console.error('Error fetching all board:', error);
      throw error;
    }
  }

  async getAllEvent() {
    // 모든 이벤트 가져오기
    try {
      const request = this.pool.request();
      const result = await request.query(
        `SELECT * FROM [hanam-church-database].event ORDER BY id DESC`,
      );
      return result.recordset;
    } catch (error) {
      console.error('Error fetching all board:', error);
      throw error;
    }
  }

  async getEvent(id: number) {
    // 특정 이벤트 가져오기
    try {
      const request = this.pool.request();
      request.input('id', id);
      const result = await request.query(`SELECT * FROM [hanam-church-database].event WHERE id = @id`);
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching all board:', error);
      throw error;
    }
  }

  async getEventHistory(eventId: number, organizationId: number) {
    // 개별 이벤트 히스토리 조회
    try {
      const request = this.pool.request();
      request.input('organizationId', organizationId);
      request.input('eventId', eventId);
      const result = await request.query(
        `SELECT ec.id, ec.event_check, ec.created_at, e.name, e.type, ec.date
         FROM [hanam-church-database].event_check ec
         LEFT JOIN [hanam-church-database].event e ON e.id = ec.event_id
         WHERE ec.organization_Id = @organizationId AND ec.event_id = @eventId AND ec.event_check = 1
         ORDER BY ec.date DESC`,
      );
      return result.recordset;
    } catch (error) {
      console.error('Error fetching all board:', error);
      throw error;
    }
  }

  async getClassMembers(gradeNum: number, classNum: number, checkedDate: Date) {
    const formattedDate = this.formatDate(checkedDate);
    const year = checkedDate.getFullYear();
    try {
      const request = this.pool.request();
      request.input('formattedDate', formattedDate);
      request.input('gradeNum', gradeNum);
      request.input('classNum', classNum);
      request.input('year', year);
      const result = await request.query(
        `SELECT u.id, u.name, u.gender, u.phone, u.birth, u.created_at, 
                o.id AS organizationId, o.year, o.department, o.grade, o.class, o.role, o.school, o.is_on_list, o.is_new, o.follow, 
                bc.id AS checkId, bc.board_check, bc.checkerId,
                c.id AS commentId, c.comment,
                ec.id AS eventId, ec.event_check,
                e.name AS eventName, e.type AS eventType
         FROM [hanam-church-database].organization o
         LEFT JOIN [hanam-church-database].users u ON o.userId = u.id
         LEFT JOIN [hanam-church-database].board_check bc ON bc.organizationId = o.id AND bc.date = @formattedDate
         LEFT JOIN [hanam-church-database].comments c ON c.organizationId = o.id
         LEFT JOIN [hanam-church-database].event_check ec ON ec.organization_Id = o.id
         LEFT JOIN [hanam-church-database].event e ON e.id = ec.event_id AND e.active = 1
         WHERE o.grade = @gradeNum AND o.class = @classNum AND o.year = @year`,
      );
      const response = result.recordset;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }

  async addUserFromCsv() {
    fs.readFile('list.csv', 'utf8', async (err, data) => {
      const rowToData = data.split(/\r?\n/);
      // rowToData.length - 1;
      for (let e = 0; e < rowToData.length - 1; e++) {
        const dataToKey = rowToData[e].split(',');
        // const dataObject = {};
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
          const request1 = this.pool.request();
          request1.input('name', name);
          request1.input('gender', gender);
          const userResult = await request1.query(
            'INSERT INTO [hanam-church-database].users (name, gender) OUTPUT INSERTED.id VALUES (@name, @gender)',
          );
          userId = userResult.recordset[0].id;
        } catch (error) {
          console.error('Error inserting user:', error);
          throw error;
        }

        try {
          const request2 = this.pool.request();
          request2.input('userId', userId);
          request2.input('grade', grade);
          request2.input('classNum', classNum);
          request2.input('isOnList', isOnList);
          await request2.query(
            "INSERT INTO [hanam-church-database].organization (userId, grade, class, year, department, role, is_on_list) VALUES (@userId, @grade, @classNum, 2025, N'고등부', 0, @isOnList)",
          );
        } catch (error) {
          console.error('Error inserting organization:', error);
          throw error;
        }
      }
    });
  }

  async getUser(name: string, grade: number, classNum: number) {
    try {
      const request = this.pool.request();
      request.input('name', name);
      request.input('grade', grade);
      request.input('classNum', classNum);
      const result = await request.query(
        `SELECT *
         FROM [hanam-church-database].users u
         JOIN [hanam-church-database].organization o ON o.userId = u.id
         WHERE u.name = @name AND o.grade = @grade AND o.class = @classNum`,
      );
      return result.recordset;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      throw error;
    }
  }

  async updateEvent(
    eventCheckId: number,
    eventId: number,
    organizationId: number,
    content: number | null,
    date: Date,
  ) {
    const response = {
      id: 0,
      content: 0,
    };
    try {
      const request1 = this.pool.request();
      request1.input('eventCheckId', eventCheckId);
      const result = await request1.query(
        `SELECT * FROM [hanam-church-database].event_check WHERE id = @eventCheckId`,
      );
      const rows = result.recordset;
      
      if (rows.length > 0) {
        const request2 = this.pool.request();
        request2.input('content', content);
        request2.input('eventCheckId', eventCheckId);
        await request2.query(
          `UPDATE [hanam-church-database].event_check
           SET event_check = @content, checker_id = 0, updated_at = GETDATE()
           WHERE id = @eventCheckId`,
        );
        response.id = eventCheckId;
        response.content = content;
      } else {
        const request3 = this.pool.request();
        request3.input('eventId', eventId);
        request3.input('organizationId', organizationId);
        request3.input('content', content);
        request3.input('date', date);
        const insertResult = await request3.query(
          `INSERT INTO [hanam-church-database].event_check (event_id, organization_Id, event_check, checker_id, date, created_at)
           OUTPUT INSERTED.id
           VALUES (@eventId, @organizationId, @content, 0, @date, GETDATE())`,
        );
        response.id = insertResult.recordset[0].id;
        response.content = content;
      }
      return response;
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  }

  async makeEvent(
    eventId: number,
    organizationId: number,
    content: number | null,
    date: Date,
  ) {
    const existEvent = await this.checkExistEventCheck(
      eventId,
      organizationId,
      date,
    );

    const response = {
      id: 0,
      content: 0,
    };

    if (existEvent.result) {
      const eventCheckId = existEvent.id;
      return this.updateEvent(
        eventCheckId,
        eventId,
        organizationId,
        content,
        date,
      );
    }
    try {
      const request = this.pool.request();
      request.input('eventId', eventId);
      request.input('organizationId', organizationId);
      request.input('content', content);
      request.input('date', date);
      const insertResult = await request.query(
        `INSERT INTO [hanam-church-database].event_check (event_id, organization_Id, event_check, checker_id, date, created_at)
         OUTPUT INSERTED.id
         VALUES (@eventId, @organizationId, @content, 0, @date, GETDATE())`,
      );

      response.id = insertResult.recordset[0].id;
      response.content = content;

      return response;
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async checkAttendance(checkId: number) {
    try {
      const request1 = this.pool.request();
      request1.input('checkId', checkId);
      const result = await request1.query(
        `SELECT board_check, organizationId FROM [hanam-church-database].board_check WHERE id = @checkId`,
      );
      const rows = result.recordset;
      
      if (rows.length > 0) {
        let resultValue = 1;
        if (rows[0].board_check === true || rows[0].board_check === 1) {
          resultValue = 0;
        }
        
        const request2 = this.pool.request();
        request2.input('result', resultValue);
        request2.input('checkId', checkId);
        await request2.query(
          `UPDATE [hanam-church-database].board_check SET board_check = @result WHERE id = @checkId`,
        );

        const organizationId = rows[0].organizationId;
        const checkCount = await this.checkCount(organizationId);
        const isNew = await this.checkIsNew(organizationId);
        if (checkCount === 5 && isNew === 1) {
          await this.updateIsOnList(organizationId, 1);
        } else if (checkCount === 4 && isNew === 1 && resultValue === 0) {
          await this.updateIsOnList(organizationId, 0);
        }

        return resultValue;
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
      throw error;
    }
  }

  async checkCount(organizationId: number) {
    // organizationId의 2024년 전체 출석 합계를 조회합니다.
    const request = this.pool.request();
    request.input('organizationId', organizationId);
    const result = await request.query(
      `SELECT COUNT(*) as count
       FROM [hanam-church-database].board_check
       WHERE organizationId = @organizationId AND board_check = 1`,
    );

    return result.recordset[0].count;
  }

  async updateIsOnList(organizationId: number, state: number) {
    const request = this.pool.request();
    request.input('state', state);
    request.input('organizationId', organizationId);
    await request.query(
      `UPDATE [hanam-church-database].organization SET is_on_list = @state WHERE id = @organizationId`,
    );
  }

  async checkIsNew(organizationId: number) {
    const request = this.pool.request();
    request.input('organizationId', organizationId);
    const result = await request.query(
      `SELECT is_new FROM [hanam-church-database].organization WHERE id = @organizationId`,
    );
    return result.recordset[0].is_new;
  }

  async checkExistEventCheck(
    eventId: number,
    organizationId: number,
    date: Date,
  ) {
    const result = {
      id: null,
      result: false,
    };
    const request = this.pool.request();
    request.input('eventId', eventId);
    request.input('organizationId', organizationId);
    request.input('date', date);
    const queryResult = await request.query(
      `SELECT id FROM [hanam-church-database].event_check
       WHERE event_id = @eventId AND organization_Id = @organizationId AND date = @date`,
    );
    const rows = queryResult.recordset;
    
    if (rows.length > 0) {
      const id = rows[0].id;
      result.id = id;
      result.result = true;
      return result;
    } else {
      return result;
    }
  }

  // 이벤트 명단 조회
  async getStudentEvent(eventId: number) {
    try {
      const request = this.pool.request();
      request.input('eventId1', eventId);
      request.input('eventId2', eventId);
      const result = await request.query(
        `SELECT 
           u.id,
           u.name,
           u.gender,
           u.phone,
           u.birth,
           u.created_at,
           o.id AS organizationId,
           o.year,
           o.department,
           o.grade,
           o.class,
           o.role,
           o.school,
           o.is_on_list,
           o.is_new,
           o.follow,
           c.id AS commentId,
           c.comment,
           (SELECT COUNT(*) 
            FROM [hanam-church-database].event_check 
            WHERE event_check = 1 AND organization_Id = o.id AND event_id = @eventId1) AS event_check_count
         FROM [hanam-church-database].organization o
         INNER JOIN [hanam-church-database].event_check ec ON ec.organization_Id = o.id 
                                   AND ec.event_id = @eventId2 
                                   AND ec.event_check = 1
         LEFT JOIN [hanam-church-database].users u ON u.id = o.userId
         LEFT JOIN [hanam-church-database].comments c ON c.organizationId = o.id
         GROUP BY o.id, u.id, u.name, u.gender, u.phone, u.birth, u.created_at,
                  o.year, o.department, o.grade, o.class, o.role, o.school, 
                  o.is_on_list, o.is_new, o.follow, c.id, c.comment
         ORDER BY event_check_count DESC`,
      );
      const response = result.recordset;
      return response;
    } catch (error) {
      console.error('Error fetching event students:', error);
      throw error;
    }
  }
}
