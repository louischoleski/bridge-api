import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { ValueObject } from '~domain/shared/value-objects/value-object.base';

interface ProductCategoryProps {
  name: string;
  slug: string;
}

/**
 * Product Category Value Object
 */
export class ProductCategory extends ValueObject<ProductCategoryProps> {
  private constructor(props: ProductCategoryProps) {
    super(props);
  }

  public static create(name: string, slug?: string): ProductCategory {
    const categorySlug = slug || ProductCategory.generateSlug(name);
    return new ProductCategory({ name: name.trim(), slug: categorySlug });
  }

  protected validate(props: ProductCategoryProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationException('Category name cannot be empty');
    }

    if (!props.slug || props.slug.trim().length === 0) {
      throw new ValidationException('Category slug cannot be empty');
    }

    if (!/^[a-z0-9-]+$/.test(props.slug)) {
      throw new ValidationException(
        'Category slug must contain only lowercase letters, numbers, and hyphens'
      );
    }
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  public toString(): string {
    return this.props.name;
  }
}
