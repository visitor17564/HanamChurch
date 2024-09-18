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
}
