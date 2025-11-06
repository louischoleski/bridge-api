import { v4 as uuid } from 'uuid';

/**
 * Base Entity class implementing core entity behavior
 * All domain entities should extend this class
 */
export abstract class BaseEntity<T> {
  protected readonly _id: string;
  protected readonly props: T;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(props: T, id?: string) {
    this._id = id || uuid();
    this.props = props;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Entities are equal if they have the same ID
   */
  public equals(entity?: BaseEntity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }

  /**
   * Mark entity as updated
   */
  protected markAsUpdated(): void {
    this._updatedAt = new Date();
  }
}
