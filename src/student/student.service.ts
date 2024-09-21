import { Injectable } from '@nestjs/common';
import { pool } from '../mssql';
import { ResponseDto } from 'src/ResponseDTO/response-dto';

@Injectable()
export class StudentService {
  private pool;

  constructor() {
    this.pool = pool;
    // this.checkConnection();
  }

  async checkConnection() {
    try {
      // For pool initialization, see above
      const [rows, fields] = await this.pool.query('SELECT * FROM `users`');
      console.log(rows); // RowDataPacket[]
      // Connection is automatically released when query resolves
    } catch (err) {
      console.log(err);
    }
  }

  async getStudent(userId, department, year) {
    try {
      const [rows] = await this.pool.execute(
        `SELECT *
         FROM users u
         JOIN organization o ON o.userId = u.id
         JOIN comments c ON c.organizationId = o.id
         WHERE u.id = ?, o.department = ?, o.year = ?`,
        [userId, department, year],
      );
      const response = rows;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }

  async getStudentCheckCount(organizationId) {
    try {
      const [rows] = await this.pool.execute(
        `SELECT COUNT(*)
         FROM board_check
         WHERE organizationId = ?
         and board_check = 1`,
        [organizationId],
      );
      const response = rows;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }

  async updateStudent(studentId, body) {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    try {
      // 학생 기본정보 수정
      let birth = null;
      if (body.birth) {
        birth = new Date(body.birth);
      }
      let follow = null;
      if (body.follow) {
        follow = body.follow;
      }
      const created_at = new Date(body.created_at);
      await connection.execute(
        `UPDATE users
         SET name = ?, phone = ?, birth = ?, created_at = ?
         WHERE id = ?`,
        [body.name, body.phone, birth, created_at, studentId],
      );

      await connection.execute(
        `UPDATE organization
         SET school = ?, follow = ?
         WHERE id = ?`,
        [body.school, follow, body.organizationId],
      );

      if (body.comment) {
        // 기존 data를 확인합니다.
        const [rows] = await connection.execute(
          `SELECT *
           FROM comments
           WHERE organizationId = ?`,
          [body.organizationId],
        );
        if (rows.length > 0) {
          await connection.execute(
            `UPDATE comments
             SET comment = ?
             WHERE organizationId = ?`,
            [body.comment, body.organizationId],
          );
        } else {
          await connection.execute(
            `INSERT INTO comments (organizationId, comment)
             VALUES (?, ?)`,
            [body.organizationId, body.comment],
          );
        }
      } else {
        // 기존 data를 확인합니다.
        const [rows] = await connection.execute(
          `SELECT *
            FROM comments
            WHERE organizationId = ?`,
          [body.organizationId],
        );
        if (rows.length > 0) {
          await connection.execute(
            `DELETE FROM comments
             WHERE organizationId = ?`,
            [body.organizationId],
          );
        }
      }

      await connection.commit();

      return new ResponseDto(true, '학생 정보 수정 완료!', null);
    } catch (error) {
      console.error('Error fetching class members:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async createStudent(body) {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    try {
      let birth = null;
      if (body.birth) {
        birth = new Date(body.birth);
      }
      let phone = null;
      if (body.phone) {
        phone = body.phone;
      }
      // user테이블에 학생정보를 추가하고 id를 반환합니다.
      const [rows] = await connection.execute(
        `INSERT INTO users (name, gender, phone, birth, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [body.name, parseInt(body.gender), phone, birth, new Date()],
      );

      // 올해연도를 year에 숫자로 반환합니다.
      const year = new Date().getFullYear();

      let follow = null;
      if (body.follow) {
        follow = body.follow;
      }

      const [rows2] = await connection.execute(
        `INSERT INTO organization (userId, year, department, grade, class, role, school, is_new, follow)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rows.insertId,
          year,
          '고등부',
          body.grade,
          body.class,
          0,
          body.school,
          1,
          follow,
        ],
      );

      if (body.comment) {
        await connection.execute(
          `INSERT INTO comments (organizationId, comment)
           VALUES (?, ?)`,
          [rows2.insertId, body.comment],
        );
      }

      await connection.commit();

      return new ResponseDto(true, '학생 생성 완료!', null);
    } catch (error) {
      console.error('Error fetching class members:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findStudentByName(name) {
    const searchName = `%${name}%`;
    try {
      const [rows] = await this.pool.execute(
        `SELECT u.id, u.name, o.grade, o.class
         FROM users u
         JOIN organization o ON o.userId = u.id
         WHERE u.name LIKE ?`,
        [searchName],
      );
      const response = rows;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }

  async findStudentById(Id) {
    try {
      const [rows] = await this.pool.execute(
        `SELECT u.id, u.name, o.grade, o.class
         FROM users u
         JOIN organization o ON o.userId = u.id
         WHERE u.id = ?`,
        [Id],
      );
      const response = rows;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }
}
