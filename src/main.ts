import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cors from 'cors';
import { AppExceptionFilter } from './filters/global-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AppExceptionFilter());
  app.useStaticAssets(join(__dirname, '..', 'public'));

  if (process.env.NODE_ENV !== 'production') {
    app.useLogger(console);
  }

  app.enableCors({
    origin: ['https://mineduc-form.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/profile-pictures',
  });

  const config = new DocumentBuilder()
    .setTitle('FSF Backend Service API')
    .setDescription(
      'Backend service documentation for the Rwanda Future Skills Forum Platform',
    )
    .setVersion('1.0')
    .addTag('FSF')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = Number(process.env.PORT) || 3270;

  try {
    await app.listen(port, '0.0.0.0');
    console.log(`Server listening at: http://localhost:${port}`);
    console.log(`Swagger API: http://localhost:${port}/api`);
    console.log(`Uploaded files served at: http://localhost:${port}/uploads`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

bootstrap();
