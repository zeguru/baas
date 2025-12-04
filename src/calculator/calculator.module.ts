import { Module } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { CalculatorController } from './calculator.controller';
import { RuleSetModule } from '../ruleset/ruleset.module'; 
import { SessionModule } from '../session/session.module';

@Module({
  imports: [RuleSetModule, SessionModule],
  providers: [CalculatorService],
  controllers: [CalculatorController]
})
export class CalculatorModule {}

