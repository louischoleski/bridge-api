/**
 * Cart Synced Event
 * Triggered when a cart is successfully synced with Salesforce
 */
export class CartSyncedEvent {
  public readonly occurredOn: Date;
  public readonly eventName = 'salesforce.cart.synced';

  constructor(
    public readonly cartId: string,
    public readonly contextId: string,
    public readonly customerId: string
  ) {
    this.occurredOn = new Date();
  }
}
