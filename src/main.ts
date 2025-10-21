import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import configuration from './config/configuration';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
  app.enableCors({ origin: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = configuration();
  const swaggerConfig = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'Demo Credit API')
    .setDescription(
      process.env.SWAGGER_DESC || 'Demo Credit Application API Documentation',
    )
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.port;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}`);
  Logger.log(`Swagger docs available at: http://localhost:${port}/docs`);
}
void bootstrap();
