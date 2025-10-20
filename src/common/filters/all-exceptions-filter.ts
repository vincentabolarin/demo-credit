import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        // Handle validation errors where message can be an array
        const responseObj = res as { message?: string | string[] };
        message = Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : responseObj.message || JSON.stringify(res);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(`Status ${status} Error: ${JSON.stringify(message)}`);

    const errorResponse = {
      success: false,
      message: message,
      error: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(errorResponse);
  }
}
