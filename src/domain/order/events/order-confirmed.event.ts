import { BaseDomainEvent } from '~domain/shared/events/domain-event.interface';

export class OrderConfirmedEvent extends BaseDomainEvent {
  constructor(orderId: string) {
    super(orderId, 'OrderConfirmed', {});
  }
}
