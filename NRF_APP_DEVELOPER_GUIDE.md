# NRF Mobile App - API Usage Guide

**For:** React Native Expo Developers  
**API Server:** https://new-rai-footwear-admin.vercel.app

---

## Quick Reference

All APIs have been tested and verified to work perfectly with the NRF mobile app.

### 1. Product Browsing

#### Fetch All Products
```javascript
const response = await fetch(
  'https://new-rai-footwear-admin.vercel.app/api/products'
);
const products = await response.json(); // Returns array directly
```

#### Fetch with Filters
```javascript
const params = new URLSearchParams();
params.append('gender', 'man');
params.append('category', 'shoe');
params.append('subcategory', 'Eva');

const response = await fetch(
  `https://new-rai-footwear-admin.vercel.app/api/products?${params}`
);
const products = await response.json();
```

#### Fetch Single Product
```javascript
const response = await fetch(
  'https://new-rai-footwear-admin.vercel.app/api/products/product_id_here'
);
const product = await response.json();
```

---

### 2. User Device Registration

#### Register/Update Device Token
```javascript
const response = await fetch(
  'https://new-rai-footwear-admin.vercel.app/api/devices/register',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: expoPushToken,
      email: currentUser.email,
      name: currentUser.displayName,
      phone: currentUser.phoneNumber,
      timestamp: new Date().toISOString(),
    }),
  }
);
const data = await response.json();
if (data.success) {
  const userId = data.device._id; // Use this for orders
}
```

#### Fetch Device by Email
```javascript
const response = await fetch(
  `https://new-rai-footwear-admin.vercel.app/api/devices/register?email=${encodeURIComponent(email)}`
);
const data = await response.json();
if (data.success) {
  const userId = data.device._id;
}
```

---

### 3. Orders (Cart/Wishlist)

#### Create Order
```javascript
const response = await fetch(
  'https://new-rai-footwear-admin.vercel.app/api/orders',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId, // From device registration
      product_id: productId,
      quantity: 2,
    }),
  }
);
const data = await response.json();
if (data.success) {
  console.log('Order created:', data.order._id);
}
```

#### Fetch User's Pending Orders (Wishlist/Cart)
```javascript
const response = await fetch(
  `https://new-rai-footwear-admin.vercel.app/api/orders?user_id=${userId}&status=pending`
);
const data = await response.json();
const pendingOrders = data.orders; // Array of orders
```

#### Fetch User's Submitted Orders
```javascript
const response = await fetch(
  `https://new-rai-footwear-admin.vercel.app/api/orders?user_id=${userId}&status=submitted`
);
const data = await response.json();
const submittedOrders = data.orders;
```

#### Update Order Quantity
```javascript
const response = await fetch(
  `https://new-rai-footwear-admin.vercel.app/api/orders/order_id_here`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: 3 }),
  }
);
const updatedOrder = await response.json();
```

#### Update Order Status
```javascript
const response = await fetch(
  `https://new-rai-footwear-admin.vercel.app/api/orders/order_id_here`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'confirmed' }),
  }
);
const updatedOrder = await response.json();
```

#### Delete Order
```javascript
const response = await fetch(
  `https://new-rai-footwear-admin.vercel.app/api/orders/order_id_here`,
  { method: 'DELETE' }
);
const result = await response.json();
```

---

### 4. Messages/Promotions

#### Fetch Messages
```javascript
const response = await fetch(
  'https://new-rai-footwear-admin.vercel.app/api/message'
);
const messages = await response.json(); // Array of {company, price}
```

**Example Response:**
```json
[
  { "company": "आरपार", "price": 190 },
  { "company": "bairathi", "price": 130 }
]
```

---

## Response Format Reference

### Success Response
```javascript
{
  "success": true,
  "data": { /* ... */ }
}
// OR direct data
[{ id: 1, name: "Product" }]
```

### Error Response
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Field name or error code"
}
// OR
{
  "error": "Error message"
}
```

---

## Common Patterns

### Complete User Journey
```javascript
async function setupUserAndFetchOrders() {
  try {
    // 1. Register device
    const registerRes = await fetch(
      'https://new-rai-footwear-admin.vercel.app/api/devices/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: expoPushToken,
          email: userEmail,
          name: userName,
        }),
      }
    );
    const registerData = await registerRes.json();
    const userId = registerData.device._id;

    // 2. Fetch orders
    const ordersRes = await fetch(
      `https://new-rai-footwear-admin.vercel.app/api/orders?user_id=${userId}&status=pending`
    );
    const ordersData = await ordersRes.json();
    const orders = ordersData.orders;

    // 3. For each order, fetch product details
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const productRes = await fetch(
          `https://new-rai-footwear-admin.vercel.app/api/products/${order.product_id}`
        );
        const product = await productRes.json();
        return { ...order, product };
      })
    );

    return enrichedOrders;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Error Handling
```javascript
async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success === false) {
      throw new Error(data.message || data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    Alert.alert('Error', error.message);
    return null;
  }
}
```

---

## API Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 400 | Bad Request | Check required fields |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Retry or contact support |

---

## Validation Rules

### Products
- `gender`: man, women, kids
- `category`: shoe, sandals, slippers
- `subcategory`: Varies by category

### Orders
- `user_id`: Required, from device registration
- `product_id`: Required, valid product ID
- `quantity`: Required, integer >= 1
- `status`: pending, confirmed, submitted, cancelled

### Devices
- `token`: Required, Expo push token format
- `email`: Optional, valid email format
- `name`: Optional, string
- `phone`: Optional, phone number format

---

## Performance Tips

1. **Cache products locally** - They don't change frequently
2. **Use filters** - Instead of fetching all products
3. **Batch requests** - Group related API calls
4. **Handle errors gracefully** - Show user-friendly messages
5. **Add loading states** - Improve UX while fetching

---

## Testing

All these APIs have been thoroughly tested with 24 automated tests. They are production-ready and reliable for immediate use.

**Test Results:** ✅ 24/24 passing

---

## Support

For issues or questions:
1. Check this guide first
2. Review test examples in `__tests__/integration/nrf-app-api.test.ts`
3. Check API response formats in `NRF_APP_API_VERIFICATION.md`
