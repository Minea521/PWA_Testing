/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // app.enableCors({
  //   origin: [process.env.FRONTEND_URL || 'http://localhost:9000', 'http://localhost:9200', 'http://localhost:4000'],
  //   methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  //   allowedHeaders: 'Content-Type, Authorization',
  //   credentials: true,
  // });
  app.enableCors({
    origin: ['http://localhost:9000', 'http://localhost:9200', 'http://localhost:4000', 'https://pwa-testing-wheat.vercel.app/'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
