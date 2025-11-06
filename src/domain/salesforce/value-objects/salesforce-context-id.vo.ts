import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from '~domain/shared/value-objects/value-object.base';

interface SalesforceContextIdProps {
  value: string;
}

/**
 * Salesforce Context ID Value Object
 * Represents a unique identifier for a Salesforce cart context/session
 */
export class SalesforceContextId extends ValueObject<SalesforceContextIdProps> {
  private constructor(props: SalesforceContextIdProps) {
    super(props);
  }

  public static create(value?: string): SalesforceContextId {
    return new SalesforceContextId({
      value: value || `sf_ctx_${uuidv4()}`,
    });
  }

  get value(): string {
    return this.props.value;
  }

  protected validate(props: SalesforceContextIdProps): void {
    if (!props.value || props.value.trim().length === 0) {
      throw new Error('Salesforce Context ID cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}
