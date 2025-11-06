import { Router } from 'express';

import { getCurrentUser, login } from '~api/rest/controllers/auth.controller';
import { authenticate } from '~api/rest/middlewares/auth.middleware';

const router = Router();

/**
 * POST /auth/login
 * Login and get JWT token
 */
router.post('/login', login);

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, getCurrentUser);

export default router;
