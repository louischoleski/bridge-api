# Bridge API

A thin RESTful Experience layer for telecom cart operations with JWT authentication and role-based access control.

## Quick Start

```bash
# Install dependencies
yarn install

# Set up environment
cp .env.example .env

# Start development server
yarn start:dev

# Run tests
yarn build && yarn test
```

API available at `http://localhost:3000/api/v1`

## Authentication

All protected endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password123"}'
```

### Test Users

| Email                      | Password    | Role            | Permissions                                        |
| -------------------------- | ----------- | --------------- | -------------------------------------------------- |
| admin@example.com          | admin123    | admin           | Full access                                        |
| customer@example.com       | password123 | customer        | Products (read), Cart (full), Orders (create/read) |
| productmanager@example.com | products123 | product-manager | Products (full CRUD)                               |
| ordermanager@example.com   | orders123   | order-manager   | Products (read), Orders (full)                     |
| guest@example.com          | guest123    | guest           | Products (read only)                               |

## API Endpoints

### Authentication

- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Products

- `GET /api/v1/products` - List products (public)
- `GET /api/v1/products/:id` - Get product (public)
- `POST /api/v1/products` - Create product (requires `product:create`)
- `PUT /api/v1/products/:id` - Update product (requires `product:update`)
- `DELETE /api/v1/products/:id` - Delete product (requires `product:delete`)

### Cart (requires authentication)

- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add item
- `PUT /api/v1/cart/items/:id` - Update item
- `DELETE /api/v1/cart/items/:id` - Remove item
- `DELETE /api/v1/cart` - Clear cart

### Orders (requires authentication)

- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/:id` - Get order
- `POST /api/v1/orders/:id/cancel` - Cancel order

## Testing

```bash
# Build and run unit tests
yarn test

# Run E2E tests
yarn test:e2e

# Test authentication
node test-jwt.js

# Test permissions
node test-permissions.js
```

## Architecture

```
src/
├── api/                  # REST controllers, routes, middlewares
├── application/          # Use cases, DTOs, mappers
├── domain/              # Entities, aggregates, value objects
├── infrastructure/      # Repositories, external services
└── config/              # Environment, DI container
```

**Pattern**: Domain-Driven Design with Hexagonal Architecture
**Storage**: In-memory (no persistence)

## Environment Variables

```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

## Development

```bash
# Watch mode
yarn watch:build

# Lint and format
yarn fix

# Generate documentation
yarn doc
```

## License

MIT
