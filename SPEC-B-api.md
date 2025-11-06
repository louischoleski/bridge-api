# API Endpoint Contracts Specification

**Project:** Bridge API
**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Base URL:** `http://localhost:3000/api/v1`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Authorization](#authorization)
4. [Common Response Format](#common-response-format)
5. [Error Handling](#error-handling)
6. [Authentication Endpoints](#authentication-endpoints)
7. [Product Endpoints](#product-endpoints)
8. [Cart Endpoints](#cart-endpoints)
9. [Order Endpoints](#order-endpoints)
10. [Health Check Endpoint](#health-check-endpoint)
11. [Rate Limiting](#rate-limiting)
12. [Versioning](#versioning)

---

## Overview

Bridge API is a RESTful API following REST principles with JSON request/response bodies. All endpoints are prefixed with `/api/v1`.

### Key Features
- **JWT-based authentication** for secure access
- **Role-based authorization** for fine-grained permissions
- **Consistent response format** across all endpoints
- **Comprehensive error handling** with detailed error codes
- **OpenAPI/Swagger compatible**

### Content Type
- **Request:** `Content-Type: application/json`
- **Response:** `Content-Type: application/json`

### HTTP Methods
- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT` - Update resources (full replacement)
- `PATCH` - Update resources (partial)
- `DELETE` - Remove resources

---

## Authentication

### JWT Token Authentication

Most endpoints require authentication via JWT token in the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <jwt-token>
```

**Token Payload:**
```json
{
  "userId": "user-001",
  "email": "user@example.com",
  "roles": ["customer"],
  "iat": 1704556800,
  "exp": 1704643200
}
```

**Token Expiration:** 24 hours (configurable)

### Public Endpoints
The following endpoints do **not** require authentication:
- `POST /auth/login`
- `GET /products`
- `GET /products/:productId`
- `GET /health`

---

## Authorization

### Role-Based Access Control (RBAC)

#### Available Roles
- **admin** - Full system access
- **customer** - Read products, manage own cart and orders
- **product-manager** - Manage products
- **order-manager** - Manage all orders
- **guest** - Read-only access to products

#### Permission Matrix

| Endpoint | Admin | Customer | Product Manager | Order Manager | Guest | Public |
|----------|-------|----------|----------------|---------------|-------|--------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /products | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /products/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /products | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| PUT /products/:id | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| DELETE /products/:id | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| GET /cart | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| POST /cart/items | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| PUT /cart/items/:id | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /cart/items/:id | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /cart | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| POST /orders | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /orders/:id | ✅ | ✅* | ❌ | ✅ | ❌ | ❌ |
| POST /orders/:id/cancel | ✅ | ✅* | ❌ | ✅ | ❌ | ❌ |

*Customers can only access their own orders

---

## Common Response Format

### Success Response

**Structure:**
```json
{
  "success": true,
  "data": { ... }
}
```

**For List Operations:**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 10
}
```

**Status Codes:**
- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE with no body)

### Error Response

**Structure:**
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": { ... }  // Optional, for validation errors
  }
}
```

**Status Codes:**
- `400` - Bad Request (validation errors, malformed input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resources, business rule violation)
- `500` - Internal Server Error (unexpected errors)

---

## Error Handling

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Request validation failed |
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `FORBIDDEN` | 403 | Insufficient permissions for this action |
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_EXISTS` | 409 | Resource with same identifier exists |
| `BUSINESS_RULE_VIOLATION` | 409 | Business rule constraint violated |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Validation Error Response

```json
{
  "error": {
    "message": "Validation failed",
    "code": "INVALID_INPUT",
    "statusCode": 400,
    "details": {
      "fields": {
        "email": ["Invalid email format"],
        "price": ["Price must be greater than 0"]
      }
    }
  }
}
```

---

## Authentication Endpoints

### POST /auth/login

Authenticate user and receive JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "customer-001",
      "email": "customer@example.com",
      "roles": ["customer"]
    }
  }
}
```

**Error Responses:**

`400 Bad Request` - Missing credentials
```json
{
  "error": {
    "message": "Email and password are required",
    "code": "INVALID_INPUT",
    "statusCode": 400
  }
}
```

`401 Unauthorized` - Invalid credentials
```json
{
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS",
    "statusCode": 401
  }
}
```

**Test Users:**
| Email | Password | Roles |
|-------|----------|-------|
| admin@example.com | admin123 | admin |
| customer@example.com | password123 | customer |
| productmanager@example.com | products123 | product-manager |
| ordermanager@example.com | orders123 | order-manager |
| guest@example.com | guest123 | guest |

---

### GET /auth/me

Get current authenticated user information.

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "customer-001",
      "email": "customer@example.com",
      "roles": ["customer"]
    }
  }
}
```

**Error Responses:**

`401 Unauthorized` - Missing or invalid token
```json
{
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}
```

---

## Product Endpoints

### GET /products

Search and list all products.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search term for product name/description |
| category | string | No | Filter by category |
| limit | number | No | Max results to return (default: 50) |
| offset | number | No | Number of results to skip (default: 0) |

**Example Request:**
```
GET /products?query=laptop&category=electronics&limit=20&offset=0
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "product-001",
      "name": "Laptop Pro 15",
      "description": "High-performance laptop",
      "sku": "LAPTOP-PRO-15",
      "price": 1299.99,
      "currency": "USD",
      "category": "electronics",
      "stockQuantity": 50,
      "isActive": true,
      "imageUrls": [
        "https://example.com/images/laptop-1.jpg"
      ],
      "metadata": {
        "brand": "TechCorp",
        "weight": "2.5kg"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-06T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### GET /products/:productId

Get a single product by ID.

**Authentication:** Not required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | Product ID |

**Example Request:**
```
GET /products/product-001
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "product-001",
    "name": "Laptop Pro 15",
    "description": "High-performance laptop",
    "sku": "LAPTOP-PRO-15",
    "price": 1299.99,
    "currency": "USD",
    "category": "electronics",
    "stockQuantity": 50,
    "isActive": true,
    "imageUrls": [
      "https://example.com/images/laptop-1.jpg"
    ],
    "metadata": {
      "brand": "TechCorp"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-06T00:00:00.000Z"
  }
}
```

**Error Responses:**

`404 Not Found` - Product doesn't exist
```json
{
  "error": {
    "message": "Product not found",
    "code": "NOT_FOUND",
    "statusCode": 404
  }
}
```

---

### POST /products

Create a new product.

**Authentication:** Required
**Permissions:** `admin`, `product-manager`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "sku": "MOUSE-WL-001",
  "price": 29.99,
  "currency": "USD",
  "category": "electronics",
  "stockQuantity": 100,
  "imageUrls": [
    "https://example.com/images/mouse-1.jpg"
  ],
  "metadata": {
    "brand": "TechCorp",
    "color": "Black"
  }
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | Non-empty, max 255 chars |
| description | string | Yes | Non-empty, max 2000 chars |
| sku | string | Yes | Unique, alphanumeric with hyphens |
| price | number | Yes | Greater than 0 |
| currency | string | Yes | ISO 4217 code (USD, EUR, etc.) |
| category | string | Yes | Valid category name |
| stockQuantity | number | No | Non-negative integer (default: 0) |
| imageUrls | string[] | No | Array of valid URLs |
| metadata | object | No | Key-value pairs |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "product-123",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "sku": "MOUSE-WL-001",
    "price": 29.99,
    "currency": "USD",
    "category": "electronics",
    "stockQuantity": 100,
    "isActive": true,
    "imageUrls": [
      "https://example.com/images/mouse-1.jpg"
    ],
    "metadata": {
      "brand": "TechCorp",
      "color": "Black"
    },
    "createdAt": "2025-01-06T12:00:00.000Z",
    "updatedAt": "2025-01-06T12:00:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "error": {
    "message": "Validation failed",
    "code": "INVALID_INPUT",
    "statusCode": 400,
    "details": {
      "fields": {
        "price": ["Price must be greater than 0"],
        "sku": ["SKU is required"]
      }
    }
  }
}
```

`401 Unauthorized` - Not authenticated
`403 Forbidden` - Insufficient permissions

`409 Conflict` - SKU already exists
```json
{
  "error": {
    "message": "Product with SKU MOUSE-WL-001 already exists",
    "code": "ALREADY_EXISTS",
    "statusCode": 409
  }
}
```

---

### PUT /products/:productId

Update an existing product.

**Authentication:** Required
**Permissions:** `admin`, `product-manager`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | Product ID |

**Request Body:** (all fields optional)
```json
{
  "name": "Wireless Mouse Pro",
  "description": "Enhanced ergonomic wireless mouse",
  "price": 39.99,
  "currency": "USD",
  "category": "electronics",
  "stockQuantity": 150,
  "isActive": true,
  "imageUrls": [
    "https://example.com/images/mouse-pro-1.jpg",
    "https://example.com/images/mouse-pro-2.jpg"
  ],
  "metadata": {
    "brand": "TechCorp",
    "color": "Black",
    "warranty": "2 years"
  }
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | No | Non-empty, max 255 chars |
| description | string | No | Non-empty, max 2000 chars |
| price | number | No | Greater than 0 |
| currency | string | No | ISO 4217 code |
| category | string | No | Valid category name |
| stockQuantity | number | No | Non-negative integer |
| isActive | boolean | No | true or false |
| imageUrls | string[] | No | Array of valid URLs |
| metadata | object | No | Key-value pairs |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "product-123",
    "name": "Wireless Mouse Pro",
    "description": "Enhanced ergonomic wireless mouse",
    "sku": "MOUSE-WL-001",
    "price": 39.99,
    "currency": "USD",
    "category": "electronics",
    "stockQuantity": 150,
    "isActive": true,
    "imageUrls": [
      "https://example.com/images/mouse-pro-1.jpg",
      "https://example.com/images/mouse-pro-2.jpg"
    ],
    "metadata": {
      "brand": "TechCorp",
      "color": "Black",
      "warranty": "2 years"
    },
    "createdAt": "2025-01-06T12:00:00.000Z",
    "updatedAt": "2025-01-06T13:00:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error
`401 Unauthorized` - Not authenticated
`403 Forbidden` - Insufficient permissions

`404 Not Found` - Product doesn't exist
```json
{
  "error": {
    "message": "Product with ID product-123 not found",
    "code": "NOT_FOUND",
    "statusCode": 404
  }
}
```

---

### DELETE /products/:productId

Delete a product.

**Authentication:** Required
**Permissions:** `admin`, `product-manager`

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | Product ID |

**Example Request:**
```
DELETE /products/product-123
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "product-123",
    "deleted": true
  }
}
```

**Error Responses:**

`401 Unauthorized` - Not authenticated
`403 Forbidden` - Insufficient permissions

`404 Not Found` - Product doesn't exist
```json
{
  "error": {
    "message": "Product with ID product-123 not found",
    "code": "NOT_FOUND",
    "statusCode": 404
  }
}
```

---

## Cart Endpoints

### GET /cart

Get the active cart for the authenticated user.

**Authentication:** Required
**Permissions:** `admin`, `customer`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "cart-001",
    "customerId": "customer-001",
    "status": "ACTIVE",
    "items": [
      {
        "id": "item-001",
        "productId": "product-001",
        "productName": "Laptop Pro 15",
        "quantity": 1,
        "unitPrice": 1299.99,
        "discount": 0,
        "subtotal": 1299.99,
        "currency": "USD"
      },
      {
        "id": "item-002",
        "productId": "product-002",
        "productName": "Wireless Mouse",
        "quantity": 2,
        "unitPrice": 29.99,
        "discount": 0,
        "subtotal": 59.98,
        "currency": "USD"
      }
    ],
    "itemCount": 2,
    "totalQuantity": 3,
    "subtotal": 1359.97,
    "discount": 0,
    "total": 1359.97,
    "currency": "USD",
    "createdAt": "2025-01-06T10:00:00.000Z",
    "updatedAt": "2025-01-06T11:00:00.000Z"
  }
}
```

**Error Responses:**

`401 Unauthorized` - Not authenticated
`404 Not Found` - No active cart exists

---

### POST /cart/items

Add an item to the cart.

**Authentication:** Required
**Permissions:** `admin`, `customer`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "product-001",
  "quantity": 1
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| productId | string | Yes | Must be valid product ID |
| quantity | number | Yes | Integer >= 1 |

**Response:** `200 OK`
```json
{
  "data": {
    "id": "cart-001",
    "customerId": "customer-001",
    "status": "ACTIVE",
    "items": [
      {
        "id": "item-001",
        "productId": "product-001",
        "productName": "Laptop Pro 15",
        "quantity": 1,
        "unitPrice": 1299.99,
        "discount": 0,
        "subtotal": 1299.99,
        "currency": "USD"
      }
    ],
    "itemCount": 1,
    "totalQuantity": 1,
    "subtotal": 1299.99,
    "discount": 0,
    "total": 1299.99,
    "currency": "USD",
    "createdAt": "2025-01-06T10:00:00.000Z",
    "updatedAt": "2025-01-06T11:00:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Invalid quantity or product ID
`401 Unauthorized` - Not authenticated
`404 Not Found` - Product not found

`409 Conflict` - Insufficient stock
```json
{
  "error": {
    "message": "Insufficient stock for product",
    "code": "BUSINESS_RULE_VIOLATION",
    "statusCode": 409
  }
}
```

---

### PUT /cart/items/:productId

Update quantity of an item in the cart.

**Authentication:** Required
**Permissions:** `admin`, `customer`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | Product ID |

**Request Body:**
```json
{
  "quantity": 3
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| quantity | number | Yes | Integer >= 1 |

**Response:** `200 OK`
```json
{
  "data": {
    "id": "cart-001",
    "customerId": "customer-001",
    "status": "ACTIVE",
    "items": [
      {
        "id": "item-001",
        "productId": "product-001",
        "productName": "Laptop Pro 15",
        "quantity": 3,
        "unitPrice": 1299.99,
        "discount": 0,
        "subtotal": 3899.97,
        "currency": "USD"
      }
    ],
    "itemCount": 1,
    "totalQuantity": 3,
    "subtotal": 3899.97,
    "discount": 0,
    "total": 3899.97,
    "currency": "USD",
    "createdAt": "2025-01-06T10:00:00.000Z",
    "updatedAt": "2025-01-06T11:30:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Invalid quantity
`401 Unauthorized` - Not authenticated
`404 Not Found` - Cart or item not found
`409 Conflict` - Insufficient stock

---

### DELETE /cart/items/:productId

Remove an item from the cart.

**Authentication:** Required
**Permissions:** `admin`, `customer`

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | Product ID |

**Example Request:**
```
DELETE /cart/items/product-001
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "cart-001",
    "customerId": "customer-001",
    "status": "ACTIVE",
    "items": [],
    "itemCount": 0,
    "totalQuantity": 0,
    "subtotal": 0,
    "discount": 0,
    "total": 0,
    "currency": "USD",
    "createdAt": "2025-01-06T10:00:00.000Z",
    "updatedAt": "2025-01-06T12:00:00.000Z"
  }
}
```

**Error Responses:**

`401 Unauthorized` - Not authenticated
`404 Not Found` - Cart or item not found

---

### DELETE /cart

Clear all items from the cart.

**Authentication:** Required
**Permissions:** `admin`, `customer`

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```
DELETE /cart
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "cart-001",
    "customerId": "customer-001",
    "status": "ACTIVE",
    "items": [],
    "itemCount": 0,
    "totalQuantity": 0,
    "subtotal": 0,
    "discount": 0,
    "total": 0,
    "currency": "USD",
    "createdAt": "2025-01-06T10:00:00.000Z",
    "updatedAt": "2025-01-06T12:30:00.000Z"
  }
}
```

**Error Responses:**

`401 Unauthorized` - Not authenticated
`404 Not Found` - Cart not found

---

## Order Endpoints

### POST /orders

Create a new order from the active cart.

**Authentication:** Required
**Permissions:** `admin`, `customer`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| shippingAddress | object | Yes | Complete address |
| shippingAddress.street | string | Yes | Non-empty |
| shippingAddress.city | string | Yes | Non-empty |
| shippingAddress.state | string | Yes | Non-empty |
| shippingAddress.postalCode | string | Yes | Non-empty |
| shippingAddress.country | string | Yes | Non-empty |
| paymentMethod | string | Yes | Valid payment method |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "order-001",
    "customerId": "customer-001",
    "status": "PENDING",
    "items": [
      {
        "id": "order-item-001",
        "productId": "product-001",
        "productName": "Laptop Pro 15",
        "quantity": 1,
        "unitPrice": 1299.99,
        "discount": 0,
        "subtotal": 1299.99,
        "currency": "USD"
      }
    ],
    "itemCount": 1,
    "totalQuantity": 1,
    "subtotal": 1299.99,
    "discount": 0,
    "shippingCost": 0,
    "tax": 0,
    "total": 1299.99,
    "currency": "USD",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94105",
      "country": "USA"
    },
    "paymentMethod": "credit_card",
    "createdAt": "2025-01-06T13:00:00.000Z",
    "updatedAt": "2025-01-06T13:00:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error or empty cart
```json
{
  "error": {
    "message": "Cart is empty",
    "code": "BUSINESS_RULE_VIOLATION",
    "statusCode": 400
  }
}
```

`401 Unauthorized` - Not authenticated
`404 Not Found` - Active cart not found

---

### GET /orders/:orderId

Get order details.

**Authentication:** Required
**Permissions:** `admin`, `order-manager`, or order owner

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orderId | string | Yes | Order ID |

**Example Request:**
```
GET /orders/order-001
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "order-001",
    "customerId": "customer-001",
    "status": "PENDING",
    "items": [
      {
        "id": "order-item-001",
        "productId": "product-001",
        "productName": "Laptop Pro 15",
        "quantity": 1,
        "unitPrice": 1299.99,
        "discount": 0,
        "subtotal": 1299.99,
        "currency": "USD"
      }
    ],
    "itemCount": 1,
    "totalQuantity": 1,
    "subtotal": 1299.99,
    "discount": 0,
    "shippingCost": 0,
    "tax": 0,
    "total": 1299.99,
    "currency": "USD",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94105",
      "country": "USA"
    },
    "paymentMethod": "credit_card",
    "createdAt": "2025-01-06T13:00:00.000Z",
    "updatedAt": "2025-01-06T13:00:00.000Z"
  }
}
```

**Error Responses:**

`401 Unauthorized` - Not authenticated
`403 Forbidden` - Not order owner and insufficient permissions
`404 Not Found` - Order not found

---

### POST /orders/:orderId/cancel

Cancel an order.

**Authentication:** Required
**Permissions:** `admin`, `order-manager`, or order owner

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orderId | string | Yes | Order ID |

**Example Request:**
```
POST /orders/order-001/cancel
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "order-001",
    "customerId": "customer-001",
    "status": "CANCELLED",
    "items": [ ... ],
    "total": 1299.99,
    "currency": "USD",
    "createdAt": "2025-01-06T13:00:00.000Z",
    "updatedAt": "2025-01-06T14:00:00.000Z"
  }
}
```

**Error Responses:**

`401 Unauthorized` - Not authenticated
`403 Forbidden` - Not order owner and insufficient permissions
`404 Not Found` - Order not found

`409 Conflict` - Order cannot be cancelled (e.g., already shipped)
```json
{
  "error": {
    "message": "Order cannot be cancelled in current status",
    "code": "BUSINESS_RULE_VIOLATION",
    "statusCode": 409
  }
}
```

---

## Health Check Endpoint

### GET /health

Check API health status.

**Authentication:** Not required

**Example Request:**
```
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T15:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Rate Limiting

**Current Implementation:** Not yet implemented

**Planned:**
- 100 requests per minute per IP for unauthenticated requests
- 1000 requests per minute per user for authenticated requests
- Rate limit headers in response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

**Response when rate limited:** `429 Too Many Requests`
```json
{
  "error": {
    "message": "Rate limit exceeded",
    "code": "RATE_LIMIT_EXCEEDED",
    "statusCode": 429
  }
}
```

---

## Versioning

### Current Version: v1

The API uses URL path versioning: `/api/v1`

### Version Lifecycle
- **Supported:** v1 (current)
- **Deprecated:** None
- **Sunset:** None

### Breaking Changes Policy
- Minimum 6 months notice before deprecation
- Overlapping version support during migration period
- Clear migration guides provided

### Non-Breaking Changes
- Adding new endpoints
- Adding optional request parameters
- Adding response fields
- Adding new enum values (when handled gracefully)

### Breaking Changes
- Removing endpoints
- Removing request/response fields
- Changing field types
- Renaming fields
- Changing HTTP methods
- Changing authentication requirements

---

## HTTP Status Code Summary

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE (no response body) |
| 400 | Bad Request | Validation error, malformed input |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Business rule violation, duplicate resource |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Maintenance or temporary outage |

---

## Common Request Examples

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password123"}'
```

**Get Products (Authenticated):**
```bash
curl -X GET http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Product:**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "sku": "PROD-001",
    "price": 99.99,
    "currency": "USD",
    "category": "electronics",
    "stockQuantity": 100
  }'
```

**Add to Cart:**
```bash
curl -X POST http://localhost:3000/api/v1/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-001",
    "quantity": 1
  }'
```

---

## Developer Notes

### Testing
- Use Postman collection (coming soon)
- Swagger/OpenAPI documentation available at `/api/docs` (planned)
- Test users available for all roles (see authentication section)

### Environment Variables
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRATION` - Token expiration time (default: 24h)
- `API_PREFIX` - API route prefix (default: /api/v1)
- `PORT` - Server port (default: 3000)

### CORS
Currently configured to accept all origins in development. Production settings should restrict to specific domains.

### Logging
All requests are logged with:
- HTTP method and URL
- Request IP
- Response status code
- Response time

---

**For more details on architecture and implementation, see [SPEC-A-architecture.md](SPEC-A-architecture.md)**
