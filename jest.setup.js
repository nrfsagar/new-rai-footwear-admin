// jest.setup.js
jest.mock('@/lib/mongoose', () => ({
  connectToDatabase: jest.fn().mockResolvedValue(undefined),
}))

// Mock mongoose models
jest.mock('@/lib/models/product.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(() => ({
      lean: jest.fn().mockResolvedValue([]),
      sort: jest.fn().mockResolvedValue([]),
    })),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('@/lib/models/order.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(() => ({
      sort: jest.fn().mockResolvedValue([]),
    })),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('@/lib/models/notification.model', () => ({
  __esModule: true,
  default: {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
  },
}))

process.env.MONGODB_URI = 'mongodb://localhost:27017/nrf-test'
