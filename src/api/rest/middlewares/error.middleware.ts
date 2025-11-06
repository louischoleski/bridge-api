import { Request, Response, NextFunction } from 'express';
import {
  DomainException,
  NotFoundException,
  ValidationException,
  BusinessRuleViolationException,
  InvalidOperationException,
} from '~domain/shared/exceptions/domain.exception';
import { LoggerService } from '~infrastructure/logging/logger.service';

const logger = new LoggerService('ErrorMiddleware');

/**
 * Error Response Interface
 */
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
  };
}

/**
 * Global Error Handler Middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Request error', error, {
    method: req.method,
    url: req.url,
    body: req.body,
  });

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  // Handle domain exceptions
  if (error instanceof NotFoundException) {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = error.message;
  } else if (error instanceof ValidationException) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = error.message;
  } else if (error instanceof BusinessRuleViolationException) {
    statusCode = 422;
    errorCode = 'BUSINESS_RULE_VIOLATION';
    message = error.message;
  } else if (error instanceof InvalidOperationException) {
    statusCode = 400;
    errorCode = 'INVALID_OPERATION';
    message = error.message;
  } else if (error instanceof DomainException) {
    statusCode = 400;
    errorCode = 'DOMAIN_ERROR';
    message = error.message;
  }

  const errorResponse: ErrorResponse = {
    error: {
      message,
      code: errorCode,
      statusCode,
    },
  };

  res.status(statusCode).json(errorResponse);
}
