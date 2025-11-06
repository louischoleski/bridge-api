import { Request, Response, NextFunction } from 'express';

import { ValidationException } from '~domain/shared/exceptions/domain.exception';

/**
 * Validation Schema Interface
 */
export interface ValidationSchema {
  validate(data: any): { error?: { details: Array<{ message: string }> } };
}

/**
 * Request Validation Middleware Factory
 */
export function validateRequest(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      next(new ValidationException(message));
      return;
    }

    next();
  };
}

/**
 * Simple validation helper
 */
export function validateBody(
  rules: Record<string, (value: any) => boolean | string>
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const [field, validator] of Object.entries(rules)) {
      const value = req.body[field];
      const result = validator(value);

      if (result === false) {
        errors.push(`Invalid value for field: ${field}`);
      } else if (typeof result === 'string') {
        errors.push(result);
      }
    }

    if (errors.length > 0) {
      next(new ValidationException(errors.join(', ')));
      return;
    }

    next();
  };
}
