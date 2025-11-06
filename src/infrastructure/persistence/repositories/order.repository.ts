import { OrderAggregate } from '~domain/order/aggregates/order.aggregate';
import { OrderLineEntity } from '~domain/order/entities/order-line.entity';
import { IOrderRepository } from '~domain/order/repositories/order.repository.interface';
import { OrderStatus } from '~domain/order/value-objects/order-status.vo';
import { ShippingAddress } from '~domain/order/value-objects/shipping-address.vo';
import { Money } from '~domain/shared/value-objects/money.vo';
import { OrderModel } from '~infrastructure/persistence/models/order.model';

/**
 * Order Repository Implementation
 * This is a mock implementation. In production, integrate with your database
 */
export class OrderRepository implements IOrderRepository {
  private orders: Map<string, OrderModel> = new Map();

  async save(order: OrderAggregate): Promise<void> {
    const orderModel = this.toModel(order);
    this.orders.set(order.id, orderModel);

    // In production: publish domain events here
  }

  async findById(id: string): Promise<OrderAggregate | null> {
    const orderModel = this.orders.get(id);

    if (!orderModel) {
      return null;
    }

    return this.toDomain(orderModel);
  }

  async findByCustomerId(customerId: string): Promise<OrderAggregate[]> {
    const orderModels = Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId
    );

    return orderModels.map((model) => this.toDomain(model));
  }

  async delete(id: string): Promise<void> {
    this.orders.delete(id);
  }

  /**
   * Convert domain aggregate to database model
   */
  private toModel(order: OrderAggregate): OrderModel {
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status.value,
      currency: order.currency,
      shippingStreet: order.shippingAddress.street,
      shippingCity: order.shippingAddress.city,
      shippingState: order.shippingAddress.state,
      shippingZipCode: order.shippingAddress.zipCode,
      shippingCountry: order.shippingAddress.country,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderLines: order.orderLines.map((line) => ({
        id: line.id,
        orderId: order.id,
        productId: line.productId,
        productName: line.productName,
        quantity: line.quantity.value,
        unitPrice: line.unitPrice.amount,
        discount: line.discount.amount,
        currency: line.unitPrice.currency,
        createdAt: line.createdAt,
        updatedAt: line.updatedAt,
      })),
    };
  }

  /**
   * Convert database model to domain aggregate
   */
  private toDomain(model: OrderModel): OrderAggregate {
    const orderLines = model.orderLines.map((lineModel) =>
      OrderLineEntity.create(
        lineModel.productId,
        lineModel.productName,
        lineModel.quantity,
        Money.create(lineModel.unitPrice, lineModel.currency),
        Money.create(lineModel.discount, lineModel.currency),
        lineModel.id
      )
    );

    const shippingAddress = ShippingAddress.create(
      model.shippingStreet,
      model.shippingCity,
      model.shippingState,
      model.shippingZipCode,
      model.shippingCountry
    );

    const status = OrderStatus.create(model.status as any);

    return OrderAggregate.reconstitute(
      model.id,
      model.customerId,
      orderLines,
      shippingAddress,
      status,
      model.currency,
      model.trackingNumber,
      model.createdAt,
      model.updatedAt
    );
  }
}
