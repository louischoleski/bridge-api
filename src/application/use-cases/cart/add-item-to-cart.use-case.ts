import { CartAggregate } from '~domain/cart/aggregates/cart.aggregate';
import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';
import { IProductRepository } from '~domain/product/repositories/product.repository.interface';
import { ISalesforceCartService } from '~domain/salesforce/services/salesforce-cart.service.interface';
import { ISalesforceContextRepository } from '~domain/salesforce/repositories/salesforce-context.repository.interface';
import { NotFoundException } from '~domain/shared/exceptions/domain.exception';

export interface AddItemToCartInput {
  customerId: string;
  productId: string;
  quantity: number;
  syncToSalesforce?: boolean;
}

/**
 * Add Item to Cart Use Case
 */
export class AddItemToCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository,
    private readonly salesforceService?: ISalesforceCartService,
    private readonly salesforceContextRepository?: ISalesforceContextRepository
  ) {}

  async execute(input: AddItemToCartInput): Promise<void> {
    // Validate product exists and is available
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundException('Product', input.productId);
    }

    if (!product.isAvailable()) {
      throw new Error('Product is not available');
    }

    // Get or create cart
    let cart = await this.cartRepository.findActiveByCustomerId(
      input.customerId
    );

    if (!cart) {
      cart = CartAggregate.create(input.customerId, product.price.currency);
    }

    // Add item to cart
    cart.addItem(input.productId, product.name, input.quantity, product.price);

    // Persist cart
    await this.cartRepository.save(cart);

    // Optionally sync to Salesforce
    if (input.syncToSalesforce && this.salesforceService && this.salesforceContextRepository) {
      await this.syncToSalesforce(cart);
    }
  }

  private async syncToSalesforce(cart: CartAggregate): Promise<void> {
    if (!this.salesforceService || !this.salesforceContextRepository) {
      return;
    }

    try {
      // Get or create context
      let context = await this.salesforceContextRepository.findActiveByCustomerId(
        cart.customerId
      );

      if (!context || context.hasExpired()) {
        context = await this.salesforceService.createContext(cart.customerId);
        await this.salesforceContextRepository.save(context);
      }

      // Sync cart
      await this.salesforceService.syncCart(context, {
        cartId: cart.id,
        customerId: cart.customerId,
        items: cart.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity.value,
          unitPrice: item.unitPrice.amount,
          currency: item.unitPrice.currency,
        })),
        totalAmount: cart.getTotalAmount().amount,
        currency: cart.currency,
      });

      await this.salesforceContextRepository.save(context);
    } catch (error) {
      // Log error but don't fail the cart operation
      console.error('Failed to sync cart to Salesforce:', error);
    }
  }
}
