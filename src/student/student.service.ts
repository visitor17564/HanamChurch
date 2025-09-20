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
      const request = this.pool.request();
      request.input('userId', userId);
      request.input('department', department);
      request.input('year', year);
      const result = await request.query(
        `SELECT *
         FROM [hanam-church-database].users u
         JOIN [hanam-church-database].organization o ON o.userId = u.id
         JOIN [hanam-church-database].comments c ON c.organizationId = o.id
         WHERE u.id = @userId AND o.department = @department AND o.year = @year`,
      );
      const response = result.recordset;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }

  async getStudentCheckCount(organizationId) {
    try {
      const request = this.pool.request();
      request.input('organizationId', organizationId);
      const result = await request.query(
        `SELECT COUNT(*) as count
         FROM [hanam-church-database].board_check
         WHERE organizationId = @organizationId AND board_check = 1`,
      );
      const response = result.recordset;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }

  async updateStudent(studentId, body) {
    const transaction = this.pool.transaction();
    await transaction.begin();
    
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
      
      const request1 = transaction.request();
      request1.input('name', body.name);
      request1.input('phone', body.phone);
      request1.input('birth', birth);
      request1.input('created_at', created_at);
      request1.input('studentId', studentId);
      await request1.query(
        `UPDATE [hanam-church-database].users
         SET name = @name, phone = @phone, birth = @birth, created_at = @created_at
         WHERE id = @studentId`,
      );

      const request2 = transaction.request();
      request2.input('school', body.school);
      request2.input('follow', follow);
      request2.input('organizationId', body.organizationId);
      await request2.query(
        `UPDATE [hanam-church-database].organization
         SET school = @school, follow = @follow
         WHERE id = @organizationId`,
      );

      if (body.comment) {
        // 기존 data를 확인합니다.
        const request3 = transaction.request();
        request3.input('organizationId', body.organizationId);
        const result = await request3.query(
          `SELECT * FROM [hanam-church-database].comments WHERE organizationId = @organizationId`,
        );
        const rows = result.recordset;
        
        if (rows.length > 0) {
          const request4 = transaction.request();
          request4.input('comment', body.comment);
          request4.input('organizationId', body.organizationId);
          await request4.query(
            `UPDATE [hanam-church-database].comments SET comment = @comment WHERE organizationId = @organizationId`,
          );
        } else {
          const request5 = transaction.request();
          request5.input('organizationId', body.organizationId);
          request5.input('comment', body.comment);
          await request5.query(
            `INSERT INTO [hanam-church-database].comments (organizationId, comment) VALUES (@organizationId, @comment)`,
          );
        }
      } else {
        // 기존 data를 확인합니다.
        const request6 = transaction.request();
        request6.input('organizationId', body.organizationId);
        const result = await request6.query(
          `SELECT * FROM [hanam-church-database].comments WHERE organizationId = @organizationId`,
        );
        const rows = result.recordset;
        
        if (rows.length > 0) {
          const request7 = transaction.request();
          request7.input('organizationId', body.organizationId);
          await request7.query(
            `DELETE FROM [hanam-church-database].comments WHERE organizationId = @organizationId`,
          );
        }
      }

      await transaction.commit();
      return new ResponseDto(true, '학생 정보 수정 완료!', null);
    } catch (error) {
      console.error('Error updating student:', error);
      await transaction.rollback();
      throw error;
    }
  }

  async createStudent(body) {
    const transaction = this.pool.transaction();
    await transaction.begin();
    
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
      const request1 = transaction.request();
      request1.input('name', body.name);
      request1.input('gender', parseInt(body.gender));
      request1.input('phone', phone);
      request1.input('birth', birth);
      request1.input('created_at', new Date());
      const userResult = await request1.query(
        `INSERT INTO [hanam-church-database].users (name, gender, phone, birth, created_at)
         OUTPUT INSERTED.id
         VALUES (@name, @gender, @phone, @birth, @created_at)`,
      );
      const userId = userResult.recordset[0].id;

      // 올해연도를 year에 숫자로 반환합니다.
      const year = new Date().getFullYear();

      let follow = null;
      if (body.follow) {
        follow = body.follow;
      }

      const request2 = transaction.request();
      request2.input('userId', userId);
      request2.input('year', year);
      request2.input('grade', body.grade);
      request2.input('class', body.class);
      request2.input('school', body.school);
      request2.input('follow', follow);
      const orgResult = await request2.query(
        `INSERT INTO [hanam-church-database].organization (userId, year, department, grade, class, role, school, is_new, follow)
         OUTPUT INSERTED.id
         VALUES (@userId, @year, N'고등부', @grade, @class, 0, @school, 1, @follow)`,
      );
      const organizationId = orgResult.recordset[0].id;

      if (body.comment) {
        const request3 = transaction.request();
        request3.input('organizationId', organizationId);
        request3.input('comment', body.comment);
        await request3.query(
          `INSERT INTO [hanam-church-database].comments (organizationId, comment) VALUES (@organizationId, @comment)`,
        );
      }

      await transaction.commit();
      return new ResponseDto(true, '학생 생성 완료!', null);
    } catch (error) {
      console.error('Error creating student:', error);
      await transaction.rollback();
      throw error;
    }
  }

  async findStudentByName(name) {
    const searchName = `%${name}%`;
    try {
      const request = this.pool.request();
      request.input('searchName', searchName);
      const result = await request.query(
        `SELECT u.id, u.name, o.grade, o.class
         FROM [hanam-church-database].users u
         JOIN [hanam-church-database].organization o ON o.userId = u.id
         WHERE u.name LIKE @searchName`,
      );
      const response = result.recordset;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }

  async findStudentById(Id) {
    try {
      const request = this.pool.request();
      request.input('Id', Id);
      const result = await request.query(
        `SELECT u.id, u.name, o.grade, o.class
         FROM [hanam-church-database].users u
         JOIN [hanam-church-database].organization o ON o.userId = u.id
         WHERE u.id = @Id`,
      );
      const response = result.recordset;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }

  async getBeforeComment(studentId, year) {
    try {
      const request = this.pool.request();
      request.input('studentId', studentId);
      request.input('year', year);
      const result = await request.query(
        `SELECT c.comment, o.grade, o.class, o.year
         FROM [hanam-church-database].users u
         LEFT JOIN [hanam-church-database].organization o ON o.userId = u.id
         LEFT JOIN [hanam-church-database].comments c ON c.organizationId = o.id
         WHERE u.id = @studentId AND o.year < @year`,
      );
      const response = result.recordset;
      return response;
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw error;
    }
  }
}
