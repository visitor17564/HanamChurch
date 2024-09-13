import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
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
}
