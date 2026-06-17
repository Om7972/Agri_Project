import request from 'supertest';
import app from '@/app';
import prisma from '@/config/db';

// Mock Prisma entirely so CI never needs a live database connection
jest.mock('@/config/db', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn().mockResolvedValue(undefined),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Auth & System Integrity Endpoints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /', () => {
    it('should return 200 OK and system status ONLINE', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual('ONLINE');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 Bad Request if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'short',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success');
      expect(res.body.success).toEqual(false);
    });
  });
});
