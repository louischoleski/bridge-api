import { Router } from 'express';

import { ProductController } from '~api/rest/controllers/product.controller';
import { authenticate } from '~api/rest/middlewares/auth.middleware';
import {
  canCreate,
  canUpdate,
  canDelete,
} from '~api/rest/middlewares/permissions.middleware';

/**
 * Product Routes
 */
export function createProductRoutes(
  productController: ProductController
): Router {
  const router = Router();

  /**
   * GET /products
   * Search/list products
   * Public endpoint - anyone can read products
   */
  router.get('/', (req, res, next) =>
    productController.searchProducts(req, res, next)
  );

  /**
   * GET /products/:productId
   * Get product by ID
   * Public endpoint - anyone can read products
   */
  router.get('/:productId', (req, res, next) =>
    productController.getProduct(req, res, next)
  );

  /**
   * POST /products
   * Create new product
   * Requires: authentication + product:create permission
   */
  router.post('/', authenticate, canCreate('product'), (req, res, next) =>
    productController.createProduct(req, res, next)
  );

  /**
   * PUT /products/:productId
   * Update product
   * Requires: authentication + product:update permission
   */
  router.put(
    '/:productId',
    authenticate,
    canUpdate('product'),
    (req, res, next) => productController.updateProduct(req, res, next)
  );

  /**
   * DELETE /products/:productId
   * Delete product
   * Requires: authentication + product:delete permission
   */
  router.delete(
    '/:productId',
    authenticate,
    canDelete('product'),
    (req, res, next) => productController.deleteProduct(req, res, next)
  );

  return router;
}
