import { GET, POST } from '@/app/api/orders/route'
import Order from '@/lib/models/order.model'
import { NextRequest } from 'next/server'

jest.mock('@/lib/mongoose')
jest.mock('@/lib/models/order.model')

describe('Orders API - POST /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new order successfully', async () => {
    const newOrder = {
      user_id: 'user123',
      product_id: 'product456',
      quantity: 2,
    }

    const savedOrder = {
      _id: 'order789',
      ...newOrder,
      status: 'pending',
      createdAt: new Date(),
    }

    ;(Order.create as jest.Mock).mockResolvedValueOnce(savedOrder)

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(newOrder),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.order._id).toBe('order789')
    expect(data.order.status).toBe('pending')
    expect(data.order.quantity).toBe(2)
  })

  it('should reject order without user_id', async () => {
    const invalidOrder = {
      product_id: 'product456',
      quantity: 2,
    }

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(invalidOrder),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
    expect(Order.create).not.toHaveBeenCalled()
  })

  it('should reject order without product_id', async () => {
    const invalidOrder = {
      user_id: 'user123',
      quantity: 2,
    }

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(invalidOrder),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('should reject order without quantity', async () => {
    const invalidOrder = {
      user_id: 'user123',
      product_id: 'product456',
    }

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(invalidOrder),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('should handle database errors during creation', async () => {
    const newOrder = {
      user_id: 'user123',
      product_id: 'product456',
      quantity: 2,
    }

    ;(Order.create as jest.Mock).mockRejectedValueOnce(new Error('MongoDB error'))

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify(newOrder),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create order')
  })
})

describe('Orders API - GET /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch all orders', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        user_id: 'user123',
        product_id: 'product456',
        quantity: 2,
        status: 'pending',
      },
      {
        _id: 'order2',
        user_id: 'user456',
        product_id: 'product789',
        quantity: 1,
        status: 'confirmed',
      },
    ]

    ;(Order.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockResolvedValueOnce(mockOrders),
    })

    const request = new NextRequest('http://localhost:3000/api/orders')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data.orders)).toBe(true)
    expect(data.orders).toHaveLength(2)
  })

  it('should filter orders by user_id', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        user_id: 'user123',
        product_id: 'product456',
        quantity: 2,
        status: 'pending',
      },
    ]

    ;(Order.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockResolvedValueOnce(mockOrders),
    })

    const request = new NextRequest('http://localhost:3000/api/orders?user_id=user123')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.orders[0].user_id).toBe('user123')
    expect(Order.find).toHaveBeenCalledWith({ user_id: 'user123' })
  })

  it('should filter orders by status', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        user_id: 'user123',
        status: 'confirmed',
      },
    ]

    ;(Order.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockResolvedValueOnce(mockOrders),
    })

    const request = new NextRequest('http://localhost:3000/api/orders?status=confirmed')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.orders[0].status).toBe('confirmed')
    expect(Order.find).toHaveBeenCalledWith({ status: 'confirmed' })
  })

  it('should filter orders by both user_id and status', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        user_id: 'user123',
        status: 'pending',
      },
    ]

    ;(Order.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockResolvedValueOnce(mockOrders),
    })

    const request = new NextRequest(
      'http://localhost:3000/api/orders?user_id=user123&status=pending'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Order.find).toHaveBeenCalledWith({
      user_id: 'user123',
      status: 'pending',
    })
  })

  it('should return empty array when no orders found', async () => {
    ;(Order.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockResolvedValueOnce([]),
    })

    const request = new NextRequest('http://localhost:3000/api/orders?user_id=nonexistent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data.orders)).toBe(true)
    expect(data.orders).toHaveLength(0)
  })

  it('should handle database errors during fetch', async () => {
    ;(Order.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockRejectedValueOnce(new Error('MongoDB error')),
    })

    const request = new NextRequest('http://localhost:3000/api/orders')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch orders')
  })

  it('should sort orders by createdAt in descending order', async () => {
    const mockOrders = [
      {
        _id: 'order2',
        user_id: 'user123',
        createdAt: new Date('2025-12-13'),
      },
      {
        _id: 'order1',
        user_id: 'user123',
        createdAt: new Date('2025-12-10'),
      },
    ]

    const sortMock = jest.fn().mockResolvedValueOnce(mockOrders)
    ;(Order.find as jest.Mock).mockReturnValueOnce({
      sort: sortMock,
    })

    const request = new NextRequest('http://localhost:3000/api/orders')
    await GET(request)

    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 })
  })
})
