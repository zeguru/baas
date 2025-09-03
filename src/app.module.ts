import { SampleController } from './sample.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// import { RulesModule } from './rules/rules.module';
import { RuleSetModule } from './ruleset/ruleset.module';
// import { RuleSetService } from './ruleset/ruleset.service';
import { RuleSetController } from './ruleset/ruleset.controller';

import { CalculatorModule } from './calculator/calculator.module';
// import { CalculatorService } from './calculator/calculator.service';
// import { CalculatorController } from './calculator/calculator.controller';

@Module({
  imports: [ RuleSetModule, CalculatorModule],
  controllers: [SampleController, AppController, RuleSetController],
  providers: [AppService],
})
export class AppModule { }
