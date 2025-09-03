import { Module } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { CalculatorController } from './calculator.controller';
import { RuleSetModule } from '../ruleset/ruleset.module'; // 👈 import module

@Module({
  imports: [RuleSetModule],
  providers: [CalculatorService],
  controllers: [CalculatorController]
})
export class CalculatorModule {}
