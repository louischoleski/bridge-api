import { NextFunction, Request, Response } from 'express';

import { CancelOrderUseCase } from '~application/use-cases/order/cancel-order.use-case';
import { CreateOrderUseCase } from '~application/use-cases/order/create-order.use-case';
import { GetOrderUseCase } from '~application/use-cases/order/get-order.use-case';

/**
 * Order Controller
 * Handles HTTP requests related to orders
 */
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase
  ) {}

  /**
   * POST /orders
   * Create new order from cart
   */
  async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.user!.id;
      const { cartId, shippingAddress } = req.body;

      const order = await this.createOrderUseCase.execute({
        customerId,
        cartId,
        shippingAddress,
      });

      res.status(201).json({ data: order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /orders/:orderId
   * Get order by ID
   */
  async getOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderId } = req.params;
      const order = await this.getOrderUseCase.execute(orderId);

      res.status(200).json({ data: order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /orders/:orderId/cancel
   * Cancel order
   */
  async cancelOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      await this.cancelOrderUseCase.execute({ orderId, reason });

      res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
      next(error);
    }
  }
}
