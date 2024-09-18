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
    try {
      // 학생 기본정보 수정
      const birth = new Date(body.birth);
      const created_at = new Date(body.created_at);
      console.log(studentId);
      await this.pool.execute(
        `UPDATE users
         SET name = ?, phone = ?, birth = ?, created_at = ?
         WHERE id = ?`,
        [body.name, body.phone, birth, created_at, studentId],
      );

      await this.pool.execute(
        `UPDATE organization
         SET school = ?
         WHERE id = ?`,
        [body.school, body.organizationId],
      );

      return new ResponseDto(true, '학생 정보 수정 완료!', null);
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }
}
