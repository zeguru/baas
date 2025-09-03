import { Module } from '@nestjs/common';
import { RuleSetService } from './ruleset.service';
import { RuleSetController } from './ruleset.controller';

@Module({
    providers: [RuleSetService],
    controllers: [RuleSetController],
    exports: [RuleSetService], // 👈 export so other modules can use it

  })
export class RuleSetModule {}
