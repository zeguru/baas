import { Module } from '@nestjs/common';
import { RuleSetService } from './ruleset.service';
import { RuleSetController } from './ruleset.controller';

@Module({
    providers: [RuleSetService],
    controllers: [RuleSetController]
  })
export class RuleSetModule {}
