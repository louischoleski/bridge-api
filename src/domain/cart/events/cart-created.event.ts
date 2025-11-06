import { BaseDomainEvent } from '~domain/shared/events/domain-event.interface';

export class CartCreatedEvent extends BaseDomainEvent {
  constructor(cartId: string, customerId: string) {
    super(cartId, 'CartCreated', { customerId });
  }

  get customerId(): string {
    return this.eventData.customerId;
  }
}
