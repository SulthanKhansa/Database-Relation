import {
  Injectable,
  Logger,
  type NestMiddleware,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Request');

  use(request: Request, response: Response, next: NextFunction) {
    const { method, originalUrl } = request;
    const startedAt = Date.now();

    response.on('finish', () => {
      const duration = Date.now() - startedAt;
      this.logger.log(
        `${method} ${originalUrl} ${response.statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
