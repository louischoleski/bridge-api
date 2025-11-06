/**
 * Dependency Injection Container
 * Manages application dependencies and their lifecycle
 */

import { CartRepository } from '~infrastructure/persistence/repositories/cart.repository';
import { OrderRepository } from '~infrastructure/persistence/repositories/order.repository';
import { ProductRepository } from '~infrastructure/persistence/repositories/product.repository';
import { UserRepository } from '~infrastructure/persistence/repositories/user.repository';
import { ICartRepository } from '~domain/cart/repositories/cart.repository.interface';
import { IOrderRepository } from '~domain/order/repositories/order.repository.interface';
import { IProductRepository } from '~domain/product/repositories/product.repository.interface';
import { IUserRepository } from '~domain/user/repositories/user.repository.interface';

// Use Cases
import { AddItemToCartUseCase } from '~application/use-cases/cart/add-item-to-cart.use-case';
import { RemoveItemFromCartUseCase } from '~application/use-cases/cart/remove-item-from-cart.use-case';
import { GetCartUseCase } from '~application/use-cases/cart/get-cart.use-case';
import { UpdateCartItemUseCase } from '~application/use-cases/cart/update-cart-item.use-case';
import { ClearCartUseCase } from '~application/use-cases/cart/clear-cart.use-case';
import { CreateOrderUseCase } from '~application/use-cases/order/create-order.use-case';
import { GetOrderUseCase } from '~application/use-cases/order/get-order.use-case';
import { CancelOrderUseCase } from '~application/use-cases/order/cancel-order.use-case';
import { GetProductUseCase } from '~application/use-cases/product/get-product.use-case';
import { SearchProductsUseCase } from '~application/use-cases/product/search-products.use-case';
import { CreateProductUseCase } from '~application/use-cases/product/create-product.use-case';
import { UpdateProductUseCase } from '~application/use-cases/product/update-product.use-case';
import { DeleteProductUseCase } from '~application/use-cases/product/delete-product.use-case';
import { LoginUseCase } from '~application/use-cases/auth/login.use-case';

// Controllers
import { CartController } from '~api/rest/controllers/cart.controller';
import { OrderController } from '~api/rest/controllers/order.controller';
import { ProductController } from '~api/rest/controllers/product.controller';

// Infrastructure
import { SalesforceClient } from '~infrastructure/external/salesforce/salesforce.client';
import { EventBus } from '~infrastructure/messaging/event-bus';
import { LoggerService } from '~infrastructure/logging/logger.service';
import { EnvironmentConfig } from './environment';

/**
 * Dependency Injection Container
 */
export class DIContainer {
  private static instance: DIContainer;

  // Repositories
  private _cartRepository?: ICartRepository;
  private _orderRepository?: IOrderRepository;
  private _productRepository?: IProductRepository;
  private _userRepository?: IUserRepository;

  // Use Cases - Cart
  private _addItemToCartUseCase?: AddItemToCartUseCase;
  private _removeItemFromCartUseCase?: RemoveItemFromCartUseCase;
  private _getCartUseCase?: GetCartUseCase;
  private _updateCartItemUseCase?: UpdateCartItemUseCase;
  private _clearCartUseCase?: ClearCartUseCase;

  // Use Cases - Order
  private _createOrderUseCase?: CreateOrderUseCase;
  private _getOrderUseCase?: GetOrderUseCase;
  private _cancelOrderUseCase?: CancelOrderUseCase;

  // Use Cases - Product
  private _getProductUseCase?: GetProductUseCase;
  private _searchProductsUseCase?: SearchProductsUseCase;
  private _createProductUseCase?: CreateProductUseCase;
  private _updateProductUseCase?: UpdateProductUseCase;
  private _deleteProductUseCase?: DeleteProductUseCase;

  // Use Cases - Auth
  private _loginUseCase?: LoginUseCase;

  // Controllers
  private _cartController?: CartController;
  private _orderController?: OrderController;
  private _productController?: ProductController;

  // Infrastructure
  private _salesforceClient?: SalesforceClient;
  private _eventBus?: EventBus;
  private _logger?: LoggerService;

  private config: EnvironmentConfig;

  private constructor(config: EnvironmentConfig) {
    this.config = config;
  }

