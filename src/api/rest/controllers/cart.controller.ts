import { NextFunction, Request, Response } from 'express';

import { AddItemToCartUseCase } from '~application/use-cases/cart/add-item-to-cart.use-case';
import { ClearCartUseCase } from '~application/use-cases/cart/clear-cart.use-case';
import { GetCartUseCase } from '~application/use-cases/cart/get-cart.use-case';
import { RemoveItemFromCartUseCase } from '~application/use-cases/cart/remove-item-from-cart.use-case';
import { UpdateCartItemUseCase } from '~application/use-cases/cart/update-cart-item.use-case';

/**
 * Cart Controller
 * Handles HTTP requests related to shopping cart
 */
export class CartController {
  constructor(
    private readonly addItemToCartUseCase: AddItemToCartUseCase,
    private readonly removeItemFromCartUseCase: RemoveItemFromCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly clearCartUseCase: ClearCartUseCase
  ) {}

  /**
   * GET /cart
   * Get customer's active cart
   */
  async getCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.user!.id;
      const cart = await this.getCartUseCase.execute(customerId);

      if (!cart) {
        res.status(200).json({ data: null, message: 'No active cart found' });
        return;
      }

      res.status(200).json({ data: cart });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /cart/items
   * Add item to cart
   */
  async addItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.user!.id;
      const { productId, quantity } = req.body;

      await this.addItemToCartUseCase.execute({
        customerId,
        productId,
        quantity,
      });

      res.status(201).json({ message: 'Item added to cart' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /cart/items/:productId
   * Update cart item quantity
   */
  async updateItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.user!.id;
      const { productId } = req.params;
      const { quantity } = req.body;

      await this.updateCartItemUseCase.execute({
        customerId,
        productId,
        quantity,
      });

      res.status(200).json({ message: 'Cart item updated' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /cart/items/:productId
   * Remove item from cart
   */
  async removeItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.user!.id;
      const { productId } = req.params;

      await this.removeItemFromCartUseCase.execute({
        customerId,
        productId,
      });

      res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /cart
   * Clear cart
   */
  async clearCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.user!.id;
      await this.clearCartUseCase.execute(customerId);

      res.status(200).json({ message: 'Cart cleared' });
    } catch (error) {
      next(error);
    }
  }
}
