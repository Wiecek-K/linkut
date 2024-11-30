import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { LoggingExceptionFilter } from './filters/logging-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalFilters(new LoggingExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
