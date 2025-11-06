import { BaseDomainEvent } from '~domain/shared/events/domain-event.interface';

export class ItemAddedEvent extends BaseDomainEvent {
  constructor(
    cartId: string,
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: number
  ) {
    super(cartId, 'ItemAdded', { productId, productName, quantity, unitPrice });
  }

  get productId(): string {
    return this.eventData.productId;
  }

  get productName(): string {
    return this.eventData.productName;
  }

  get quantity(): number {
    return this.eventData.quantity;
  }

  get unitPrice(): number {
    return this.eventData.unitPrice;
  }
}