  public static getInstance(config: EnvironmentConfig): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer(config);
    }
    return DIContainer.instance;
  }

  // Repositories
  get cartRepository(): ICartRepository {
    if (!this._cartRepository) {
      this._cartRepository = new CartRepository();
    }
    return this._cartRepository;
  }

  get orderRepository(): IOrderRepository {
    if (!this._orderRepository) {
      this._orderRepository = new OrderRepository();
    }
    return this._orderRepository;
  }

  get productRepository(): IProductRepository {
    if (!this._productRepository) {
      this._productRepository = new ProductRepository();
    }
    return this._productRepository;
  }

  get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository();
    }
    return this._userRepository;
  }

  // Use Cases - Cart
  get addItemToCartUseCase(): AddItemToCartUseCase {
    if (!this._addItemToCartUseCase) {
      this._addItemToCartUseCase = new AddItemToCartUseCase(
        this.cartRepository,
        this.productRepository
      );
    }
    return this._addItemToCartUseCase;
  }

  get removeItemFromCartUseCase(): RemoveItemFromCartUseCase {
    if (!this._removeItemFromCartUseCase) {
      this._removeItemFromCartUseCase = new RemoveItemFromCartUseCase(
        this.cartRepository
      );
    }
    return this._removeItemFromCartUseCase;
  }

  get getCartUseCase(): GetCartUseCase {
    if (!this._getCartUseCase) {
      this._getCartUseCase = new GetCartUseCase(this.cartRepository);
    }
    return this._getCartUseCase;
  }

  get updateCartItemUseCase(): UpdateCartItemUseCase {
    if (!this._updateCartItemUseCase) {
      this._updateCartItemUseCase = new UpdateCartItemUseCase(
        this.cartRepository
      );
    }
    return this._updateCartItemUseCase;
  }

  get clearCartUseCase(): ClearCartUseCase {
    if (!this._clearCartUseCase) {
      this._clearCartUseCase = new ClearCartUseCase(this.cartRepository);
    }
    return this._clearCartUseCase;
  }

  // Use Cases - Order
  get createOrderUseCase(): CreateOrderUseCase {
    if (!this._createOrderUseCase) {
      this._createOrderUseCase = new CreateOrderUseCase(
        this.orderRepository,
        this.cartRepository
      );
    }
    return this._createOrderUseCase;
  }

  get getOrderUseCase(): GetOrderUseCase {
    if (!this._getOrderUseCase) {
      this._getOrderUseCase = new GetOrderUseCase(this.orderRepository);
    }
    return this._getOrderUseCase;
  }

  get cancelOrderUseCase(): CancelOrderUseCase {
    if (!this._cancelOrderUseCase) {
      this._cancelOrderUseCase = new CancelOrderUseCase(this.orderRepository);
    }
    return this._cancelOrderUseCase;
  }

  // Use Cases - Product
  get getProductUseCase(): GetProductUseCase {
    if (!this._getProductUseCase) {
      this._getProductUseCase = new GetProductUseCase(this.productRepository);
    }
    return this._getProductUseCase;
  }

  get searchProductsUseCase(): SearchProductsUseCase {
    if (!this._searchProductsUseCase) {
      this._searchProductsUseCase = new SearchProductsUseCase(
        this.productRepository
      );
    }
    return this._searchProductsUseCase;
  }

  get createProductUseCase(): CreateProductUseCase {
    if (!this._createProductUseCase) {
      this._createProductUseCase = new CreateProductUseCase(
        this.productRepository
      );
    }
    return this._createProductUseCase;
  }

  get updateProductUseCase(): UpdateProductUseCase {
    if (!this._updateProductUseCase) {
      this._updateProductUseCase = new UpdateProductUseCase(
        this.productRepository
      );
    }
    return this._updateProductUseCase;
  }

  get deleteProductUseCase(): DeleteProductUseCase {
    if (!this._deleteProductUseCase) {
      this._deleteProductUseCase = new DeleteProductUseCase(
        this.productRepository
      );
    }
    return this._deleteProductUseCase;
  }

  get loginUseCase(): LoginUseCase {
    if (!this._loginUseCase) {
      this._loginUseCase = new LoginUseCase(this.userRepository);
    }
    return this._loginUseCase;
  }

  // Controllers
  get cartController(): CartController {
    if (!this._cartController) {
      this._cartController = new CartController(
        this.addItemToCartUseCase,
        this.removeItemFromCartUseCase,
        this.getCartUseCase,
        this.updateCartItemUseCase,
        this.clearCartUseCase
      );
    }
    return this._cartController;
  }

  get orderController(): OrderController {
    if (!this._orderController) {
      this._orderController = new OrderController(
        this.createOrderUseCase,
        this.getOrderUseCase,
        this.cancelOrderUseCase
      );
    }
    return this._orderController;
  }

  get productController(): ProductController {
    if (!this._productController) {
      this._productController = new ProductController(
        this.getProductUseCase,
        this.searchProductsUseCase,
        this.createProductUseCase,
        this.updateProductUseCase,
        this.deleteProductUseCase
      );
    }
    return this._productController;
  }

  // Infrastructure
  get salesforceClient(): SalesforceClient {
    if (!this._salesforceClient) {
      this._salesforceClient = new SalesforceClient({
        instanceUrl: this.config.salesforceInstanceUrl,
        accessToken: this.config.salesforceAccessToken,
        apiVersion: this.config.salesforceApiVersion,
      });
    }
    return this._salesforceClient;
  }

  get eventBus(): EventBus {
    if (!this._eventBus) {
      this._eventBus = new EventBus();
    }
    return this._eventBus;
  }

  get logger(): LoggerService {
    if (!this._logger) {
      this._logger = new LoggerService('Application');
    }
    return this._logger;
  }

  /**
   * Generic getter method for use cases
   */
  get<T>(key: string): T {
    const getter = (this as any)[key];
    if (typeof getter === 'function') {
      return getter.call(this);
    }
    throw new Error(`Dependency not found: ${key}`);
  }
}

// Export global container instance (initialized in server.ts)
let globalContainer: DIContainer | null = null;

export function setGlobalContainer(container: DIContainer): void {
  globalContainer = container;
}

export function getGlobalContainer(): DIContainer {
  if (!globalContainer) {
    throw new Error('DI Container not initialized. Call setGlobalContainer first.');
  }
  return globalContainer;
}
