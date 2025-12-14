import { NextRequest } from 'next/server';

/**
 * Mock next request for testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const method = options.method || 'GET';
  const headers = new Headers(options.headers || {});
  
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  return new NextRequest(
    new URL(url, 'https://new-rai-footwear-admin.vercel.app'),
    {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }
  );
}

/**
 * Validate product response format
 */
export function validateProductResponse(data: any) {
  if (!Array.isArray(data)) {
    throw new Error('Products API should return array');
  }
  
  data.forEach((product: any) => {
    if (!product._id || !product.name || !product.price) {
      throw new Error('Invalid product structure');
    }
  });
  
  return true;
}

/**
 * Validate orders response format
 */
export function validateOrdersResponse(data: any) {
  if (!data.orders || !Array.isArray(data.orders)) {
    throw new Error('Orders API should return {orders: []}');
  }
  
  data.orders.forEach((order: any) => {
    if (!order._id || !order.user_id || !order.product_id) {
      throw new Error('Invalid order structure');
    }
  });
  
  return true;
}

/**
 * Validate device response format
 */
export function validateDeviceResponse(data: any) {
  if (!data.success || !data.device) {
    throw new Error('Device API should return {success: true, device: {...}}');
  }
  
  const device = data.device;
  if (!device._id || !device.token) {
    throw new Error('Invalid device structure');
  }
  
  return true;
}

/**
 * Validate message response format
 */
export function validateMessageResponse(data: any) {
  if (!Array.isArray(data)) {
    throw new Error('Messages API should return array');
  }
  
  data.forEach((msg: any) => {
    if (!msg.company || typeof msg.price !== 'number') {
      throw new Error('Invalid message structure');
    }
  });
  
  return true;
}

/**
 * Mock Order for testing
 */
export const MOCK_ORDER = {
  _id: 'order_test_001',
  user_id: 'user_test_001',
  product_id: 'prod_test_001',
  quantity: 2,
  status: 'pending',
  createdAt: new Date().toISOString(),
};

/**
 * Mock Product for testing
 */
export const MOCK_PRODUCT = {
  _id: 'prod_test_001',
  name: 'Test Product',
  gender: 'man',
  category: 'shoe',
  subcategory: 'Eva',
  price: 5000,
  stock: 100,
  images: ['image1.jpg'],
  sizes: '6,7,8,9,10',
  description: 'Test description',
  timestamp: new Date().toISOString(),
};

/**
 * Mock Device for testing
 */
export const MOCK_DEVICE = {
  _id: 'device_test_001',
  token: 'test_expo_token_123',
  email: 'test@example.com',
  name: 'Test User',
  phone: '+919999999999',
  createdAt: new Date().toISOString(),
};

/**
 * Generate test user ID
 */
export function generateUserId(): string {
  return `user_${Date.now()}`;
}

/**
 * Generate test product ID
 */
export function generateProductId(): string {
  return `prod_${Date.now()}`;
}

/**
 * Generate test order ID
 */
export function generateOrderId(): string {
  return `order_${Date.now()}`;
}
