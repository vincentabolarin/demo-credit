import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseFormat<T = any> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T = any>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data: T) => {
        // If the controller returns a structured { message, data } object
        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          'data' in data
        ) {
          const structuredData = data as { message: string; data: T };
          return {
            success: true,
            message: structuredData.message,
            data: structuredData.data,
          };
        }
        // Default wrapping
        return { success: true, message: 'Request successful', data };
      }),
    );
  }
}
