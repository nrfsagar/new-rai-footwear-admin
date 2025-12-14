import { GET, POST } from '@/app/api/products/route'
import Product from '@/lib/models/product.model'
import { NextRequest } from 'next/server'

jest.mock('@/lib/mongoose')
jest.mock('@/lib/models/product.model')

describe('Products API - GET /api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all products without filters', async () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Running Shoe',
        gender: 'man',
        category: 'shoe',
        subcategory: 'running',
        price: 5000,
        stock: 50,
        images: ['img1.jpg'],
        sizes: '6,7,8,9,10',
        description: 'Professional running shoe',
        quality: 'Fresh',
      },
      {
        _id: '2',
        name: 'Casual Shoe',
        gender: 'women',
        category: 'shoe',
        subcategory: 'casual',
        price: 4000,
        stock: 30,
        images: ['img2.jpg'],
        sizes: '5,6,7,8',
        description: 'Comfortable casual shoe',
        quality: 'Fresh',
      },
    ]

    ;(Product.find as jest.Mock).mockResolvedValueOnce(mockProducts)

    const request = new NextRequest('http://localhost:3000/api/products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect(data[0].name).toBe('Running Shoe')
    expect(Product.find).toHaveBeenCalledWith({})
  })

  it('should filter products by gender', async () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Men Shoe',
        gender: 'man',
        category: 'shoe',
        price: 5000,
      },
    ]

    ;(Product.find as jest.Mock).mockResolvedValueOnce(mockProducts)

    const request = new NextRequest('http://localhost:3000/api/products?gender=man')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data[0].gender).toBe('man')
    expect(Product.find).toHaveBeenCalledWith({ gender: 'man' })
  })

  it('should filter products by category', async () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Sandal',
        category: 'sandals',
        price: 2000,
      },
    ]

    ;(Product.find as jest.Mock).mockResolvedValueOnce(mockProducts)

    const request = new NextRequest('http://localhost:3000/api/products?category=sandals')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data[0].category).toBe('sandals')
    expect(Product.find).toHaveBeenCalledWith({ category: 'sandals' })
  })

  it('should filter products by multiple criteria', async () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Women Running Shoe',
        gender: 'women',
        category: 'shoe',
        subcategory: 'running',
      },
    ]

    ;(Product.find as jest.Mock).mockResolvedValueOnce(mockProducts)

    const request = new NextRequest(
      'http://localhost:3000/api/products?gender=women&category=shoe&subcategory=running'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Product.find).toHaveBeenCalledWith({
      gender: 'women',
      category: 'shoe',
      subcategory: 'running',
    })
  })

  it('should return empty array when no products match filters', async () => {
    ;(Product.find as jest.Mock).mockResolvedValueOnce([])

    const request = new NextRequest('http://localhost:3000/api/products?gender=invalid')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(0)
  })

  it('should handle database errors gracefully', async () => {
    ;(Product.find as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal Server Error')
  })
})

describe('Products API - POST /api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new product successfully', async () => {
    const newProduct = {
      name: 'New Running Shoe',
      gender: 'man',
      category: 'shoe',
      subcategory: 'running',
      price: 6000,
      stock: 100,
      images: ['image1.jpg', 'image2.jpg'],
      sizes: '6,7,8,9,10',
      description: 'Latest running shoe model',
      quality: 'Fresh',
    }

    const savedProduct = {
      _id: '123',
      ...newProduct,
      createdAt: new Date(),
    }

    ;(Product as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValueOnce(savedProduct),
    }))

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data._id).toBe('123')
    expect(data.name).toBe('New Running Shoe')
    expect(data.price).toBe(6000)
  })

  it('should validate required fields', async () => {
    const invalidProduct = {
      name: 'Shoe without category',
      gender: 'man',
      // missing category, subcategory, price, stock, images, sizes, description
    }

    ;(Product as any).mockImplementation(() => ({
      save: jest.fn().mockRejectedValueOnce(new Error('Validation error')),
    }))

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(invalidProduct),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal Server Error')
  })

  it('should handle database errors during creation', async () => {
    const newProduct = {
      name: 'Product',
      gender: 'man',
      category: 'shoe',
      subcategory: 'running',
      price: 5000,
      stock: 50,
      images: ['img.jpg'],
      sizes: '7,8',
      description: 'Test',
    }

    ;(Product as any).mockImplementation(() => ({
      save: jest.fn().mockRejectedValueOnce(new Error('MongoDB error')),
    }))

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal Server Error')
  })

  it('should handle malformed JSON in request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: 'invalid json',
    })

    const response = await POST(request)
    
    expect(response.status).toBe(500)
  })
})
