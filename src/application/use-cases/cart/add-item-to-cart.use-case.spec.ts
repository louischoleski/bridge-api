import test from 'ava';

import { AddItemToCartUseCase } from '~application/use-cases/cart/add-item-to-cart.use-case';
import { ProductEntity } from '~domain/product/entities/product.entity';
import { ProductCategory } from '~domain/product/value-objects/product-category.vo';
import { Money } from '~domain/shared/value-objects/money.vo';
import { CartRepository } from '~infrastructure/persistence/repositories/cart.repository';
import { ProductRepository } from '~infrastructure/persistence/repositories/product.repository';

test('should add item to new cart', async (t) => {
  const cartRepo = new CartRepository();
  const productRepo = new ProductRepository();
  const useCase = new AddItemToCartUseCase(cartRepo, productRepo);

  // Setup test product
  const product = ProductEntity.create(
    'Test Product',
    'Test Description',
    'TEST-123',
    Money.create(99.99, 'CAD'),
    ProductCategory.create('Electronics'),
    10
  );
  await productRepo.save(product);

  // Execute
  await useCase.execute({
    customerId: 'customer-123',
    productId: product.id,
    quantity: 2,
  });

  // Verify
  const cart = await cartRepo.findActiveByCustomerId('customer-123');
  t.truthy(cart);
  t.is(cart!.items.length, 1);
  t.is(cart!.items[0].productId, product.id);
  t.is(cart!.items[0].quantity.value, 2);
});

test('should add item to existing cart', async (t) => {
  const cartRepo = new CartRepository();
  const productRepo = new ProductRepository();
  const useCase = new AddItemToCartUseCase(cartRepo, productRepo);

  // Setup test products
  const product1 = ProductEntity.create(
    'Product 1',
    'Description 1',
    'PROD-1',
    Money.create(50, 'CAD'),
    ProductCategory.create('Electronics'),
    10
  );
  const product2 = ProductEntity.create(
    'Product 2',
    'Description 2',
    'PROD-2',
    Money.create(30, 'CAD'),
    ProductCategory.create('Electronics'),
    10
  );
  await productRepo.save(product1);
  await productRepo.save(product2);

  // Add first item
  await useCase.execute({
    customerId: 'customer-456',
    productId: product1.id,
    quantity: 1,
  });

  // Add second item
  await useCase.execute({
    customerId: 'customer-456',
    productId: product2.id,
    quantity: 2,
  });

  // Verify
  const cart = await cartRepo.findActiveByCustomerId('customer-456');
  t.truthy(cart);
  t.is(cart!.items.length, 2);
});

test('should throw error when product not found', async (t) => {
  const cartRepo = new CartRepository();
  const productRepo = new ProductRepository();
  const useCase = new AddItemToCartUseCase(cartRepo, productRepo);

  await t.throwsAsync(
    async () => {
      await useCase.execute({
        customerId: 'customer-789',
        productId: 'non-existent-product',
        quantity: 1,
      });
    },
    { message: /not found/ }
  );
});
