import { Request, Response } from 'express';
import { LoginUseCase } from '~application/use-cases/auth/login.use-case';
import { getGlobalContainer } from '~config/dependency-injection';

/**
 * Login endpoint - generates JWT token
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const container = getGlobalContainer();
    const loginUseCase = container.get<LoginUseCase>('loginUseCase');

    const result = await loginUseCase.execute({
      email: req.body.email,
      password: req.body.password,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';

    if (errorMessage.includes('Email and password are required')) {
      res.status(400).json({
        error: {
          message: errorMessage,
          code: 'INVALID_INPUT',
          statusCode: 400,
        },
      });
      return;
    }

    if (errorMessage.includes('Invalid email or password')) {
      res.status(401).json({
        error: {
          message: errorMessage,
          code: 'INVALID_CREDENTIALS',
          statusCode: 401,
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        message: 'Login failed',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
      },
    });
  }
}

/**
 * Get current user endpoint - returns authenticated user info
 */
export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}
