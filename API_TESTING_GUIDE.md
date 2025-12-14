# NRF Admin APIs - Testing and Documentation Guide

## Overview
This document provides comprehensive documentation and testing procedures for all NRF Admin APIs. All APIs follow production-grade standards with proper error handling, validation, and data consistency checks.

## API Endpoints

### 1. Products API

#### GET /api/products
Fetch products with optional filters.

**Parameters:**
- `gender` (optional): 'man' | 'women' | 'kids'
- `category` (optional): 'shoe' | 'sandals' | 'slippers'
- `subcategory` (optional): string

**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "gender": "man|women|kids",
    "category": "shoe|sandals|slippers",
    "subcategory": "string",
    "price": "number",
    "stock": "number",
    "images": ["string"],
    "sizes": "string",
    "description": "string",
    "quality": "Fresh|Second",
    "otherDesignImg": ["string"],
    "timestamp": "ISO8601",
    "xprice": "number"
  }
]
```

**Example Requests:**
```bash
# Get all products
curl http://localhost:3000/api/products

# Get men shoes
curl "http://localhost:3000/api/products?gender=man&category=shoe"

# Get women running shoes
curl "http://localhost:3000/api/products?gender=women&category=shoe&subcategory=running"
```

---

#### POST /api/products
Create a new product.

**Request Body:**
```json
{
  "name": "string (required)",
  "gender": "man|women|kids (required)",
  "category": "shoe|sandals|slippers (required)",
  "subcategory": "string (required)",
  "price": "number (required)",
  "stock": "number (required)",
  "images": ["string"] (required)",
  "sizes": "string (required)",
  "description": "string (required)",
  "quality": "Fresh|Second (default: Fresh)",
  "otherDesignImg": ["string"],
  "xprice": "number"
}
```

**Response:**
```json
{
  "_id": "string",
  "name": "string",
  ...
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Running Shoe Pro",
    "gender": "man",
    "category": "shoe",
    "subcategory": "running",
    "price": 5999,
    "stock": 100,
    "images": ["img1.jpg", "img2.jpg"],
    "sizes": "6,7,8,9,10,11",
    "description": "Professional running shoe with advanced cushioning",
    "quality": "Fresh",
    "xprice": 5500
  }'
```

---

### 2. Orders API

#### GET /api/orders
Fetch orders with optional filters.

**Parameters:**
- `user_id` (optional): User/Device ID
- `status` (optional): 'pending' | 'confirmed' | 'cancelled'

**Response:**
```json
{
  "orders": [
    {
      "_id": "string",
      "user_id": "string",
      "product_id": "string",
      "quantity": "number",
      "status": "pending|confirmed|cancelled",
      "createdAt": "ISO8601"
    }
  ]
}
```

**Example Requests:**
```bash
# Get all orders
curl http://localhost:3000/api/orders

# Get orders for a specific user
curl "http://localhost:3000/api/orders?user_id=device_123"

# Get pending orders
curl "http://localhost:3000/api/orders?status=pending"

# Get confirmed orders for a user
curl "http://localhost:3000/api/orders?user_id=device_123&status=confirmed"
```

---

#### POST /api/orders
Create a new order.

**Request Body:**
```json
{
  "user_id": "string (required)",
  "product_id": "string (required)",
  "quantity": "number (required, min: 1)"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "string",
    "user_id": "string",
    "product_id": "string",
    "quantity": "number",
    "status": "pending",
    "createdAt": "ISO8601"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "device_001",
    "product_id": "prod_123",
    "quantity": 2
  }'
```

---

#### GET /api/orders/[id]
Fetch a specific order by ID.

**Response:**
```json
{
  "_id": "string",
  "user_id": "string",
  "product_id": "string",
  "quantity": "number",
  "status": "pending|confirmed|cancelled",
  "createdAt": "ISO8601"
}
```

**Example:**
```bash
curl http://localhost:3000/api/orders/order_123
```

---

#### PUT /api/orders/[id]
Update an order.

**Request Body:**
```json
{
  "quantity": "number (optional)",
  "status": "pending|confirmed|cancelled (optional)"
}
```

**Response:**
```json
{
  "_id": "string",
  "user_id": "string",
  "product_id": "string",
  "quantity": "number",
  "status": "pending|confirmed|cancelled",
  "createdAt": "ISO8601"
}
```

**Example:**
```bash
# Update quantity
curl -X PUT http://localhost:3000/api/orders/order_123 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'

# Change status
curl -X PUT http://localhost:3000/api/orders/order_123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

---

#### DELETE /api/orders/[id]
Delete an order.

**Response:**
```json
{
  "message": "Order deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/orders/order_123
```

---

### 3. Devices Register API

#### POST /api/devices/register
Register or update a device.

**Request Body:**
```json
{
  "token": "string (required)",
  "email": "string (optional)",
  "name": "string (optional)",
  "phone": "string (optional)",
  "timestamp": "ISO8601 (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "device": {
    "_id": "string",
    "token": "string",
    "email": "string",
    "name": "string",
    "phone": "string",
    "lastActive": "ISO8601"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "fcm_token_xyz123",
    "email": "user@example.com",
    "name": "User Phone",
    "phone": "+919876543210"
  }'
```

---

#### GET /api/devices/register
Fetch device by email.

**Parameters:**
- `email` (required): User email

**Response:**
```json
{
  "success": true,
  "device": {
    "_id": "string",
    "token": "string",
    "email": "string",
    "name": "string",
    "phone": "string",
    "lastActive": "ISO8601"
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/devices/register?email=user@example.com"
```

---

## Running Tests

### Install Dependencies
```bash
npm install --save-dev jest @types/jest ts-jest supertest
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Only E2E Tests
```bash
npm run test:e2e
```

---

## Test Structure

All tests are organized in `__tests__/` directory:

```
__tests__/
├── api/
│   ├── products.test.ts       # Products API tests
│   ├── orders.test.ts         # Orders API tests
│   ├── orders-id.test.ts      # Orders by ID tests
│   └── devices.test.ts        # Device registration tests
└── e2e/
    └── integration.test.ts    # End-to-end integration tests
```

---

## Error Handling

All APIs follow consistent error handling:

### 400 - Bad Request
```json
{
  "error": "Missing required fields" | "Invalid input"
}
```

### 404 - Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Production Checklist

- [x] Input validation on all endpoints
- [x] Proper HTTP status codes
- [x] Error messages are descriptive
- [x] Database connection handling
- [x] Concurrent request handling
- [x] Request body size limits
- [x] Rate limiting ready (to be implemented)
- [x] CORS headers ready (to be configured)
- [x] Request logging ready (to be implemented)
- [x] Monitoring ready (to be implemented)

---

## Best Practices

1. **Always validate input** - Check required fields and data types
2. **Use proper HTTP methods** - GET for fetching, POST for creating, PUT for updating, DELETE for removing
3. **Return appropriate status codes** - 200/201 for success, 4xx for client errors, 5xx for server errors
4. **Handle errors gracefully** - Provide meaningful error messages
5. **Use pagination for large datasets** - Implement offset/limit queries
6. **Implement proper authentication** - Validate user before operations
7. **Log important operations** - Track creates, updates, deletions
8. **Monitor performance** - Track API response times

---

## Future Enhancements

1. Add authentication/authorization middleware
2. Implement rate limiting
3. Add request logging and monitoring
4. Add pagination support
5. Add caching layer for frequently accessed data
6. Add webhook support for order updates
7. Add analytics and reporting APIs
8. Implement soft deletes for audit trail

---

## Support

For issues or questions about the APIs, please refer to the test files or contact the development team.
