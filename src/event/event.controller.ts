import { Controller, Get, Post, Patch, Param, Req } from '@nestjs/common';
import { EventService } from './event.service';
import { ResponseDto } from 'src/ResponseDTO/response-dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

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
