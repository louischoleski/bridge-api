import { Router } from 'express';

import { OrderController } from '~api/rest/controllers/order.controller';
import { authenticate } from '~api/rest/middlewares/auth.middleware';
import { validateBody } from '~api/rest/middlewares/validation.middleware';

/**
 * Order Routes
 */
export function createOrderRoutes(orderController: OrderController): Router {
  const router = Router();

  // All order routes require authentication
  router.use(authenticate);

  /**
   * POST /orders
   * Create new order from cart
   */
  router.post(
    '/',
    validateBody({
      cartId: (value) => !!value || 'Cart ID is required',
      shippingAddress: (value) => {
        if (!value || typeof value !== 'object')
          return 'Shipping address is required';
        if (!value.street) return 'Street is required';
        if (!value.city) return 'City is required';
        if (!value.state) return 'State is required';
        if (!value.zipCode) return 'Zip code is required';
        if (!value.country) return 'Country is required';
        return true;
      },
    }),
    (req, res, next) => orderController.createOrder(req, res, next)
  );

  /**
   * GET /orders/:orderId
   * Get order by ID
   */
  router.get('/:orderId', (req, res, next) =>
    orderController.getOrder(req, res, next)
  );

  /**
   * POST /orders/:orderId/cancel
   * Cancel order
   */
  router.post(
    '/:orderId/cancel',
    validateBody({
      reason: (value) => !!value || 'Cancellation reason is required',
    }),
    (req, res, next) => orderController.cancelOrder(req, res, next)
  );

  return router;
}
