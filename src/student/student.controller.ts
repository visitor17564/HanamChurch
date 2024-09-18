import { Controller, Get, Patch, Param, Req, Post } from '@nestjs/common';
import { StudentService } from './student.service';
import { ResponseDto } from 'src/ResponseDTO/response-dto';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // 학생 출석 조회
  @Get('/checkCount/:organizationId')
  async getStudentCheckCount(@Param('organizationId') organizationId: number) {
    const data = await this.studentService.getStudentCheckCount(organizationId);

    const response = new ResponseDto(true, '출석횟수 조회 완료!', data);
    return response;
  }

  @Patch('/updateStudent/:studentId')
  async updateStudent(@Param('studentId') studentId: number, @Req() req) {
    return await this.studentService.updateStudent(studentId, req.body);
  }

  @Post('/makeStudent')
  async makeStudent(@Req() req) {
    if (!req.body.name) {
      return new ResponseDto(false, '이름을 입력해주세요!', null);
    }
    if (req.body.gender === '') {
      return new ResponseDto(false, '성별을 입력해주세요!', null);
    }
    return await this.studentService.createStudent(req.body);
  }
}
