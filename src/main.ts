import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RuleSetModule } from './ruleset/ruleset.module';
import { CalculatorModule } from './calculator/calculator.module';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const context = 'baas'; // or from env

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

}
bootstrap();
