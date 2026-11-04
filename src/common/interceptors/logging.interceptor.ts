import {
  Injectable,
  Logger,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { catchError, tap, throwError, type Observable } from 'rxjs';

/**
 * Mencatat durasi eksekusi setiap handler.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Handler');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = request;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${originalUrl} - ${Date.now() - startedAt}ms`);
      }),
      catchError((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `${method} ${originalUrl} - ${Date.now() - startedAt}ms - ${message}`,
        );
        return throwError(() => error);
      }),
    );
  }
}
