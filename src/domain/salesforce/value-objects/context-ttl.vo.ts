import { ValueObject } from '~domain/shared/value-objects/value-object.base';

interface ContextTTLProps {
  seconds: number;
}

/**
 * Context Time-To-Live Value Object
 * Represents the lifespan of a Salesforce cart context
 */
export class ContextTTL extends ValueObject<ContextTTLProps> {
  public static readonly DEFAULT_TTL_SECONDS = 900; // 15 minutes
  public static readonly MIN_TTL_SECONDS = 60; // 1 minute
  public static readonly MAX_TTL_SECONDS = 7200; // 2 hours

  private constructor(props: ContextTTLProps) {
    super(props);
  }

  public static create(seconds?: number): ContextTTL {
    return new ContextTTL({
      seconds: seconds ?? ContextTTL.DEFAULT_TTL_SECONDS,
    });
  }

  get seconds(): number {
    return this.props.seconds;
  }

  get milliseconds(): number {
    return this.props.seconds * 1000;
  }

  /**
   * Check if TTL has expired
   */
  public hasExpired(createdAt: Date, now: Date = new Date()): boolean {
    const expiresAt = new Date(createdAt.getTime() + this.milliseconds);
    return now >= expiresAt;
  }

  /**
   * Get expiration date
   */
  public getExpiresAt(createdAt: Date): Date {
    return new Date(createdAt.getTime() + this.milliseconds);
  }

  /**
   * Get remaining seconds
   */
  public getRemainingSeconds(createdAt: Date, now: Date = new Date()): number {
    const expiresAt = this.getExpiresAt(createdAt);
    const remaining = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
    return Math.max(0, remaining);
  }

  protected validate(props: ContextTTLProps): void {
    if (
      props.seconds < ContextTTL.MIN_TTL_SECONDS ||
      props.seconds > ContextTTL.MAX_TTL_SECONDS
    ) {
      throw new Error(
        `TTL must be between ${ContextTTL.MIN_TTL_SECONDS} and ${ContextTTL.MAX_TTL_SECONDS} seconds`
      );
    }
  }
}
