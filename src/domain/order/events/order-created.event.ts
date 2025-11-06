import { BaseDomainEvent } from '~domain/shared/events/domain-event.interface';

export class OrderCreatedEvent extends BaseDomainEvent {
  constructor(orderId: string, customerId: string, totalAmount: number) {
    super(orderId, 'OrderCreated', { customerId, totalAmount });
  }

  get customerId(): string {
    return this.eventData.customerId;
  }

  get totalAmount(): number {
    return this.eventData.totalAmount;
  }
}
