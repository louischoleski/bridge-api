import {
  CartAggregate,
  CartStatus,
} from '~domain/cart/aggregates/cart.aggregate';
import { CartItemEntity } from '~domain/cart/entities/cart-item.entity';
import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';
import { Money } from '~domain/shared/value-objects/money.vo';
import { CartModel } from '~infrastructure/persistence/models/cart.model';

/**
 * Cart Repository Implementation
 * This is a mock implementation. In production, integrate with your database
 */
export class CartRepository implements ICartRepository {
  private carts: Map<string, CartModel> = new Map();

  async save(cart: CartAggregate): Promise<void> {
    const cartModel = this.toModel(cart);
    this.carts.set(cart.id, cartModel);

    // In production: publish domain events here
    // const events = cart.getDomainEvents();
    // for (const event of events) {
    //   await this.eventBus.publish(event);
    // }
    // cart.clearDomainEvents();
  }

  async findById(id: string): Promise<CartAggregate | null> {
    const cartModel = this.carts.get(id);

    if (!cartModel) {
      return null;
    }

    return this.toDomain(cartModel);
  }

  async findActiveByCustomerId(
    customerId: string
  ): Promise<CartAggregate | null> {
    const cartModel = Array.from(this.carts.values()).find(
      (cart) =>
        cart.customerId === customerId && cart.status === CartStatus.ACTIVE
    );

    if (!cartModel) {
      return null;
    }

    return this.toDomain(cartModel);
  }

  async findAllByCustomerId(customerId: string): Promise<CartAggregate[]> {
    const cartModels = Array.from(this.carts.values()).filter(
      (cart) => cart.customerId === customerId
    );

    return cartModels.map((model) => this.toDomain(model));
  }

  async delete(id: string): Promise<void> {
    this.carts.delete(id);
  }

  /**
   * Convert domain aggregate to database model
   */
  private toModel(cart: CartAggregate): CartModel {
    return {
      id: cart.id,
      customerId: cart.customerId,
      status: cart.status,
      currency: cart.currency,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: cart.items.map((item) => ({
        id: item.id,
        cartId: cart.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity.value,
        unitPrice: item.unitPrice.amount,
        discount: item.discount.amount,
        currency: item.unitPrice.currency,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }

  /**
   * Convert database model to domain aggregate
   */
  private toDomain(model: CartModel): CartAggregate {
    const items = model.items.map((itemModel) =>
      CartItemEntity.create(
        itemModel.productId,
        itemModel.productName,
        itemModel.quantity,
        Money.create(itemModel.unitPrice, itemModel.currency),
        itemModel.id
      )
    );

    return CartAggregate.reconstitute(
      model.id,
      model.customerId,
      items,
      model.status as CartStatus,
      model.currency,
      model.createdAt,
      model.updatedAt
    );
  }
}
