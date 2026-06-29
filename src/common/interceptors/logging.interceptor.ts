import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, ip } = request;
    const requestId = request['requestId'] || 'N/A';
    const userId = request.user ? (request.user as any).id : 'Unauthenticated';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const executionTime = Date.now() - startTime;
          this.logger.log(
            `[RequestId=${requestId}] ${method} ${originalUrl} ${statusCode} ${executionTime}ms - User: ${userId} - IP: ${ip}`,
          );
        },
        error: (error) => {
          const executionTime = Date.now() - startTime;
          const statusCode = error.status || error.statusCode || 500;
          this.logger.error(
            `[RequestId=${requestId}] ${method} ${originalUrl} ${statusCode} ${executionTime}ms - User: ${userId} - IP: ${ip} - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
