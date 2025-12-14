import { GET, PUT, DELETE } from '@/app/api/orders/[id]/route'
import Order from '@/lib/models/order.model'
import { NextRequest } from 'next/server'

jest.mock('@/lib/mongoose')
jest.mock('@/lib/models/order.model')

describe('Orders [id] API - GET /api/orders/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch order by id successfully', async () => {
    const mockOrder = {
      _id: 'order123',
      user_id: 'user456',
      product_id: 'product789',
      quantity: 2,
      status: 'pending',
      createdAt: new Date(),
    }

    ;(Order.findById as jest.Mock).mockResolvedValueOnce(mockOrder)

    const request = new NextRequest('http://localhost:3000/api/orders/order123')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'order123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data._id).toBe('order123')
    expect(data.quantity).toBe(2)
    expect(Order.findById).toHaveBeenCalledWith('order123')
  })

  it('should return 404 when order not found', async () => {
    ;(Order.findById as jest.Mock).mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost:3000/api/orders/nonexistent')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'nonexistent' }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Order not found')
  })

  it('should handle database errors', async () => {
    ;(Order.findById as jest.Mock).mockRejectedValueOnce(new Error('MongoDB error'))

    const request = new NextRequest('http://localhost:3000/api/orders/order123')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'order123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch order')
  })
})

describe('Orders [id] API - PUT /api/orders/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update order quantity successfully', async () => {
    const updateData = { quantity: 5 }
    const updatedOrder = {
      _id: 'order123',
      user_id: 'user456',
      product_id: 'product789',
      quantity: 5,
      status: 'pending',
    }

    ;(Order.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(updatedOrder)

    const request = new NextRequest('http://localhost:3000/api/orders/order123', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    const response = await PUT(request, {
      params: Promise.resolve({ id: 'order123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.quantity).toBe(5)
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('order123', updateData, {
      new: true,
    })
  })

  it('should update order status successfully', async () => {
    const updateData = { status: 'confirmed' }
    const updatedOrder = {
      _id: 'order123',
      user_id: 'user456',
      product_id: 'product789',
      quantity: 2,
      status: 'confirmed',
    }

    ;(Order.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(updatedOrder)

    const request = new NextRequest('http://localhost:3000/api/orders/order123', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    const response = await PUT(request, {
      params: Promise.resolve({ id: 'order123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('confirmed')
  })

  it('should return 404 when order to update not found', async () => {
    ;(Order.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost:3000/api/orders/nonexistent', {
      method: 'PUT',
      body: JSON.stringify({ quantity: 5 }),
    })

    const response = await PUT(request, {
      params: Promise.resolve({ id: 'nonexistent' }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Order not found')
  })

  it('should handle database errors during update', async () => {
    ;(Order.findByIdAndUpdate as jest.Mock).mockRejectedValueOnce(new Error('MongoDB error'))

    const request = new NextRequest('http://localhost:3000/api/orders/order123', {
      method: 'PUT',
      body: JSON.stringify({ quantity: 5 }),
    })

    const response = await PUT(request, {
      params: Promise.resolve({ id: 'order123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update order')
  })

  it('should handle malformed JSON in request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders/order123', {
      method: 'PUT',
      body: 'invalid json',
    })

    const response = await PUT(request, {
      params: Promise.resolve({ id: 'order123' }),
    })

    expect(response.status).toBe(500)
  })
})

describe('Orders [id] API - DELETE /api/orders/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete order successfully', async () => {
    const deletedOrder = {
      _id: 'order123',
      user_id: 'user456',
      product_id: 'product789',
      quantity: 2,
      status: 'pending',
    }

    ;(Order.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(deletedOrder)

    const request = new NextRequest('http://localhost:3000/api/orders/order123', {
      method: 'DELETE',
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'order123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Order deleted successfully')
    expect(Order.findByIdAndDelete).toHaveBeenCalledWith('order123')
  })

  it('should return 404 when order to delete not found', async () => {
    ;(Order.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost:3000/api/orders/nonexistent', {
      method: 'DELETE',
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'nonexistent' }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Order not found')
  })

  it('should handle database errors during deletion', async () => {
    ;(Order.findByIdAndDelete as jest.Mock).mockRejectedValueOnce(new Error('MongoDB error'))

    const request = new NextRequest('http://localhost:3000/api/orders/order123', {
      method: 'DELETE',
    })

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'order123' }),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to delete order')
  })
})
