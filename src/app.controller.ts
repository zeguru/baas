import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('editor')
  getEditor(@Res() res: Response) {
    // Adjust path depending on where you compile your assets
    return res.sendFile(join(__dirname, '..', 'public', 'editor.html'));
    }
}
