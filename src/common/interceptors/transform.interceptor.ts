import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import type { PaginatedResult } from '../interfaces/paginated-result.interface.js';

interface ApiResponse {
  statusCode: number;
  message: string;
  data: unknown;
  meta?: unknown;
}

function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as PaginatedResult<unknown>).items) &&
    typeof (value as PaginatedResult<unknown>).meta === 'object'
  );
}

/**
 * Menyeragamkan bentuk response sukses:
 * { statusCode, message, data, meta? }
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse> {
    const response = context.switchToHttp().getResponse<{ statusCode: number }>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result: unknown) => {
        if (result === undefined || result === null) {
          return { statusCode, message: 'Success', data: null };
        }

        if (isPaginatedResult(result)) {
          return {
            statusCode,
            message: 'Success',
            data: result.items,
            meta: result.meta,
          };
        }

        return { statusCode, message: 'Success', data: result };
      }),
    );
  }
}
