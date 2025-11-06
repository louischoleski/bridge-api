import { BaseEntity } from '~domain/shared/entities/base.entity';
import { DomainEvent } from '~domain/shared/events/domain-event.interface';

/**
 * Base Aggregate Root class
 * Aggregates are consistency boundaries in DDD
 */
export abstract class AggregateRoot<T> extends BaseEntity<T> {
  private domainEvents: DomainEvent[] = [];

  /**
   * Add a domain event to be published
   */
  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Get all domain events
   */
  public getDomainEvents(): ReadonlyArray<DomainEvent> {
    return this.domainEvents;
  }

  /**
   * Clear all domain events (after publishing)
   */
  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  /**
   * Check if aggregate has unpublished events
   */
  public hasDomainEvents(): boolean {
    return this.domainEvents.length > 0;
  }
}
