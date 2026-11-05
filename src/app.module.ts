import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { SampleController } from './sample.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RuleSetModule } from './ruleset/ruleset.module';
import { RuleSetController } from './ruleset/ruleset.controller';
import { CalculatorModule } from './calculator/calculator.module';
import { SessionModule } from './session/session.module';
import { MetaModule } from './meta/meta.module';

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as any) ?? 'sqlite',
      database: process.env.DB_DATABASE ?? './data/baas.db',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true, // auto generate tables in dev
      }),
    RuleSetModule, 
    CalculatorModule, SessionModule, MetaModule],
  controllers: [AppController, RuleSetController],
  providers: [AppService],
})
export class AppModule { }
