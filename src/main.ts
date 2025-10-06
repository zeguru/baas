import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RuleSetModule } from './ruleset/ruleset.module';
import { CalculatorModule } from './calculator/calculator.module';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('BaaS API')
    .setDescription('REST apis for Business Logic Service')
    .setVersion('1.0')
    .build();

const document = SwaggerModule.createDocument(app, config, {
  include: [RuleSetModule, CalculatorModule], // only include selected modules
  });

SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
