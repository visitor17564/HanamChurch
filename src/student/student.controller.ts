import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { StudentService } from './student.service';
import { ResponseDto } from 'src/ResponseDTO/response-dto';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}
}
