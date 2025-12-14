/**
 * Test Utilities and Helpers
 * Common functions for API testing
 */

import { NextRequest } from 'next/server'

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string
    body?: any
    headers?: Record<string, string>
  }
): NextRequest {
  const method = options?.method || 'GET'
  const headers = new Headers(options?.headers || {})

  if (options?.body && method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  const init: RequestInit = {
    method,
    headers,
  }

  if (options?.body) {
    init.body = JSON.stringify(options.body)
  }

  return new NextRequest(url, init)
}

/**
 * Mock product data for testing
 */
export const MOCK_PRODUCT = {
  _id: 'prod_001',
  name: 'Test Product',
  gender: 'man' as const,
  category: 'shoe' as const,
  subcategory: 'running',
  price: 5000,
  stock: 50,
  images: ['image1.jpg'],
  sizes: '6,7,8,9,10',
  description: 'Test product description',
  quality: 'Fresh' as const,
  timestamp: new Date().toISOString(),
}

/**
 * Mock order data for testing
 */
export const MOCK_ORDER = {
  _id: 'order_001',
  user_id: 'device_001',
  product_id: 'prod_001',
  quantity: 2,
  status: 'pending' as const,
  createdAt: new Date().toISOString(),
}

/**
 * Mock device data for testing
 */
export const MOCK_DEVICE = {
  _id: 'device_001',
  token: 'fcm_token_abc123',
  email: 'test@example.com',
  name: 'Test Device',
  phone: '+919876543210',
  lastActive: new Date().toISOString(),
}

/**
 * Validate product object structure
 */
export function validateProductStructure(product: any): boolean {
  const requiredFields = [
    'name',
    'gender',
    'category',
    'subcategory',
    'price',
    'stock',
    'images',
    'sizes',
    'description',
  ]

  return requiredFields.every((field) => field in product)
}

/**
 * Validate order object structure
 */
export function validateOrderStructure(order: any): boolean {
  const requiredFields = ['user_id', 'product_id', 'quantity', 'status']

  return requiredFields.every((field) => field in order)
}

/**
 * Validate device object structure
 */
export function validateDeviceStructure(device: any): boolean {
  const requiredFields = ['token']

  return requiredFields.every((field) => field in device)
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate random product ID
 */
export function generateProductId(): string {
  return `prod_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate random order ID
 */
export function generateOrderId(): string {
  return `order_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate random device ID
 */
export function generateDeviceId(): string {
  return `device_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate random FCM token
 */
export function generateFCMToken(): string {
  return `fcm_${Math.random().toString(36).substr(2, 30)}`
}

/**
 * Create bulk products for stress testing
 */
export function createBulkProducts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...MOCK_PRODUCT,
    _id: `prod_${i}`,
    name: `Product ${i}`,
    price: 1000 + i * 100,
  }))
}

/**
 * Create bulk orders for stress testing
 */
export function createBulkOrders(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...MOCK_ORDER,
    _id: `order_${i}`,
    user_id: `user_${i % 10}`,
    product_id: `prod_${i % 50}`,
  }))
}

/**
 * Assert API response structure
 */
export function assertSuccessResponse(response: any) {
  expect(response).toHaveProperty('success')
  expect(response.success).toBe(true)
}

/**
 * Assert error response structure
 */
export function assertErrorResponse(response: any) {
  expect(response).toHaveProperty('error')
  expect(typeof response.error).toBe('string')
}

/**
 * Compare two products (ignoring timestamps)
 */
export function productsEqual(prod1: any, prod2: any): boolean {
  const { timestamp: _, ...p1 } = prod1
  const { timestamp: __, ...p2 } = prod2
  return JSON.stringify(p1) === JSON.stringify(p2)
}

/**
 * Compare two orders (ignoring timestamps)
 */
export function ordersEqual(order1: any, order2: any): boolean {
  const { createdAt: _, ...o1 } = order1
  const { createdAt: __, ...o2 } = order2
  return JSON.stringify(o1) === JSON.stringify(o2)
}

export default {
  createMockRequest,
  MOCK_PRODUCT,
  MOCK_ORDER,
  MOCK_DEVICE,
  validateProductStructure,
  validateOrderStructure,
  validateDeviceStructure,
  sleep,
  generateProductId,
  generateOrderId,
  generateDeviceId,
  generateFCMToken,
  createBulkProducts,
  createBulkOrders,
  assertSuccessResponse,
  assertErrorResponse,
  productsEqual,
  ordersEqual,
}
