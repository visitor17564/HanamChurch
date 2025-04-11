import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  root() {}

  @Get('choose-class')
  @Render('choose-class')
  async goToChooseClass() {
    return;
  }

  @Get('attendance')
  @Render('attendance')
  async goToAttendance() {
    return;
  }

  @Get('check-all-board')
  @Render('check-all-board')
  async goToCheckAllBoard() {
    return;
  }

  @Get('check-all-year-board')
  @Render('check-all-year-board')
  async goToCheckAllYearBoard() {
    return;
  }

  @Get('check-new-student')
  @Render('check-new-student')
  async goToCheckNewStudent() {
    return;
  }

  @Get('check-event')
  @Render('check-event')
  async goToCheckEvent() {
    return;
  }
}
