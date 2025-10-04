import { Injectable } from '@nestjs/common';
import { pool } from '../mssql';
import * as fs from 'fs';

@Injectable()
export class BoardService {
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

  async getAllYearBoard(department: string, year: number) {
    try {
      const request = this.pool.request();
      request.input('year', year);
      request.input('department', department);
      const result = await request.query(
        `SELECT bc.id, bc.date, bc.board_check, o.grade, o.class, u.name 
         FROM [hanam-church-database].board_check bc 
           LEFT JOIN [hanam-church-database].organization o ON o.id = bc.organizationId
           LEFT JOIN [hanam-church-database].users u ON u.id = o.userId
         WHERE o.year = @year AND o.department = @department`,
      );
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

  async getAllBoard(checkedDate: Date) {
    const formattedDate = this.formatDate(checkedDate);
    const year = checkedDate.getFullYear();
    try {
      const request = this.pool.request();
      request.input('formattedDate', formattedDate);
      request.input('year', year);
      const result = await request.query(
        `SELECT o.grade, o.class, o.is_on_list, bc.board_check, u.gender
         FROM [hanam-church-database].organization o
         LEFT JOIN [hanam-church-database].board_check bc ON bc.organizationId = o.id AND bc.date = @formattedDate
         LEFT JOIN [hanam-church-database].users u ON o.userId = u.id
         WHERE o.year = @year AND o.department = N'고등부'`,
      );
      const rows = result.recordset;
      const response = {
        totalCount: {
          totalCount: 0,
          onListCount: {
            maleCount: 0,
            femaleCount: 0,
            totalCount: 0,
          },
          newListCount: {
            maleCount: 0,
            femaleCount: 0,
            totalCount: 0,
          },
          1: {
            1: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            2: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            3: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            4: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            5: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            6: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
          },
          2: {
            1: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            2: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            3: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            4: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            5: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
          },
          3: {
            1: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            2: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            3: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            4: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
          },
        },
        checkedCount: {
          totalCount: 0,
          onListCount: {
            maleCount: 0,
            femaleCount: 0,
            totalCount: 0,
          },
          newListCount: {
            maleCount: 0,
            femaleCount: 0,
            totalCount: 0,
          },
          1: {
            1: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            2: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            3: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            4: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            5: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            6: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
          },
          2: {
            1: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            2: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            3: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            4: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            5: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
          },
          3: {
            1: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            2: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            3: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
            4: {
              totalCount: 0,
              onListCount: 0,
              newListCount: 0,
            },
          },
        },
      };
      rows.forEach((row) => {
        if (
          row.board_check !== null &&
          (row.board_check === true || row.board_check === 1)
        ) {
          response['checkedCount']['totalCount'] += 1;
          response['checkedCount'][row.grade][row.class]['totalCount'] += 1;
          if (row.is_on_list === true || row.is_on_list === 1) {
            response['checkedCount'][row.grade][row.class]['onListCount'] += 1;
            response['checkedCount']['onListCount']['totalCount'] += 1;
            if (row.gender === true || row.gender === 1) {
              response['checkedCount']['onListCount']['maleCount'] += 1;
            } else {
              response['checkedCount']['onListCount']['femaleCount'] += 1;
            }
          } else {
            response['checkedCount'][row.grade][row.class]['newListCount'] += 1;
            response['checkedCount']['newListCount']['totalCount'] += 1;
            if (row.gender === true || row.gender === 1) {
              response['checkedCount']['newListCount']['maleCount'] += 1;
            } else {
              response['checkedCount']['newListCount']['femaleCount'] += 1;
            }
          }
        }
        response['totalCount']['totalCount'] += 1;
        response['totalCount'][row.grade][row.class]['totalCount'] += 1;
        if (row.is_on_list === true || row.is_on_list === 1) {
          response['totalCount'][row.grade][row.class]['onListCount'] += 1;
          response['totalCount']['onListCount']['totalCount'] += 1;
          if (row.gender === true || row.gender === 1) {
            response['totalCount']['onListCount']['maleCount'] += 1;
          } else {
            response['totalCount']['onListCount']['femaleCount'] += 1;
          }
        } else {
          response['totalCount'][row.grade][row.class]['newListCount'] += 1;
          response['totalCount']['newListCount']['totalCount'] += 1;
          if (row.gender === true || row.gender === 1) {
            response['totalCount']['newListCount']['maleCount'] += 1;
          } else {
            response['totalCount']['newListCount']['femaleCount'] += 1;
          }
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching all board:', error);
      throw error;
    }
  }

  async getBoard(checkedDate: Date, gradeNumber: number, classNumber: number) {
    // 모든 학생 리스트 가져오기
    const classMembers = await this.getClassMembers(
      gradeNumber,
      classNumber,
      checkedDate,
    );

    // classBoard의 id값을 배열로 만듭니다.
    return classMembers;
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

      // 🚀 성능 개선: 단일 쿼리로 모든 데이터 조회
      const result = await request.query(
        `SELECT 
           u.id, u.name, u.gender, u.phone, u.birth, u.created_at, 
           o.id AS organizationId, o.year, o.department, o.grade, o.class, o.role, o.school, o.is_on_list, o.is_new, o.follow, 
           bc.id AS checkId, bc.board_check, bc.checkerId,
           c.id AS commentId, c.comment,
           e.id AS eventId, e.name AS eventName, e.type AS eventType, e.active,
           ec.id AS eventCheckId, ec.event_check
         FROM [hanam-church-database].organization o
         LEFT JOIN [hanam-church-database].users u ON o.userId = u.id
         LEFT JOIN [hanam-church-database].board_check bc ON bc.organizationId = o.id AND bc.date = @formattedDate
         LEFT JOIN [hanam-church-database].comments c ON c.organizationId = o.id
         LEFT JOIN [hanam-church-database].event_check ec ON ec.organization_Id = o.id AND ec.date = @formattedDate
         LEFT JOIN [hanam-church-database].event e ON e.id = ec.event_id AND e.active = 1
         WHERE o.grade = @gradeNum AND o.class = @classNum AND o.year = @year
         ORDER BY o.id, e.id`,
      );

      // 🔧 결과 데이터 재구성: 학생별로 이벤트 정보 그룹핑
      const studentMap = new Map();

      result.recordset.forEach((row) => {
        const studentId = row.organizationId;

        // 학생 정보가 아직 없으면 생성
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: row.id,
            name: row.name,
            gender: row.gender,
            phone: row.phone,
            birth: row.birth,
            created_at: row.created_at,
            organizationId: row.organizationId,
            year: row.year,
            department: row.department,
            grade: row.grade,
            class: row.class,
            role: row.role,
            school: row.school,
            is_on_list: row.is_on_list,
            is_new: row.is_new,
            follow: row.follow,
            checkId: row.checkId,
            board_check: row.board_check,
            checkerId: row.checkerId,
            commentId: row.commentId,
            comment: row.comment,
            event: [],
          });
        }

        // 이벤트 정보가 있으면 추가
        if (row.eventId) {
          const student = studentMap.get(studentId);
          const existingEvent = student.event.find((e) => e.id === row.eventId);

          if (!existingEvent) {
            student.event.push({
              id: row.eventId,
              name: row.eventName,
              type: row.eventType,
              eventCheckId: row.eventCheckId || 0,
              check: row.event_check || 0,
            });
          }
        }
      });

      // 🎯 활성 이벤트 중 체크되지 않은 이벤트도 추가
      const activeEventsRequest = this.pool.request();
      const activeEventsResult = await activeEventsRequest.query(
        `SELECT id, name, type FROM [hanam-church-database].event WHERE active = 1`,
      );

      studentMap.forEach((student) => {
        activeEventsResult.recordset.forEach((activeEvent) => {
          const existingEvent = student.event.find(
            (e) => e.id === activeEvent.id,
          );
          if (!existingEvent) {
            student.event.push({
              id: activeEvent.id,
              name: activeEvent.name,
              type: activeEvent.type,
              eventCheckId: 0,
              check: 0,
            });
          }
        });
      });

      return Array.from(studentMap.values());
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

  async checkBoard(
    organizationId: number,
    date: Date,
    check: number,
    checkerId: number,
  ) {
    try {
      const request1 = this.pool.request();
      request1.input('organizationId', organizationId);
      request1.input('date', date);
      const result = await request1.query(
        `SELECT * FROM [hanam-church-database].board_check WHERE organizationId = @organizationId AND date = @date`,
      );
      const rows = result.recordset;

      if (rows.length > 0) {
        const request2 = this.pool.request();
        request2.input('check', check);
        request2.input('checkerId', checkerId);
        request2.input('organizationId', organizationId);
        request2.input('date', date);
        await request2.query(
          `UPDATE [hanam-church-database].board_check
           SET board_check = @check, checkerId = @checkerId
           WHERE organizationId = @organizationId AND date = @date`,
        );
      } else {
        const request3 = this.pool.request();
        request3.input('organizationId', organizationId);
        request3.input('date', date);
        request3.input('check', check);
        request3.input('checkerId', checkerId);
        await request3.query(
          `INSERT INTO [hanam-church-database].board_check (organizationId, date, board_check, checkerId)
           VALUES (@organizationId, @date, @check, @checkerId)`,
        );
      }
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  }

  async makeAttendance(
    organizationId: number,
    date: Date,
    checkId: number | null,
  ) {
    const existAttendance = await this.checkExistAttandance(
      organizationId,
      date,
    );
    if (existAttendance.result) {
      return existAttendance.id;
    }
    let checkerId = null;
    if (checkId) {
      checkerId = checkId;
    }
    try {
      const request = this.pool.request();
      request.input('organizationId', organizationId);
      request.input('date', date);
      request.input('checkerId', checkerId);
      const result = await request.query(
        `INSERT INTO [hanam-church-database].board_check (organizationId, date, board_check, checkerId)
         OUTPUT INSERTED.id
         VALUES (@organizationId, @date, 1, @checkerId)`,
      );

      const checkCount = await this.checkCount(organizationId);
      const isNew = await this.checkIsNew(organizationId);

      if (checkCount === 5 && isNew === 1) {
        await this.updateIsOnList(organizationId, 1);
      }

      return result.recordset[0].id;
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

  async checkExistAttandance(organizationId: number, date: Date) {
    const result = {
      id: null,
      result: false,
    };
    const request = this.pool.request();
    request.input('organizationId', organizationId);
    request.input('date', date);
    const queryResult = await request.query(
      `SELECT id, board_check FROM [hanam-church-database].board_check
       WHERE organizationId = @organizationId AND date = @date`,
    );
    const rows = queryResult.recordset;

    if (rows.length > 0) {
      const boardCheck = rows[0].board_check;
      const id = rows[0].id;
      if (boardCheck === true || boardCheck === 1) {
        result.id = id;
        result.result = true;
        return result;
      } else {
        try {
          const updateRequest = this.pool.request();
          updateRequest.input('id', id);
          await updateRequest.query(
            `UPDATE [hanam-church-database].board_check SET board_check = 1 WHERE id = @id`,
          );
          result.id = id;
          result.result = true;
          return result;
        } catch (error) {
          console.error('Error updating board:', error);
          throw error;
        }
      }
    } else {
      return result;
    }
  }

  // 새친구 조회
  async getNewStudent(year: number, department: string) {
    try {
      const request = this.pool.request();
      request.input('year', year);
      request.input('department', department);
      const result = await request.query(
        `SELECT u.id, u.name, u.gender, u.phone, u.birth, u.created_at, 
            o.id AS organizationId, o.year, o.department, o.grade, o.class, o.role, o.school, o.is_on_list, o.is_new, o.follow, 
            c.id AS commentId, c.comment,
            (SELECT COUNT(*) FROM [hanam-church-database].board_check WHERE board_check = 1 AND organizationId = o.id) AS attendance_count
         FROM [hanam-church-database].organization o
         LEFT JOIN [hanam-church-database].users u ON o.userId = u.id
         LEFT JOIN [hanam-church-database].comments c ON c.organizationId = o.id
         WHERE o.year = @year AND o.department = @department
         ORDER BY o.grade, o.class, u.name`,
      );
      const rows = result.recordset;
      const response = rows.filter(
        (row) => row.is_new === true || row.is_new === 1,
      );
      return response;
    } catch (error) {
      console.error('Error fetching new students:', error);
      throw error;
    }
  }
}
