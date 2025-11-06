import { BaseDomainEvent } from '~domain/shared/events/domain-event.interface';

export class OrderCancelledEvent extends BaseDomainEvent {
  constructor(orderId: string, reason: string) {
    super(orderId, 'OrderCancelled', { reason });
  }

  get reason(): string {
    return this.eventData.reason;
  }
}
