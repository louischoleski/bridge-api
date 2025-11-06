import { BaseDomainEvent } from '~domain/shared/events/domain-event.interface';

export class OrderShippedEvent extends BaseDomainEvent {
  constructor(orderId: string, trackingNumber?: string) {
    super(orderId, 'OrderShipped', { trackingNumber });
  }

  get trackingNumber(): string | undefined {
    return this.eventData.trackingNumber;
  }
}
