import { ProductCategory } from '~domain/product/value-objects/product-category.vo';
import { Sku } from '~domain/product/value-objects/sku.vo';
import { BaseEntity } from '~domain/shared/entities/base.entity';
import { ValidationException } from '~domain/shared/exceptions/domain.exception';
import { Money } from '~domain/shared/value-objects/money.vo';

interface ProductProps {
  name: string;
  description: string;
  sku: Sku;
  price: Money;
  category: ProductCategory;
  stockQuantity: number;
  isActive: boolean;
  imageUrls: string[];
  metadata: Record<string, unknown>;
}

/**
 * Product Entity
 */
export class ProductEntity extends BaseEntity<ProductProps> {
  private constructor(props: ProductProps, id?: string) {
    super(props, id);
  }

  public static create(
    name: string,
    description: string,
    sku: string,
    price: Money,
    category: ProductCategory,
    stockQuantity = 0,
    id?: string
  ): ProductEntity {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Product name is required');
    }

    if (!description || description.trim().length === 0) {
      throw new ValidationException('Product description is required');
    }

    if (stockQuantity < 0) {
      throw new ValidationException('Stock quantity cannot be negative');
    }

    return new ProductEntity(
      {
        name: name.trim(),
        description: description.trim(),
        sku: Sku.create(sku),
        price,
        category,
        stockQuantity,
        isActive: true,
        imageUrls: [],
        metadata: {},
      },
      id
    );
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get sku(): Sku {
    return this.props.sku;
  }

  get price(): Money {
    return this.props.price;
  }

  get category(): ProductCategory {
    return this.props.category;
  }

  get stockQuantity(): number {
    return this.props.stockQuantity;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get imageUrls(): ReadonlyArray<string> {
    return this.props.imageUrls;
  }

  get metadata(): Readonly<Record<string, unknown>> {
    return this.props.metadata;
  }

  /**
   * Update product price
   */
  public updatePrice(newPrice: Money): void {
    if (newPrice.currency !== this.props.price.currency) {
      throw new ValidationException('Cannot change product currency');
    }

    this.props.price = newPrice;
    this.markAsUpdated();
  }

  /**
   * Update product name
   */
  public updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new ValidationException('Product name cannot be empty');
    }

    this.props.name = newName.trim();
    this.markAsUpdated();
  }

  /**
   * Update product description
   */
  public updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim().length === 0) {
      throw new ValidationException('Product description cannot be empty');
    }

    this.props.description = newDescription.trim();
    this.markAsUpdated();
  }

  /**
   * Increase stock quantity
   */
  public increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationException('Quantity must be positive');
    }

    this.props.stockQuantity += quantity;
    this.markAsUpdated();
  }

  /**
   * Decrease stock quantity
   */
  public decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationException('Quantity must be positive');
    }

    if (this.props.stockQuantity < quantity) {
      throw new ValidationException('Insufficient stock');
    }

    this.props.stockQuantity -= quantity;
    this.markAsUpdated();
  }

  /**
   * Add product image
   */
  public addImage(imageUrl: string): void {
    if (!imageUrl || imageUrl.trim().length === 0) {
      throw new ValidationException('Image URL cannot be empty');
    }

    this.props.imageUrls.push(imageUrl.trim());
    this.markAsUpdated();
  }

  /**
   * Remove product image
   */
  public removeImage(imageUrl: string): void {
    const index = this.props.imageUrls.indexOf(imageUrl);
    if (index > -1) {
      this.props.imageUrls.splice(index, 1);
      this.markAsUpdated();
    }
  }

  /**
   * Activate product
   */
  public activate(): void {
    this.props.isActive = true;
    this.markAsUpdated();
  }

  /**
   * Deactivate product
   */
  public deactivate(): void {
    this.props.isActive = false;
    this.markAsUpdated();
  }

  /**
   * Update product category
   */
  public updateCategory(newCategory: ProductCategory): void {
    this.props.category = newCategory;
    this.markAsUpdated();
  }

  /**
   * Set metadata
   */
  public setMetadata(key: string, value: unknown): void {
    this.props.metadata[key] = value;
    this.markAsUpdated();
  }

  /**
   * Check if product is in stock
   */
  public isInStock(): boolean {
    return this.props.stockQuantity > 0;
  }

  /**
   * Check if product is available (active and in stock)
   */
  public isAvailable(): boolean {
    return this.props.isActive && this.isInStock();
  }
}
