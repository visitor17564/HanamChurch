import { Controller, Get, Post, Patch, Param, Req } from '@nestjs/common';
import { BoardService } from './board.service';
import { ResponseDto } from 'src/ResponseDTO/response-dto';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // 상품 상세 조회 (content도 가져오기)
  @Get('/viewBoard/:date/:grade/:class')
  async getBoard(
    @Param('date') date: string,
    @Param('grade') gradeNumber: number,
    @Param('class') classNumber: number,
  ) {
    const checkDate = new Date(date);
    const data = await this.boardService.getBoard(
      checkDate,
      gradeNumber,
      classNumber,
    );

    const response = new ResponseDto(true, '반출석부 조회 완료!', data);
    return response;
  }

  @Patch('/checkAttendance/:checkId')
  async checkAttendance(@Param('checkId') checkId: number) {
    const data = await this.boardService.checkAttendance(checkId);
    const response = new ResponseDto(true, '출석 완료!', data);
    return response;
  }

  @Post('makeAttendance/:organizationId')
  async makeAttendance(
    @Param('organizationId') organizationId: number,
    @Req() req,
  ) {
    const date = new Date(req.body.date);
    const checkId = req.body.checkId;
    const data = await this.boardService.makeAttendance(
      organizationId,
      date,
      checkId,
    );
    const response = new ResponseDto(true, '출석 완료!', data);
    return response;
  }
}
