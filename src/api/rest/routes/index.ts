import { Router } from 'express';

import { CartController } from '~api/rest/controllers/cart.controller';
import { OrderController } from '~api/rest/controllers/order.controller';
import { ProductController } from '~api/rest/controllers/product.controller';
import { createCartRoutes } from '~api/rest/routes/cart.routes';
import { createOrderRoutes } from '~api/rest/routes/order.routes';
import { createProductRoutes } from '~api/rest/routes/product.routes';
import authRoutes from './auth.routes';

/**
 * API Routes Configuration
 */
export interface RouteControllers {
  cartController: CartController;
  orderController: OrderController;
  productController: ProductController;
}

export function createApiRoutes(controllers: RouteControllers): Router {
  const router = Router();

  // Health check endpoint
  router.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Mount auth routes
  router.use('/auth', authRoutes);

  // Mount feature routes
  router.use('/cart', createCartRoutes(controllers.cartController));
  router.use('/orders', createOrderRoutes(controllers.orderController));
  router.use('/products', createProductRoutes(controllers.productController));

  return router;
}
