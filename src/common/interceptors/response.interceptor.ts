import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const requestId = request['requestId'];

    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          return {
            success: true,
            message: 'Success',
            data: data.data,
            meta: data.meta,
            timestamp: new Date().toISOString(),
            requestId,
          };
        }

        return {
          success: true,
          message: 'Success',
          data: data !== undefined ? data : null,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }),
    );
  }
}
