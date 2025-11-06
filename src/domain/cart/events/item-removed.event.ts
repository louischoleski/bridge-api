import { BaseDomainEvent } from '~domain/shared/events/domain-event.interface';

export class ItemRemovedEvent extends BaseDomainEvent {
  constructor(cartId: string, productId: string) {
    super(cartId, 'ItemRemoved', { productId });
  }

  get productId(): string {
    return this.eventData.productId;
  }
}
