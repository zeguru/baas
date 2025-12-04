
import { Module } from '@nestjs/common';
import { SessionManager } from './manager';

@Module({
  providers: [SessionManager],
  exports: [SessionManager],
})
export class SessionModule {}
