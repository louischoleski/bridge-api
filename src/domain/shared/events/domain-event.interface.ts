/**
 * Base interface for all domain events
 */
export interface DomainEvent {
  eventId: string;
  occurredOn: Date;
  aggregateId: string;
  eventType: string;
  eventData: Record<string, any>;
}

/**
 * Base class for domain events
 */
export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventType: string;
  public readonly eventData: Record<string, any>;

  constructor(
    aggregateId: string,
    eventType: string,
    eventData: Record<string, any>
  ) {
    this.eventId = this.generateEventId();
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.eventData = eventData;
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
