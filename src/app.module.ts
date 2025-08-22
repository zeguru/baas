import { SampleController } from './sample.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RulesModule } from './rules/rules.module';
import { RuleSetService } from './ruleset/ruleset.service';
import { RuleSetController } from './ruleset/ruleset.controller';
import { RuleSetModule } from './ruleset/ruleset.module';

@Module({
  imports: [RulesModule, RuleSetModule],
  controllers: [
    SampleController, AppController, RuleSetController],
  providers: [AppService, RuleSetService],
})
export class AppModule { }
