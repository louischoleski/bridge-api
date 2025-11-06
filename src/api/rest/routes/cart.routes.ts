import { Router } from 'express';

import { CartController } from '~api/rest/controllers/cart.controller';
import { authenticate } from '~api/rest/middlewares/auth.middleware';
import { validateBody } from '~api/rest/middlewares/validation.middleware';

/**
 * Cart Routes
 */
export function createCartRoutes(cartController: CartController): Router {
  const router = Router();

  // All cart routes require authentication
  router.use(authenticate);

  /**
   * GET /cart
   * Get customer's active cart
   */
  router.get('/', (req, res, next) => cartController.getCart(req, res, next));

  /**
   * POST /cart/items
   * Add item to cart
   */
  router.post(
    '/items',
    validateBody({
      productId: (value) => !!value || 'Product ID is required',
      quantity: (value) =>
        (typeof value === 'number' && value > 0) ||
        'Quantity must be a positive number',
    }),
    (req, res, next) => cartController.addItem(req, res, next)
  );

  /**
   * PUT /cart/items/:productId
   * Update cart item quantity
   */
  router.put(
    '/items/:productId',
    validateBody({
      quantity: (value) =>
        (typeof value === 'number' && value > 0) ||
        'Quantity must be a positive number',
    }),
    (req, res, next) => cartController.updateItem(req, res, next)
  );

  /**
   * DELETE /cart/items/:productId
   * Remove item from cart
   */
  router.delete('/items/:productId', (req, res, next) =>
    cartController.removeItem(req, res, next)
  );

  /**
   * DELETE /cart
   * Clear cart
   */
  router.delete('/', (req, res, next) =>
    cartController.clearCart(req, res, next)
  );

  return router;
}
