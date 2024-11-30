import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';

@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(LoggingExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const clientIp = request.ip;

    if (exception instanceof ThrottlerException) {
      this.logger.warn(
        `Rate limit exceeded for ${request.method} ${request.url} from IP ${clientIp}`,
      );
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: 'Too many requests, please try again later.',
      });
      return;
    }

    this.logger.error(
      `Exception occurred during HTTP ${request.method} ${request.url} from IP ${clientIp}`,
      exception.message,
      //     exception.stack || exception.message, // use this for more details of error
    );

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();
      response.status(status).json(responseBody);
    } else {
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }
}
