import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RuleSetModule } from './ruleset/ruleset.module';
import { CalculatorModule } from './calculator/calculator.module';
import * as basicAuth from 'express-basic-auth';
import * as express from 'express';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const context = 'baas'; 

  app.use(`/${context}/editor`, express.static(join(__dirname, '..', 'public')));

  const config = new DocumentBuilder()
    .setTitle('BaaS API')
    .setDescription('REST apis for Business Logic Service. Collect all your facts, evaluate once.')
    .setVersion('alpha')
    .addServer(`/${context}`)
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [RuleSetModule, CalculatorModule], // only include selected modules
    });

  SwaggerModule.setup(`${context}/docs`, app, document);

  app.setGlobalPrefix(context); 

  await app.listen(3000, '0.0.0.0');

  const url = await app.getUrl(); // <-- auto-detected URL

  console.log(`API running at ${url}/${context}`);
  console.log(`Advanced Editor running at ${url}/${context}/editor/`);

  }
  
bootstrap();








