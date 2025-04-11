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
      const [rows] = await this.pool.execute(
        `
        select bc.id, bc.date, bc.board_check, o.grade, o.class, u.name from board_check bc 
          left join organization o 
            on o.id = bc.organizationId
          left join users u
            on u.id = o.userId
          where o.year = ?
          and o.department = ?
        `,
        [year, department],
      );
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
      const [rows] = await this.pool.execute(
        `SELECT o.grade, o.class, o.is_on_list, bc.board_check, u.gender
          FROM organization o
          LEFT JOIN board_check bc ON bc.organizationId = o.id AND bc.date = ?
          LEFT JOIN users u ON o.userId = u.id
          WHERE o.year = ? AND o.department = '고등부'
        `,
        [formattedDate, year],
      );
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
        if (row.board_check !== null && row.board_check[0] === 1) {
          response['checkedCount']['totalCount'] += 1;
          response['checkedCount'][row.grade][row.class]['totalCount'] += 1;
          if (row.is_on_list[0] === 1) {
            response['checkedCount'][row.grade][row.class]['onListCount'] += 1;
            response['checkedCount']['onListCount']['totalCount'] += 1;
            if (row.gender[0] === 1) {
              response['checkedCount']['onListCount']['maleCount'] += 1;
            } else {
              response['checkedCount']['onListCount']['femaleCount'] += 1;
            }
          } else {
            response['checkedCount'][row.grade][row.class]['newListCount'] += 1;
            response['checkedCount']['newListCount']['totalCount'] += 1;
            if (row.gender[0] === 1) {
              response['checkedCount']['newListCount']['maleCount'] += 1;
            } else {
              response['checkedCount']['newListCount']['femaleCount'] += 1;
            }
          }
        }
        response['totalCount']['totalCount'] += 1;
        response['totalCount'][row.grade][row.class]['totalCount'] += 1;
        if (row.is_on_list[0] === 1) {
          response['totalCount'][row.grade][row.class]['onListCount'] += 1;
          response['totalCount']['onListCount']['totalCount'] += 1;
          if (row.gender[0] === 1) {
            response['totalCount']['onListCount']['maleCount'] += 1;
          } else {
            response['totalCount']['onListCount']['femaleCount'] += 1;
          }
        } else {
          response['totalCount'][row.grade][row.class]['newListCount'] += 1;
          response['totalCount']['newListCount']['totalCount'] += 1;
          if (row.gender[0] === 1) {
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
      const [rows] = await this.pool.execute(
        `SELECT u.id, u.name, u.gender, u.phone, u.birth, u.created_at, 
                o.id AS organizationId, o.year, o.department, o.grade, o.class, o.role, o.school, o.is_on_list, o.is_new, o.follow, 
                bc.id AS checkId, bc.board_check, bc.checkerId,
                c.id AS commentId, c.comment
         FROM organization o
         LEFT JOIN users u ON o.userId = u.id
         LEFT JOIN board_check bc ON bc.organizationId = o.id AND bc.date = ?
         LEFT JOIN comments c ON c.organizationId = o.id
         WHERE o.grade = ? AND o.class = ?
         and o.year = ?`,
        [formattedDate, gradeNum, classNum, year],
      );
      const response = rows;

      const [activeEvent] = await this.pool.execute(
        `SELECT e.id, e.name, e.type
         FROM event e
         WHERE e.active = 1`,
      );

      // response를 순회하며 eventId가 null인 경우를 처리합니다.
      for (const row of response) {
        row.event = [];
        if (activeEvent.length > 0) {
          for (const event of activeEvent) {
            const insertEvent = {
              id: event.id,
              name: event.name,
              type: event.type,
              eventCheckId: 0,
              check: 0,
            };
            // event_check 테이블에서 organization_id = row.organizationId이고 event_id = event.id인 경우를 찾습니다.
            const [eventCheck] = await this.pool.execute(
              `SELECT id, event_check FROM event_check WHERE organization_id = ? AND event_id = ? AND date = ?`,
              [row.organizationId, event.id, formattedDate],
            );
            if (eventCheck.length > 0) {
              insertEvent.eventCheckId = eventCheck[0].id;
              insertEvent.check = eventCheck[0].event_check;
            } else {
              insertEvent.check = 0;
            }
            row.event.push(insertEvent);
          }
        }
      }

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
          await this.pool.execute(
            'INSERT INTO organization (userId, grade, class, year, department, role, is_on_list) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, grade, classNum, 2025, '고등부', 0, isOnList],
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
      const [row] = await this.pool.execute(
        `INSERT INTO board_check (organizationId, date, board_check, checkerId)
          VALUES (?, ?, 1, ?)`,
        [organizationId, date, checkerId],
      );

      const checkCount = await this.checkCount(organizationId);
      const isNew = await this.checkIsNew(organizationId);

      if (checkCount === 5 && isNew === 1) {
        await this.updateIsOnList(organizationId, 1);
      }

      return row.insertId;
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
      const [rows] = await this.pool.execute(
        `SELECT board_check, organizationId
         FROM board_check
         WHERE id = ?`,
        [checkId],
      );
      if (rows.length > 0) {
        let result = 1;
        if (rows[0].board_check.readInt8(0) === 1) {
          result = 0;
        }
        await this.pool.execute(
          `UPDATE board_check
           SET board_check = ?
           WHERE id = ?`,
          [result, checkId],
        );

        const organizationId = rows[0].organizationId;
        const checkCount = await this.checkCount(organizationId);
        const isNew = await this.checkIsNew(organizationId);
        if (checkCount === 5 && isNew === 1) {
          await this.updateIsOnList(organizationId, 1);
        } else if (checkCount === 4 && isNew === 1 && result === 0) {
          await this.updateIsOnList(organizationId, 0);
        }

        return result;
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
      throw error;
    }
  }

  async checkCount(organizationId: number) {
    // organizationId의 2024년 전체 출석 합계를 조회합니다.
    const [rows] = await this.pool.execute(
      `SELECT COUNT(*)
        FROM board_check
        WHERE organizationId = ? AND board_check = 1`,
      [organizationId],
    );

    return rows[0]['COUNT(*)'];
  }

  async updateIsOnList(organizationId: number, state: number) {
    await this.pool.execute(
      `UPDATE organization
       SET is_on_list = ?
       WHERE id = ?`,
      [state, organizationId],
    );
  }

  async checkIsNew(organizationId: number) {
    const [rows] = await this.pool.execute(
      `SELECT is_new
       FROM organization
       WHERE id = ?`,
      [organizationId],
    );
    return rows[0].is_new[0];
  }

  async checkExistAttandance(organizationId: number, date: Date) {
    const result = {
      id: null,
      result: false,
    };
    const [rows] = await this.pool.execute(
      `SELECT id, board_check
       FROM board_check
       WHERE organizationId = ?
       and date = ?`,
      [organizationId, date],
    );
    if (rows.length > 0) {
      const boardCheck = rows[0].board_check.readInt8(0);
      const id = rows[0].id;
      if (boardCheck === 1) {
        result.id = id;
        result.result = true;
        return result;
      } else {
        try {
          await this.pool.execute(
            `UPDATE board_check
             SET board_check = ?
             WHERE id = ?`,
            [1, id],
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
      const [rows] = await this.pool.execute(
        `SELECT u.id, u.name, u.gender, u.phone, u.birth, u.created_at, 
            o.id AS organizationId, o.year, o.department, o.grade, o.class, o.role, o.school, o.is_on_list, o.is_new, o.follow, 
            c.id AS commentId, c.comment,
            (SELECT COUNT(*) FROM board_check WHERE board_check = 1 AND organizationId = o.id) AS attendance_count
         FROM organization o
         LEFT JOIN users u ON o.userId = u.id
         LEFT JOIN comments c ON c.organizationId = o.id
         WHERE o.year = ? AND o.department = ?
         ORDER BY o.grade, o.class, u.name`,
        [year, department],
      );
      const response = rows.filter((row) => row.is_new[0] === 1);
      return response;
    } catch (error) {
      console.error('Error fetching new students:', error);
      throw error;
    }
  }
}
