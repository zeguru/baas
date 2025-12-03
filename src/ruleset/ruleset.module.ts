import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RuleSetService } from './ruleset.service';
import { RuleSetController } from './ruleset.controller';
import { BusinessLogic } from './logic';

@Module({
    imports: [TypeOrmModule.forFeature([BusinessLogic])], 
    providers: [RuleSetService],
    controllers: [RuleSetController],
    exports: [RuleSetService], // 👈 export so other modules can use it
  })
export class RuleSetModule {}
