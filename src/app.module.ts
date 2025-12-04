import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { SampleController } from './sample.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RuleSetModule } from './ruleset/ruleset.module';
import { RuleSetController } from './ruleset/ruleset.controller';
import { CalculatorModule } from './calculator/calculator.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data/baas.db',
      autoLoadEntities: true,
      synchronize: true, // auto generate tables in dev
      }),
    RuleSetModule, 
    CalculatorModule, SessionModule],
  controllers: [AppController, RuleSetController],
  providers: [AppService],
})
export class AppModule { }
