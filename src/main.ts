import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { LoggingExceptionFilter } from './filters/logging-exception.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  app.use(cookieParser());

  app.useGlobalFilters(new LoggingExceptionFilter());

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
