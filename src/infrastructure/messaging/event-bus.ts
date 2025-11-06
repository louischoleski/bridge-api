import { DomainEvent } from '~domain/shared/events/domain-event.interface';

/**
 * Event Handler Interface
 */
export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

/**
 * Event Bus
 * Publishes and handles domain events
 */
export class EventBus {
  private handlers: Map<string, IEventHandler<any>[]> = new Map();

  /**
   * Register event handler
   */
  register<T extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): void {
    const existingHandlers = this.handlers.get(eventType) || [];
    existingHandlers.push(handler);
    this.handlers.set(eventType, existingHandlers);
  }

  /**
   * Publish event
   */
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventType}:`, error);
        // In production: log to monitoring service
      }
    }
  }

  /**
   * Publish multiple events
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
