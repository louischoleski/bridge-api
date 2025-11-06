import { BaseDomainEvent } from '~domain/shared/events/domain-event.interface';

export class CartCheckedOutEvent extends BaseDomainEvent {
  constructor(cartId: string, customerId: string, totalAmount: number) {
    super(cartId, 'CartCheckedOut', { customerId, totalAmount });
  }

  get customerId(): string {
    return this.eventData.customerId;
  }

  get totalAmount(): number {
    return this.eventData.totalAmount;
  }
}
