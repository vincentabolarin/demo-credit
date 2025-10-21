import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseFormat<T = unknown, M = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: M;
}

type ControllerInput<T, M> = T | { message: string; data: T; meta?: M };

@Injectable()
export class ResponseInterceptor<T = unknown, M = unknown>
  implements NestInterceptor<ControllerInput<T, M>, ResponseFormat<T, M>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T, M>> {
    return next.handle().pipe(
      map((data: ControllerInput<T, M>) => {
        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          'data' in data
        ) {
          const { message, data: innerData, meta } = data;

          return {
            success: true,
            message,
            data: innerData,
            meta,
          };
        }

        return { success: true, message: 'Request successful', data };
      }),
    );
  }
}
