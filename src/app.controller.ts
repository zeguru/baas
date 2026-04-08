import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';
// import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor() {}

  @Get('editor')
  getEditor(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'editor.html'));
    }
  
  @Get()
  @Get('welcome')
  getWelcome(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'welcome.html'));
    }

  @Get('hello')
  getHello(): string {
    return 'Hello World!';
  }
}
