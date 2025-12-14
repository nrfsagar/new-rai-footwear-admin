import { GET, POST } from '@/app/api/devices/register/route'
import AppNotification from '@/lib/models/notification.model'
import { NextRequest } from 'next/server'

jest.mock('@/lib/mongoose')
jest.mock('@/lib/models/notification.model')

describe('Devices Register API - POST /api/devices/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new device successfully', async () => {
    const deviceData = {
      token: 'device_token_123',
      email: 'user@example.com',
      name: 'John Device',
      phone: '+919876543210',
      timestamp: new Date().toISOString(),
    }

    const savedDevice = {
      _id: 'device_123',
      token: 'device_token_123',
      email: 'user@example.com',
      name: 'John Device',
      phone: '+919876543210',
      lastActive: deviceData.timestamp,
      toObject: () => ({
        _id: 'device_123',
        token: 'device_token_123',
        email: 'user@example.com',
        name: 'John Device',
        phone: '+919876543210',
        lastActive: deviceData.timestamp,
      }),
    }

    ;(AppNotification.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(savedDevice)

    const request = new NextRequest('http://localhost:3000/api/devices/register', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.device.token).toBe('device_token_123')
    expect(data.device.email).toBe('user@example.com')
  })

  it('should reject registration without token', async () => {
    const invalidData = {
      email: 'user@example.com',
      name: 'John Device',
    }

    const request = new NextRequest('http://localhost:3000/api/devices/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Token is required')
    expect(AppNotification.findOneAndUpdate).not.toHaveBeenCalled()
  })

  it('should update existing device token', async () => {
    const deviceData = {
      token: 'new_device_token_456',
      email: 'user@example.com',
      timestamp: new Date().toISOString(),
    }

    const updatedDevice = {
      _id: 'device_123',
      token: 'new_device_token_456',
      email: 'user@example.com',
      lastActive: deviceData.timestamp,
      toObject: () => ({
        _id: 'device_123',
        token: 'new_device_token_456',
        email: 'user@example.com',
        lastActive: deviceData.timestamp,
      }),
    }

    ;(AppNotification.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(updatedDevice)

    const request = new NextRequest('http://localhost:3000/api/devices/register', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(AppNotification.findOneAndUpdate).toHaveBeenCalledWith(
      { token: 'new_device_token_456' },
      expect.objectContaining({
        token: 'new_device_token_456',
        email: 'user@example.com',
      }),
      { upsert: true, new: true }
    )
  })

  it('should handle database errors during registration', async () => {
    const deviceData = {
      token: 'device_token_123',
      email: 'user@example.com',
    }

    ;(AppNotification.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(
      new Error('MongoDB error')
    )

    const request = new NextRequest('http://localhost:3000/api/devices/register', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Error registering device')
  })

  it('should accept token only without other fields', async () => {
    const minimalData = {
      token: 'device_token_789',
    }

    const savedDevice = {
      _id: 'device_456',
      token: 'device_token_789',
      toObject: () => ({
        _id: 'device_456',
        token: 'device_token_789',
      }),
    }

    ;(AppNotification.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(savedDevice)

    const request = new NextRequest('http://localhost:3000/api/devices/register', {
      method: 'POST',
      body: JSON.stringify(minimalData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})

describe('Devices Register API - GET /api/devices/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch device by email successfully', async () => {
    const mockDevice = {
      _id: 'device_123',
      token: 'device_token_123',
      email: 'user@example.com',
      name: 'John Device',
      phone: '+919876543210',
      lastActive: new Date().toISOString(),
      toObject: () => ({
        _id: 'device_123',
        token: 'device_token_123',
        email: 'user@example.com',
        name: 'John Device',
        phone: '+919876543210',
        lastActive: new Date().toISOString(),
      }),
    }

    ;(AppNotification.findOne as jest.Mock).mockResolvedValueOnce(mockDevice)

    const request = new NextRequest('http://localhost:3000/api/devices/register?email=user@example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.device.email).toBe('user@example.com')
    expect(AppNotification.findOne).toHaveBeenCalledWith({ email: 'user@example.com' })
  })

  it('should reject query without email parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/devices/register')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Email is required')
    expect(AppNotification.findOne).not.toHaveBeenCalled()
  })

  it('should return 404 when device not found', async () => {
    ;(AppNotification.findOne as jest.Mock).mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost:3000/api/devices/register?email=nonexistent@example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Device not found')
  })

  it('should handle database errors during fetch', async () => {
    ;(AppNotification.findOne as jest.Mock).mockRejectedValueOnce(new Error('MongoDB error'))

    const request = new NextRequest('http://localhost:3000/api/devices/register?email=user@example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Error getting device')
  })

  it('should handle special characters in email', async () => {
    const mockDevice = {
      _id: 'device_789',
      token: 'token',
      email: 'user+test@example.com',
      toObject: () => ({
        _id: 'device_789',
        token: 'token',
        email: 'user+test@example.com',
      }),
    }

    ;(AppNotification.findOne as jest.Mock).mockResolvedValueOnce(mockDevice)

    const request = new NextRequest('http://localhost:3000/api/devices/register?email=user+test@example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.device.email).toBe('user+test@example.com')
  })
})
