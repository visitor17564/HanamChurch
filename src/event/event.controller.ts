import { Controller, Get, Post, Patch, Param, Req } from '@nestjs/common';
import { EventService } from './event.service';
import { ResponseDto } from 'src/ResponseDTO/response-dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // 모든 이벤트를 가져오는 함수
  @Get('getAllEvent')
  async getAllEvent() {
    const data = await this.eventService.getAllEvent();
    const response = new ResponseDto(true, '이벤트 조회 완료!', data);
    return response;
  }

  // 특정 이벤트
  @Get('getEvent/:eventId')
  async getEvent(@Param('eventId') eventId: number) {
    const data = await this.eventService.getEvent(eventId);
    const response = new ResponseDto(true, '이벤트 조회 완료!', data);
    return response;
  }

  // 이벤트 명단 호출
  @Get('/getEventCounts/:eventId')
  async getStudentEvent(@Param('eventId') eventId: number) {
    const data = await this.eventService.getStudentEvent(eventId);
    const response = new ResponseDto(true, '이벤트 명단 조회 완료!', data);
    return response;
  }

  // 개별 이벤트 히스토리 조회
  @Get('/getEventHistory/:eventId/:organizationId')
  async getEventHistory(
    @Param('eventId') eventId: number,
    @Param('organizationId') organizationId: number,
  ) {
    const data = await this.eventService.getEventHistory(
      eventId,
      organizationId,
    );
    const response = new ResponseDto(true, '이벤트 히스토리 조회 완료!', data);
    return response;
  }

  @Patch('/updateEvent/:eventCheckId')
  async updateEvent(@Param('eventCheckId') eventCheckId: number, @Req() req) {
    const content = req.body.content;
    const eventId = parseInt(req.body.eventId);
    const organizationId = parseInt(req.body.organizationId);
    const date = new Date(req.body.date);
    const data = await this.eventService.updateEvent(
      eventCheckId,
      eventId,
      organizationId,
      content,
      date,
    );
    const response = new ResponseDto(true, '이벤트 수정 완료!', data);
    return response;
  }

  @Post('makeEvent')
  async makeEvent(@Req() req) {
    const eventId = parseInt(req.body.eventId);
    const organizationId = parseInt(req.body.organizationId);
    const content = req.body.content;
    const date = new Date(req.body.date);
    const data = await this.eventService.makeEvent(
      eventId,
      organizationId,
      content,
      date,
    );
    const response = new ResponseDto(true, '출석 완료!', data);
    return response;
  }
}
