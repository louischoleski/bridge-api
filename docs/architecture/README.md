# Architecture

## Pattern

**Domain-Driven Design** with **Hexagonal Architecture**

## Layers

```
api/                 # Controllers, routes, middlewares (presentation)
application/         # Use cases, DTOs, mappers (orchestration)
domain/             # Entities, aggregates, value objects (business logic)
infrastructure/     # Repositories, external services (adapters)
config/             # Environment, dependency injection
```

## Bounded Contexts

- **Cart** - Shopping cart management
- **Order** - Order lifecycle
- **Product** - Product catalog

## Key Principles

- Domain layer has no external dependencies
- Repository interfaces defined in domain, implemented in infrastructure
- Use cases orchestrate domain objects
- Controllers delegate to use cases
- In-memory storage (no persistence)

## Flow

```
Request → Middleware → Controller → Use Case → Domain → Repository
```

## Module Aliases

```typescript
~api/*               // src/api/*
~application/*       // src/application/*
~domain/*            // src/domain/*
~infrastructure/*    // src/infrastructure/*
~config/*            // src/config/*
~shared/*            // src/shared/*
```

Configured in [tsconfig.json](../../tsconfig.json).
