import { Request, Response, NextFunction } from 'express';

import { GetProductUseCase } from '~application/use-cases/product/get-product.use-case';
import { SearchProductsUseCase } from '~application/use-cases/product/search-products.use-case';
import { CreateProductUseCase } from '~application/use-cases/product/create-product.use-case';
import { UpdateProductUseCase } from '~application/use-cases/product/update-product.use-case';
import { DeleteProductUseCase } from '~application/use-cases/product/delete-product.use-case';

/**
 * Product Controller
 * Handles HTTP requests related to products
 */
export class ProductController {
  constructor(
    private readonly getProductUseCase: GetProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase
  ) {}

  /**
   * GET /products/:productId
   * Get product by ID
   */
  async getProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const product = await this.getProductUseCase.execute(productId);

      res.status(200).json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products
   * Search/list products
   */
  async searchProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { query, category, limit, offset } = req.query;

      const products = await this.searchProductsUseCase.execute({
        query: query as string,
        category: category as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.status(200).json({ data: products, count: products.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /products
   * Create new product
   */
  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await this.createProductUseCase.execute(req.body);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /products/:productId
   * Update product
   */
  async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const product = await this.updateProductUseCase.execute({
        productId,
        ...req.body,
      });

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /products/:productId
   * Delete product
   */
  async deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const result = await this.deleteProductUseCase.execute({ productId });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
