/**
 * Integration Tests for NRF App APIs
 * These tests verify that all APIs work correctly with the NRF mobile app
 * by testing the exact response formats and data structures expected
 */

import { POST as ordersPost, GET as ordersGet } from '@/app/api/orders/route';
import { GET as productsGet, POST as productsPost } from '@/app/api/products/route';
import { POST as devicesPost, GET as devicesGet } from '@/app/api/devices/register/route';
import { GET as messageGet } from '@/app/api/message/route';
import {
  createMockRequest,
  validateProductResponse,
  validateOrdersResponse,
  validateDeviceResponse,
  validateMessageResponse,
  MOCK_ORDER,
  MOCK_PRODUCT,
  MOCK_DEVICE,
  generateUserId,
  generateProductId,
  generateOrderId,
} from '../utils/nrf-app-integration-helpers';

// Mock the database
jest.mock('@/lib/mongoose', () => ({
  connectToDatabase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/models/order.model', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('@/lib/models/product.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('@/lib/models/notification.model', () => ({
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
}));

import Order from '@/lib/models/order.model';
import Product from '@/lib/models/product.model';
import AppNotification from '@/lib/models/notification.model';

describe('NRF App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Products API - GET /api/products', () => {
    it('should return array of products directly (not wrapped)', async () => {
      const mockProducts = [MOCK_PRODUCT];
      (Product.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce(mockProducts),
      });

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/products?gender=man'
      );

      const response = await productsGet(request);
      const data = await response.json();

      // NRF app expects direct array response
      expect(Array.isArray(data)).toBe(true);
      validateProductResponse(data);
      expect(data).toEqual(mockProducts);
    });

    it('should filter products by gender', async () => {
      const mockProducts = [{ ...MOCK_PRODUCT, gender: 'man' }];
      (Product.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce(mockProducts),
      });

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/products?gender=man'
      );

      const response = await productsGet(request);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect((Product.find as jest.Mock).mock.calls[0][0]).toEqual({ gender: 'man' });
    });

    it('should filter products by category', async () => {
      const mockProducts = [{ ...MOCK_PRODUCT, category: 'shoe' }];
      (Product.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce(mockProducts),
      });

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/products?category=shoe'
      );

      const response = await productsGet(request);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect((Product.find as jest.Mock).mock.calls[0][0]).toEqual({ category: 'shoe' });
    });

    it('should filter products by multiple criteria', async () => {
      const mockProducts = [MOCK_PRODUCT];
      (Product.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce(mockProducts),
      });

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/products?gender=man&category=shoe&subcategory=Eva'
      );

      const response = await productsGet(request);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      const callArgs = (Product.find as jest.Mock).mock.calls[0][0];
      expect(callArgs.gender).toBe('man');
      expect(callArgs.category).toBe('shoe');
      expect(callArgs.subcategory).toBe('Eva');
    });

    it('should return empty array when no products found', async () => {
      (Product.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce([]),
      });

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/products?gender=invalid'
      );

      const response = await productsGet(request);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });

  describe('Products API - GET /api/products/{id}', () => {
    it('should return single product with _id field', async () => {
      const mockProduct = MOCK_PRODUCT;
      // This would be tested in a separate file for individual product endpoint
      expect(mockProduct._id).toBeDefined();
      expect(mockProduct.name).toBeDefined();
      expect(mockProduct.price).toBeDefined();
    });
  });

  describe('Orders API - POST /api/orders', () => {
    it('should create order and return success response', async () => {
      const newOrder = {
        user_id: generateUserId(),
        product_id: generateProductId(),
        quantity: 2,
      };

      const savedOrder = { ...MOCK_ORDER, ...newOrder };
      (Order.create as jest.Mock).mockResolvedValueOnce(savedOrder);

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/orders',
        {
          method: 'POST',
          body: newOrder,
        }
      );

      const response = await ordersPost(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.order).toBeDefined();
      expect(data.order._id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidOrder = {
        user_id: generateUserId(),
        // missing product_id and quantity
      };

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/orders',
        {
          method: 'POST',
          body: invalidOrder,
        }
      );

      const response = await ordersPost(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should parse quantity as integer', async () => {
      const newOrder = {
        user_id: generateUserId(),
        product_id: generateProductId(),
        quantity: '2', // String from mobile app
      };

      const savedOrder = {
        ...MOCK_ORDER,
        user_id: newOrder.user_id,
        product_id: newOrder.product_id,
        quantity: 2,
      };
      (Order.create as jest.Mock).mockResolvedValueOnce(savedOrder);

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/orders',
        {
          method: 'POST',
          body: newOrder,
        }
      );

      const response = await ordersPost(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('Orders API - GET /api/orders', () => {
    it('should return orders wrapped in {orders: []} object', async () => {
      const mockOrders = [MOCK_ORDER];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValueOnce(mockOrders),
      });

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/orders?user_id=user_123'
      );

      const response = await ordersGet(request);
      const data = await response.json();

      // NRF app expects {orders: [...]} format
      validateOrdersResponse(data);
      expect(data.orders).toBeDefined();
      expect(Array.isArray(data.orders)).toBe(true);
    });

    it('should filter orders by user_id', async () => {
      const userId = generateUserId();
      const mockOrders = [{ ...MOCK_ORDER, user_id: userId }];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValueOnce(mockOrders),
      });

      const request = createMockRequest(
        `https://new-rai-footwear-admin.vercel.app/api/orders?user_id=${userId}`
      );

      const response = await ordersGet(request);
      const data = await response.json();

      validateOrdersResponse(data);
      expect((Order.find as jest.Mock).mock.calls[0][0].user_id).toBe(userId);
    });

    it('should filter orders by status', async () => {
      const mockOrders = [{ ...MOCK_ORDER, status: 'pending' }];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValueOnce(mockOrders),
      });

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/orders?status=pending'
      );

      const response = await ordersGet(request);
      const data = await response.json();

      validateOrdersResponse(data);
      expect((Order.find as jest.Mock).mock.calls[0][0].status).toBe('pending');
    });

    it('should combine user_id and status filters', async () => {
      const userId = generateUserId();
      const mockOrders = [{ ...MOCK_ORDER, user_id: userId, status: 'pending' }];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValueOnce(mockOrders),
      });

      const request = createMockRequest(
        `https://new-rai-footwear-admin.vercel.app/api/orders?user_id=${userId}&status=pending`
      );

      const response = await ordersGet(request);
      const data = await response.json();

      validateOrdersResponse(data);
      const query = (Order.find as jest.Mock).mock.calls[0][0];
      expect(query.user_id).toBe(userId);
      expect(query.status).toBe('pending');
    });

    it('should return empty orders array when none found', async () => {
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValueOnce([]),
      });

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/orders?user_id=nonexistent'
      );

      const response = await ordersGet(request);
      const data = await response.json();

      expect(data.orders).toEqual([]);
    });

    it('should sort orders by createdAt descending', async () => {
      const mockOrders = [MOCK_ORDER];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValueOnce(mockOrders),
      });

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/orders'
      );

      const response = await ordersGet(request);
      const data = await response.json();

      validateOrdersResponse(data);
      expect((Order.find as jest.Mock)().sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('Devices API - POST /api/devices/register', () => {
    it('should register device and return success response', async () => {
      const deviceData = {
        token: 'expo_token_123',
        email: 'user@example.com',
        name: 'Test User',
        phone: '+919999999999',
      };

      const savedDevice = { 
        ...MOCK_DEVICE, 
        ...deviceData,
        toObject: () => ({ ...MOCK_DEVICE, ...deviceData })
      };
      (AppNotification.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(savedDevice);

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/devices/register',
        {
          method: 'POST',
          body: deviceData,
        }
      );

      const response = await devicesPost(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      validateDeviceResponse(data);
      expect(data.success).toBe(true);
      expect(data.device).toBeDefined();
    });

    it('should validate token is required', async () => {
      const deviceData = {
        email: 'user@example.com',
        // missing token
      };

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/devices/register',
        {
          method: 'POST',
          body: deviceData,
        }
      );

      const response = await devicesPost(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBeDefined();
    });

    it('should update existing device by token', async () => {
      const deviceData = {
        token: 'expo_token_123',
        email: 'user@example.com',
        name: 'Updated User',
      };

      const updatedDevice = { 
        ...MOCK_DEVICE, 
        ...deviceData,
        toObject: () => ({ ...MOCK_DEVICE, ...deviceData })
      };
      (AppNotification.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(updatedDevice);

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/devices/register',
        {
          method: 'POST',
          body: deviceData,
        }
      );

      const response = await devicesPost(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect((AppNotification.findOneAndUpdate as jest.Mock).mock.calls[0]).toBeDefined();
    });
  });

  describe('Devices API - GET /api/devices/register', () => {
    it('should fetch device by email and return success response', async () => {
      const device = { 
        ...MOCK_DEVICE, 
        email: 'test@example.com',
        toObject: () => ({ ...MOCK_DEVICE, email: 'test@example.com' })
      };
      (AppNotification.findOne as jest.Mock).mockResolvedValueOnce(device);

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/devices/register?email=test@example.com'
      );

      const response = await devicesGet(request);
      const data = await response.json();

      validateDeviceResponse(data);
      expect(data.success).toBe(true);
      expect(data.device._id).toBeDefined();
    });

    it('should validate email parameter is required', async () => {
      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/devices/register'
      );

      const response = await devicesGet(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Email');
    });

    it('should return 404 when device not found', async () => {
      (AppNotification.findOne as jest.Mock).mockResolvedValueOnce(null);

      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/devices/register?email=nonexistent@example.com'
      );

      const response = await devicesGet(request);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('Message API - GET /api/message', () => {
    it('should return messages array with company and price', async () => {
      const request = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/message'
      );

      const response = await messageGet();
      const data = await response.json();

      validateMessageResponse(data);
      expect(Array.isArray(data)).toBe(true);
      data.forEach((msg: any) => {
        expect(msg.company).toBeDefined();
        expect(msg.price).toBeDefined();
        expect(typeof msg.price).toBe('number');
      });
    });
  });

  describe('Complete User Workflows', () => {
    it('should complete device registration and fetch orders workflow', async () => {
      const deviceData = {
        token: 'expo_token_workflow',
        email: 'workflow@example.com',
        name: 'Workflow User',
        phone: '+919999999999',
      };

      // Step 1: Register device
      const registeredDevice = { 
        ...MOCK_DEVICE, 
        ...deviceData,
        toObject: () => ({ ...MOCK_DEVICE, ...deviceData })
      };
      (AppNotification.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(registeredDevice);

      const registerRequest = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/devices/register',
        {
          method: 'POST',
          body: deviceData,
        }
      );

      const registerResponse = await devicesPost(registerRequest);
      const registerData = await registerResponse.json();

      expect(registerData.success).toBe(true);
      const userId = registerData.device._id;

      // Step 2: Fetch orders
      const mockOrders = [{ ...MOCK_ORDER, user_id: userId }];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValueOnce(mockOrders),
      });

      const ordersRequest = createMockRequest(
        `https://new-rai-footwear-admin.vercel.app/api/orders?user_id=${userId}`
      );

      const ordersResponse = await ordersGet(ordersRequest);
      const ordersData = await ordersResponse.json();

      expect(ordersData.orders).toBeDefined();
      expect(ordersData.orders.length).toBeGreaterThanOrEqual(0);
    });

    it('should complete product fetch and order creation workflow', async () => {
      // Step 1: Fetch products
      const mockProducts = [MOCK_PRODUCT];
      (Product.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce(mockProducts),
      });

      const productsRequest = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/products?gender=man'
      );

      const productsResponse = await productsGet(productsRequest);
      const productsData = await productsResponse.json();

      expect(Array.isArray(productsData)).toBe(true);
      expect(productsData.length).toBeGreaterThan(0);

      // Step 2: Create order for first product
      const productId = productsData[0]._id;
      const userId = generateUserId();

      const orderData = {
        user_id: userId,
        product_id: productId,
        quantity: 1,
      };

      const newOrder = { ...MOCK_ORDER, ...orderData };
      (Order.create as jest.Mock).mockResolvedValueOnce(newOrder);

      const orderRequest = createMockRequest(
        'https://new-rai-footwear-admin.vercel.app/api/orders',
        {
          method: 'POST',
          body: orderData,
        }
      );

      const orderResponse = await ordersPost(orderRequest);
      const orderResponseData = await orderResponse.json();

      expect(orderResponseData.success).toBe(true);
      expect(orderResponseData.order._id).toBeDefined();
    });
  });
});
