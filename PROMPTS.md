# Prompts Used with Claude Code

This document shows the exact prompts used to build the Bridge API project with Claude Code.

---

## 1. Zero-to-Production Prompt

```
Build a production-ready e-commerce REST API using TypeScript, Express, and DDD.

ARCHITECTURE:
- Domain-Driven Design with Clean Architecture
- Layers: Domain → Application → Infrastructure → API
- Repository pattern (interfaces in domain, implementations in infrastructure)
- Use Case pattern with Input/Output DTOs
- Dependency Injection container
- In-memory storage designed for easy database swap

DOMAIN:
- Products: catalog, categories, pricing, inventory
- Cart: shopping cart, items, quantities, calculations
- Orders: creation from cart, status, cancellation
- Users: JWT auth, role-based authorization

TECHNICAL:
- TypeScript strict mode
- Express.js with middleware pipeline
- JWT authentication
- Roles: admin, customer, product-manager, order-manager, guest
- Value objects: Email, Money, ProductCategory
- Aggregate roots with domain events
- Consistent error handling with proper HTTP codes

PATTERNS:
- Private constructors with factory methods (create/reconstitute)
- Immutable value objects
- Repository methods return domain entities, not models
- Use cases orchestrate, don't contain business rules
- Mappers for entity-DTO conversion
- Naming: {Action}{Entity}UseCase, {Feature}Controller

STRUCTURE:
src/
├── domain/{feature}/entities|aggregates|value-objects|repositories
├── application/use-cases/{feature}/
├── infrastructure/persistence/repositories|models
├── api/rest/controllers|routes|middlewares
└── config/dependency-injection.ts

QUALITY:
- Type-safe (no 'any')
- Self-documenting code
- Business rules in domain, not use cases
- Testable (no framework in domain)
- Production-ready patterns

DELIVERABLES:
1. Complete implementation (15+ endpoints)
2. Seed test users for all roles
3. Build config with module path aliases
4. SPEC-A-architecture.md (architecture, patterns, extension guide)
5. SPEC-B-api.md (endpoint contracts, auth, examples)
```

---

## 2. Verify Storage

```
Verify all endpoints use repository pattern. Identify inconsistencies.
```

---

## 3. Fix Issues

```
Implement missing repository patterns. Maintain consistency.
```

---

## 4. Architecture Docs

```
Create SPEC-A-architecture.md with DDD layers, patterns, extension guide.
```

---

## 5. API Docs

```
Create SPEC-B-api.md with endpoints, auth, errors, examples.
```

---

## 6. Add Salesforce Integration

```
Please add the missing SalesforceCartClient and ensure it respect DDD

Requirements:
- Implement SalesforceCartClient test double with realistic behavior
- Include context expiry simulation (TTL-based)
- Follow DDD principles (domain layer, value objects, entities, events)
- Integrate with existing cart operations
- Write comprehensive unit tests
- Update dependency injection configuration
```

**Accepted**: Full implementation including:
- Domain layer (SalesforceCartContext entity, ContextTTL value object, etc.)
- Infrastructure layer (SalesforceCartClientTestDouble with context expiry)
- Application layer (SyncCartToSalesforceUseCase, ValidateSalesforceContextUseCase)
- Integration with AddItemToCartUseCase
- 45+ unit tests covering context expiry scenarios
- Updated DI container
- Documentation updates
