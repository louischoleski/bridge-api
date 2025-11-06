import { Request, Response, NextFunction } from 'express';
import { jwtService } from '~infrastructure/auth/jwt.service';

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
      };
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT tokens from Authorization header
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: {
        message: 'No authorization header provided',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      },
    });
    return;
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify and decode JWT token
    const decoded = jwtService.verifyToken(token);

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    };

    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid or expired token';
    res.status(401).json({
      error: {
        message,
        code: 'UNAUTHORIZED',
        statusCode: 401,
      },
    });
  }
}

/**
 * Authorization Middleware Factory
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED',
          statusCode: 401,
        },
      });
      return;
    }

    const hasRole = allowedRoles.some((role) => req.user?.roles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
          statusCode: 403,
        },
      });
      return;
    }

    next();
  };
}
