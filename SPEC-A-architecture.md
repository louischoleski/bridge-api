# Architecture & Abstractions Specification

**Project:** Bridge API
**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Architecture Pattern:** Domain-Driven Design (DDD) with Clean Architecture

---

## Table of Contents

1. [Overview](#overview)
2. [Core Architectural Principles](#core-architectural-principles)
3. [Layer Structure](#layer-structure)
4. [Domain Layer](#domain-layer)
5. [Application Layer](#application-layer)
6. [Infrastructure Layer](#infrastructure-layer)
7. [API Layer](#api-layer)
8. [Dependency Injection](#dependency-injection)
9. [Data Flow](#data-flow)
10. [Design Patterns](#design-patterns)
11. [Naming Conventions](#naming-conventions)
12. [Extension Guidelines](#extension-guidelines)

---

## Overview

Bridge API is a RESTful API built using **Domain-Driven Design (DDD)** principles combined with **Clean Architecture**. The system is organized into distinct layers with clear boundaries and dependencies flowing inward toward the domain.

### Technology Stack
- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **Storage:** In-memory repositories (designed for easy database integration)
- **Authentication:** JWT tokens
- **Authorization:** Role-based access control (RBAC)

### Key Design Goals
1. **Separation of Concerns** - Each layer has a single, well-defined responsibility
2. **Testability** - Business logic isolated from infrastructure details
3. **Maintainability** - Clear structure makes code easy to understand and modify
4. **Extensibility** - Easy to add new features without modifying existing code
5. **Domain-Centric** - Business logic drives architecture decisions

---

## Core Architectural Principles

### 1. Dependency Rule
Dependencies must point **inward** only. Outer layers depend on inner layers, never the reverse.

```
API Layer → Application Layer → Domain Layer
                ↑
        Infrastructure Layer
```

### 2. Interface Segregation
- Domain defines interfaces (repository contracts)
- Infrastructure implements interfaces
- Application layer depends on interfaces, not implementations

### 3. Single Responsibility
Each class/module has one reason to change:
- **Entities** - Business rules that don't change based on use case
- **Use Cases** - Application-specific business rules
- **Controllers** - HTTP request/response handling
- **Repositories** - Data persistence abstraction

### 4. Immutability Where Possible
- Value Objects are immutable
- Domain events are immutable
- DTOs are readonly interfaces

---

## Layer Structure

```
src/
├── domain/                    # Core business logic (no external dependencies)
│   ├── {feature}/
│   │   ├── entities/         # Business entities
│   │   ├── aggregates/       # Aggregate roots
│   │   ├── value-objects/    # Value objects
│   │   ├── repositories/     # Repository interfaces
│   │   └── events/           # Domain events
│   └── shared/               # Shared domain concepts
│       ├── entities/
│       ├── value-objects/
│       ├── events/
│       └── exceptions/
│
├── application/              # Application business rules
│   ├── use-cases/           # Use case implementations
│   │   └── {feature}/
│   │       └── {action}.use-case.ts
│   ├── mappers/             # Domain ↔ DTO conversion
│   │   └── {feature}.mapper.ts
│   └── dtos/                # Data Transfer Objects
│       └── {feature}.dto.ts
│
├── infrastructure/          # External concerns (frameworks, tools)
│   ├── persistence/
│   │   ├── repositories/   # Repository implementations
│   │   └── models/         # Persistence models
│   ├── messaging/          # Event bus, message queues
│   ├── external/           # External service clients
│   ├── auth/               # Authentication services
│   └── logging/            # Logging services
│
├── api/                    # API interface layer
│   └── rest/
│       ├── controllers/    # HTTP controllers
│       ├── routes/         # Route definitions
│       ├── middlewares/    # Express middlewares
│       └── validators/     # Request validation
│
├── config/                 # Configuration
│   ├── dependency-injection.ts
│   └── environment.ts
│
└── server.ts              # Application entry point
```

---

## Domain Layer

The **Domain Layer** contains the core business logic and is **independent of all external concerns**.

### Entities

Business objects with identity that persists over time.

**Location:** `src/domain/{feature}/entities/{entity-name}.entity.ts`

**Structure:**
```typescript
export class UserEntity extends BaseEntity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(/* params */): UserEntity {
    // Validation
    // Business rules
    return new UserEntity(props, id);
  }

  public static reconstitute(/* params */): UserEntity {
    // Rebuild from persistence
    return new UserEntity(props, id);
  }

  // Business methods
  public updatePassword(newPassword: string): void {
    // Business logic
    this.markAsUpdated();
  }

  // Getters only (no setters)
  get email(): string {
    return this.props.email;
  }
}
```

**Rules:**
- Private constructor - use factory methods (`create`, `reconstitute`)
- `create()` - For new entities with business rules validation
- `reconstitute()` - For rebuilding from database
- No setters - use business methods that express intent
- Immutable ID after creation
- Encapsulate business rules

### Aggregates

Cluster of entities treated as a single unit for data changes.

**Location:** `src/domain/{feature}/aggregates/{aggregate-name}.aggregate.ts`

**Structure:**
```typescript
export class CartAggregate extends AggregateRoot<CartProps> {
  private constructor(props: CartProps, id?: string) {
    super(props, id);
  }

  public static create(customerId: string): CartAggregate {
    const cart = new CartAggregate({
      customerId,
      items: [],
      status: CartStatus.ACTIVE,
      // ...
    });

    // Raise domain event
    cart.addDomainEvent(new CartCreatedEvent(cart.id, customerId));
    return cart;
  }

  public addItem(item: CartItemEntity): void {
    // Business rules
    this.props.items.push(item);
    this.addDomainEvent(new ItemAddedToCartEvent(this.id, item.id));
    this.markAsUpdated();
  }

  get items(): ReadonlyArray<CartItemEntity> {
    return this.props.items;
  }
}
```

**Rules:**
- Inherits from `AggregateRoot`
- Only aggregate roots can be retrieved from repositories
- External objects can only hold references to aggregate root
- Aggregate enforces invariants across all entities
- Changes generate domain events

### Value Objects

Objects defined by their attributes, not identity.

**Location:** `src/domain/{feature}/value-objects/{value-object-name}.vo.ts`
**Location (shared):** `src/domain/shared/value-objects/{value-object-name}.vo.ts`

**Structure:**
```typescript
export class Email {
  private constructor(private readonly _value: string) {
    if (!this.isValid(_value)) {
      throw new ValidationException('Invalid email format');
    }
  }

  public static create(value: string): Email {
    return new Email(value.toLowerCase().trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

**Rules:**
- Immutable - all properties readonly
- Private constructor, public factory method
- Self-validating - validation in constructor
- Compared by value, not reference
- No setters, only methods that return new instances

### Repository Interfaces

Define contracts for data persistence.

**Location:** `src/domain/{feature}/repositories/{feature}.repository.interface.ts`

**Structure:**
```typescript
export interface IUserRepository {
  save(user: UserEntity): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  delete(id: string): Promise<void>;
}
```

**Rules:**
- Work with domain entities/aggregates, not DTOs or models
- Return `null` for not found (not undefined)
- Use domain types only
- Methods express business intent (`findActiveByCustomerId`, not `query`)
- No leaky abstractions (no SQL, no framework types)

### Domain Events

Represent something that happened in the domain.

**Location:** `src/domain/{feature}/events/{event-name}.event.ts`

**Structure:**
```typescript
export interface OrderCreatedEvent extends DomainEvent {
  eventName: 'OrderCreated';
  aggregateId: string;
  customerId: string;
  totalAmount: number;
  timestamp: Date;
}
```

**Rules:**
- Past tense naming (`OrderCreated`, not `CreateOrder`)
- Immutable
- Include all data needed by consumers
- Timestamp included

---

## Application Layer

The **Application Layer** orchestrates business logic but contains no domain rules.

### Use Cases

Represent application-specific business rules.

**Location:** `src/application/use-cases/{feature}/{action}.use-case.ts`

**Structure:**
```typescript
export interface CreateProductUseCaseInput {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  category: string;
}

export interface CreateProductUseCaseOutput {
  id: string;
  name: string;
  sku: string;
  // ... DTO representation
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: CreateProductUseCaseInput): Promise<CreateProductUseCaseOutput> {
    // 1. Validate input
    // 2. Check business rules (SKU uniqueness, etc.)
    // 3. Create domain entity
    // 4. Save via repository
    // 5. Return DTO

    const existingProduct = await this.productRepository.findBySku(input.sku);
    if (existingProduct) {
      throw new Error(`Product with SKU ${input.sku} already exists`);
    }

    const product = ProductEntity.create(
      input.name,
      input.description,
      input.sku,
      Money.create(input.price, input.currency),
      ProductCategory.create(input.category)
    );

    await this.productRepository.save(product);

    return {
      id: product.id,
      name: product.name,
      sku: product.sku.value,
      // ...
    };
  }
}
```

**Rules:**
- One use case = one business operation
- Named with action verb (`CreateProduct`, `UpdateOrder`, `CancelOrder`)
- Input/Output interfaces defined
- Depends on repository interfaces (not implementations)
- Orchestrates flow, doesn't contain business rules
- Returns DTOs, not domain entities
- Throws descriptive errors
- Single `execute()` method

### Mappers

Convert between domain entities and DTOs.

**Location:** `src/application/mappers/{feature}.mapper.ts`

**Structure:**
```typescript
export class ProductMapper {
  static toDTO(product: ProductEntity): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku.value,
      price: product.price.amount,
      currency: product.price.currency,
      category: product.category.name,
      // ...
    };
  }

  static toDomain(dto: ProductDTO): ProductEntity {
    return ProductEntity.reconstitute(
      dto.id,
      dto.name,
      dto.sku,
      Money.create(dto.price, dto.currency),
      ProductCategory.create(dto.category)
    );
  }
}
```

**Rules:**
- Static methods only
- Bidirectional conversion (toDTO, toDomain)
- Extract value object values for DTOs
- No business logic

---

## Infrastructure Layer

The **Infrastructure Layer** provides implementations for interfaces defined in domain.

### Repository Implementations

**Location:** `src/infrastructure/persistence/repositories/{feature}.repository.ts`

**Structure:**
```typescript
export class ProductRepository implements IProductRepository {
  private products: Map<string, ProductModel> = new Map();

  async save(product: ProductEntity): Promise<void> {
    const productModel = this.toModel(product);
    this.products.set(product.id, productModel);

    // In production: publish domain events here
    // const events = product.getDomainEvents();
    // for (const event of events) {
    //   await this.eventBus.publish(event);
    // }
    // product.clearDomainEvents();
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const productModel = this.products.get(id);
    if (!productModel) {
      return null;
    }
    return this.toDomain(productModel);
  }

  private toModel(product: ProductEntity): ProductModel {
    // Convert domain entity to persistence model
  }

  private toDomain(model: ProductModel): ProductEntity {
    // Convert persistence model to domain entity
  }
}
```

**Rules:**
- Implements repository interface from domain
- Works with persistence models internally
- Converts between domain entities and models
- Encapsulates storage mechanism (Map, MongoDB, PostgreSQL, etc.)
- Returns domain entities, not models
- Comments indicate where to add database integration

### Persistence Models

**Location:** `src/infrastructure/persistence/models/{feature}.model.ts`

**Structure:**
```typescript
export interface ProductModel {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  category: string;
  stockQuantity: number;
  isActive: boolean;
  imageUrls: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

**Rules:**
- Plain interfaces (no classes)
- Flat structure optimized for storage
- Primitive types only (no value objects)
- Maps to database schema
- Never exposed outside infrastructure layer

---

## API Layer

The **API Layer** handles HTTP concerns.

### Controllers

**Location:** `src/api/rest/controllers/{feature}.controller.ts`

**Structure:**
```typescript
export class ProductController {
  constructor(
    private readonly getProductUseCase: GetProductUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase
  ) {}

  async getProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const product = await this.getProductUseCase.execute(productId);
      res.status(200).json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await this.createProductUseCase.execute(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }
}
```

**Rules:**
- Depend on use cases (injected via constructor)
- One method per endpoint
- Extract data from request
- Call use case with extracted data
- Format response
- Pass errors to error middleware via `next()`
- No business logic
- Class-based for dependency injection

### Routes

**Location:** `src/api/rest/routes/{feature}.routes.ts`

**Structure:**
```typescript
export function createProductRoutes(
  productController: ProductController
): Router {
  const router = Router();

  router.get(
    '/',
    (req, res, next) => productController.searchProducts(req, res, next)
  );

  router.post(
    '/',
    authenticate,
    canCreate('product'),
    (req, res, next) => productController.createProduct(req, res, next)
  );

  return router;
}
```

**Rules:**
- Factory functions that accept controller
- Define routes with HTTP methods
- Apply middlewares (auth, validation, permissions)
- Delegate to controller methods
- Return configured router

### Middlewares

**Location:** `src/api/rest/middlewares/{middleware-name}.middleware.ts`

**Types:**
- **Authentication** - Verify JWT tokens
- **Authorization** - Check permissions/roles
- **Validation** - Validate request body/params
- **Error Handling** - Convert errors to HTTP responses

**Structure:**
```typescript
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }

    const payload = jwtService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      },
    });
  }
};
```

---

## Dependency Injection

**Location:** `src/config/dependency-injection.ts`

### Container Pattern

```typescript
export class DIContainer {
  private static instance: DIContainer;

  // Repositories
  private _productRepository?: IProductRepository;
  private _userRepository?: IUserRepository;

  // Use Cases
  private _createProductUseCase?: CreateProductUseCase;

  // Controllers
  private _productController?: ProductController;

  private constructor(config: EnvironmentConfig) {
    this.config = config;
  }

  public static getInstance(config: EnvironmentConfig): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer(config);
    }
    return DIContainer.instance;
  }

  // Lazy initialization with getters
  get productRepository(): IProductRepository {
    if (!this._productRepository) {
      this._productRepository = new ProductRepository();
    }
    return this._productRepository;
  }

  get createProductUseCase(): CreateProductUseCase {
    if (!this._createProductUseCase) {
      this._createProductUseCase = new CreateProductUseCase(
        this.productRepository
      );
    }
    return this._createProductUseCase;
  }

  get productController(): ProductController {
    if (!this._productController) {
      this._productController = new ProductController(
        this.getProductUseCase,
        this.createProductUseCase,
        this.updateProductUseCase,
        this.deleteProductUseCase
      );
    }
    return this._productController;
  }
}
```

### Rules
- Singleton pattern for container
- Lazy initialization (dependencies created on first use)
- Repositories → Use Cases → Controllers dependency chain
- All dependencies injected via constructor
- No `new` keyword outside DI container (except for domain entities)

### Global Container Access

For non-class-based patterns (e.g., auth controllers):

```typescript
let globalContainer: DIContainer | null = null;

export function setGlobalContainer(container: DIContainer): void {
  globalContainer = container;
}

export function getGlobalContainer(): DIContainer {
  if (!globalContainer) {
    throw new Error('DI Container not initialized');
  }
  return globalContainer;
}

// In server.ts
constructor() {
  this.container = DIContainer.getInstance(this.config);
  setGlobalContainer(this.container);
}
```

---

## Data Flow

### Create Operation Flow

```
HTTP Request (POST /products)
    ↓
Route Middleware (auth, validation)
    ↓
Controller.createProduct()
    ↓ (extract req.body)
CreateProductUseCase.execute(input)
    ↓ (validate, check business rules)
ProductEntity.create()
    ↓ (domain validation)
ProductRepository.save(entity)
    ↓ (convert to model)
Storage (Map/Database)
    ↓
Return DTO
    ↓
Controller formats response
    ↓
HTTP Response (201 Created)
```

### Read Operation Flow

```
HTTP Request (GET /products/:id)
    ↓
Route Middleware (optional auth)
    ↓
Controller.getProduct()
    ↓ (extract params)
GetProductUseCase.execute(id)
    ↓
ProductRepository.findById(id)
    ↓ (query storage)
Storage (Map/Database)
    ↓ (convert to entity)
Return ProductEntity
    ↓ (convert to DTO)
Return DTO
    ↓
Controller formats response
    ↓
HTTP Response (200 OK)
```

---

## Design Patterns

### 1. Repository Pattern
- **Purpose:** Abstract data access
- **Location:** Domain defines interface, Infrastructure implements
- **Example:** `IProductRepository` (interface) ← `ProductRepository` (implementation)

### 2. Factory Pattern
- **Purpose:** Encapsulate object creation
- **Location:** Entity/Aggregate static methods
- **Example:** `UserEntity.create()`, `CartAggregate.create()`

### 3. Value Object Pattern
- **Purpose:** Represent concepts by their attributes
- **Location:** Domain value objects
- **Example:** `Email`, `Money`, `ProductCategory`

### 4. Use Case Pattern
- **Purpose:** Application-specific business rules
- **Location:** Application layer
- **Example:** `CreateProductUseCase`, `UpdateOrderUseCase`

### 5. Mapper Pattern
- **Purpose:** Convert between layers
- **Location:** Application mappers
- **Example:** `ProductMapper.toDTO()`, `CartMapper.toDomain()`

### 6. Dependency Injection Pattern
- **Purpose:** Inversion of control
- **Location:** DI Container
- **Example:** Constructor injection of repositories into use cases

### 7. Middleware Pattern
- **Purpose:** Request processing pipeline
- **Location:** API middlewares
- **Example:** `authenticate`, `canCreate('product')`

---

## Naming Conventions

### Files
- **Entities:** `{name}.entity.ts` (e.g., `product.entity.ts`)
- **Aggregates:** `{name}.aggregate.ts` (e.g., `cart.aggregate.ts`)
- **Value Objects:** `{name}.vo.ts` (e.g., `email.vo.ts`)
- **Use Cases:** `{action}-{entity}.use-case.ts` (e.g., `create-product.use-case.ts`)
- **Controllers:** `{feature}.controller.ts` (e.g., `product.controller.ts`)
- **Repositories:** `{feature}.repository.ts` (e.g., `product.repository.ts`)
- **Routes:** `{feature}.routes.ts` (e.g., `product.routes.ts`)
- **Middlewares:** `{purpose}.middleware.ts` (e.g., `auth.middleware.ts`)

### Classes
- **Entities:** `{Name}Entity` (e.g., `UserEntity`)
- **Aggregates:** `{Name}Aggregate` (e.g., `CartAggregate`)
- **Value Objects:** `{Name}` (e.g., `Email`, `Money`)
- **Use Cases:** `{Action}{Entity}UseCase` (e.g., `CreateProductUseCase`)
- **Controllers:** `{Feature}Controller` (e.g., `ProductController`)
- **Repositories:** `{Feature}Repository` (e.g., `ProductRepository`)

### Interfaces
- **Repository Interfaces:** `I{Feature}Repository` (e.g., `IProductRepository`)
- **Use Case Input:** `{UseCase}Input` (e.g., `CreateProductUseCaseInput`)
- **Use Case Output:** `{UseCase}Output` (e.g., `CreateProductUseCaseOutput`)
- **DTOs:** `{Feature}DTO` (e.g., `ProductDTO`)
- **Events:** `{Entity}{PastTense}Event` (e.g., `OrderCreatedEvent`)

### Methods
- **Factory Methods:** `create()`, `reconstitute()`
- **Business Methods:** Action verbs expressing intent (e.g., `updatePassword()`, `addItem()`)
- **Use Case Method:** `execute()`
- **Repository Methods:** `save()`, `findById()`, `findByEmail()`, `delete()`

---

## Extension Guidelines

### Adding a New Feature

#### 1. Domain Layer (Core Business Logic)

**a. Create Value Objects**
```bash
src/domain/{feature}/value-objects/{name}.vo.ts
```

**b. Create Entity**
```bash
src/domain/{feature}/entities/{feature}.entity.ts
```
- Extend `BaseEntity<Props>`
- Private constructor
- Static `create()` and `reconstitute()` methods
- Business methods only

**c. Create Repository Interface**
```bash
src/domain/{feature}/repositories/{feature}.repository.interface.ts
```
- Define contract with domain types
- Methods: `save()`, `findById()`, etc.

#### 2. Application Layer (Use Cases)

**a. Create Use Cases**
```bash
src/application/use-cases/{feature}/{action}.use-case.ts
```
- Define Input/Output interfaces
- Inject repository interfaces
- Implement `execute()` method

**b. Create Mapper (if needed)**
```bash
src/application/mappers/{feature}.mapper.ts
```

#### 3. Infrastructure Layer (Implementation)

**a. Create Persistence Model**
```bash
src/infrastructure/persistence/models/{feature}.model.ts
```
- Plain interface with primitive types

**b. Create Repository Implementation**
```bash
src/infrastructure/persistence/repositories/{feature}.repository.ts
```
- Implement domain repository interface
- Convert between entity and model
- Currently use `Map<string, Model>` for storage

#### 4. API Layer (HTTP Interface)

**a. Create Controller**
```bash
src/api/rest/controllers/{feature}.controller.ts
```
- Inject use cases via constructor
- One method per endpoint
- Extract request data, call use case, format response

**b. Create Routes**
```bash
src/api/rest/routes/{feature}.routes.ts
```
- Factory function accepting controller
- Define routes with middlewares
- Return configured router

#### 5. Wire Up Dependencies

**Update DI Container:** `src/config/dependency-injection.ts`

```typescript
// Add repository
private _{feature}Repository?: I{Feature}Repository;

get {feature}Repository(): I{Feature}Repository {
  if (!this._{feature}Repository) {
    this._{feature}Repository = new {Feature}Repository();
  }
  return this._{feature}Repository;
}

// Add use cases
private _create{Feature}UseCase?: Create{Feature}UseCase;

get create{Feature}UseCase(): Create{Feature}UseCase {
  if (!this._create{Feature}UseCase) {
    this._create{Feature}UseCase = new Create{Feature}UseCase(
      this.{feature}Repository
    );
  }
  return this._create{Feature}UseCase;
}

// Add controller
private _{feature}Controller?: {Feature}Controller;

get {feature}Controller(): {Feature}Controller {
  if (!this._{feature}Controller) {
    this._{feature}Controller = new {Feature}Controller(
      this.get{Feature}UseCase,
      this.create{Feature}UseCase,
      // ... other use cases
    );
  }
  return this._{feature}Controller;
}
```

**Update Route Index:** `src/api/rest/routes/index.ts`

```typescript
// Add to RouteControllers interface
export interface RouteControllers {
  cartController: CartController;
  orderController: OrderController;
  productController: ProductController;
  {feature}Controller: {Feature}Controller; // Add this
}

// Mount routes
router.use('/{feature}s', create{Feature}Routes(controllers.{feature}Controller));
```

**Update Server:** `src/server.ts`

```typescript
const apiRoutes = createApiRoutes({
  cartController: this.container.cartController,
  orderController: this.container.orderController,
  productController: this.container.productController,
  {feature}Controller: this.container.{feature}Controller, // Add this
});
```

#### 6. Add Tests

```bash
src/application/use-cases/{feature}/{action}.use-case.spec.ts
src/domain/{feature}/entities/{feature}.entity.spec.ts
tests/e2e/{feature}.e2e.spec.ts
```

---

## Module Path Aliases

The project uses TypeScript path aliases for clean imports:

```json
{
  "~domain/*": ["src/domain/*"],
  "~application/*": ["src/application/*"],
  "~infrastructure/*": ["src/infrastructure/*"],
  "~api/*": ["src/api/*"],
  "~config/*": ["src/config/*"]
}
```

**Usage:**
```typescript
// Instead of:
import { ProductEntity } from '../../../domain/product/entities/product.entity';

// Use:
import { ProductEntity } from '~domain/product/entities/product.entity';
```

---

## Storage System Notes

### Current Implementation
- All repositories use in-memory `Map<string, Model>` storage
- Data is volatile (lost on restart)
- Suitable for development and testing

### Production Migration Path
Repository implementations are designed for easy database integration:

```typescript
export class ProductRepository implements IProductRepository {
  // Current: In-memory storage
  private products: Map<string, ProductModel> = new Map();

  // Production: Replace with database
  // private db: MongoDB | PostgreSQL | etc.

  async save(product: ProductEntity): Promise<void> {
    const productModel = this.toModel(product);

    // Current:
    this.products.set(product.id, productModel);

    // Production:
    // await this.db.collection('products').save(productModel);

    // Publish domain events
    // const events = product.getDomainEvents();
    // for (const event of events) {
    //   await this.eventBus.publish(event);
    // }
    // product.clearDomainEvents();
  }
}
```

**To integrate a real database:**
1. Install database driver (e.g., `mongodb`, `pg`)
2. Update repository constructor to accept database connection
3. Replace `Map` operations with database queries
4. Update DI container to inject database connection
5. No changes needed in domain or application layers!

---

## Testing Strategy

### Unit Tests
- **Domain Entities:** Business logic, validation rules
- **Value Objects:** Validation, immutability
- **Use Cases:** Application logic with mocked repositories

### Integration Tests
- **Repositories:** Data persistence and retrieval
- **API Controllers:** With real use cases

### E2E Tests
- **Full request/response cycle**
- **Test authentication and authorization**
- **Verify business workflows**

---

## Security Considerations

### Authentication
- JWT tokens with expiration
- Token verification middleware
- User payload attached to request

### Authorization
- Role-based access control (RBAC)
- Permission middleware (`canCreate`, `canUpdate`, `canDelete`)
- Resource-level permissions

### Input Validation
- Domain-level validation in entities/value objects
- Application-level validation in use cases
- API-level validation in middlewares

### Error Handling
- Never expose internal errors to clients
- Generic error messages for security
- Detailed logging server-side

---

## Performance Considerations

### Lazy Loading
- DI container uses lazy initialization
- Dependencies created only when needed

### Caching Strategy
- Repository layer is where caching should be implemented
- Transparent to domain and application layers

### Scalability
- Stateless API design
- Repository pattern allows easy sharding
- Event-driven architecture ready

---

## Future Enhancements

### Planned Features
1. **Event Bus Integration** - Publish domain events
2. **Database Integration** - Replace in-memory storage
3. **CQRS Pattern** - Separate read and write models
4. **API Versioning** - Support multiple API versions
5. **GraphQL Support** - Alternative to REST
6. **WebSocket Support** - Real-time updates
7. **Distributed Tracing** - Observability

### Extension Points
- **New Repository Methods** - Add to interface first
- **New Use Cases** - Follow existing pattern
- **New Endpoints** - Add controller method and route
- **New Middlewares** - Create in middlewares folder
- **External Services** - Add to infrastructure/external

---

## Conclusion

This architecture provides:
- ✅ **Clear separation of concerns**
- ✅ **Testable business logic**
- ✅ **Easy to understand structure**
- ✅ **Flexible and extensible**
- ✅ **Production-ready patterns**

When in doubt, follow the dependency rule: **dependencies point inward toward the domain**.

---

**Questions?** Refer to existing implementations in the codebase for concrete examples.
