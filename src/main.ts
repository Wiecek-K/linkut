import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { LoggingExceptionFilter } from './filters/logging-exception.filter';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  app.use(cookieParser());

  app.useGlobalFilters(new LoggingExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Linkut API')
    .setDescription('The Linkut API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: http://localhost:${port}`);

  process.on('SIGINT', () => {
    logger.warn('SIGINT signal received. Closing application...');
    app.close().then(() => {
      logger.log('Application successfully shut down.');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    logger.warn('SIGTERM signal received. Closing application...');
    app.close().then(() => {
      logger.log('Application successfully shut down.');
      process.exit(0);
    });
  });
}
bootstrap();
