/**
 * Context Expired Event
 * Triggered when a Salesforce cart context expires
 */
export class ContextExpiredEvent {
  public readonly occurredOn: Date;
  public readonly eventName = 'salesforce.context.expired';

  constructor(
    public readonly contextId: string,
    public readonly customerId: string,
    public readonly cartId?: string
  ) {
    this.occurredOn = new Date();
  }
}
