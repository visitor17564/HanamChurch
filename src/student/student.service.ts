import { Injectable } from '@nestjs/common';
import { pool } from '../mssql';

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
}
