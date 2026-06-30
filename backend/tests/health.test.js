const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

// Mock database config
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  getPool: () => ({
    end: jest.fn().mockResolvedValue(true)
  })
}));

describe('Health and Routing API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 and healthy status when database is online', async () => {
      // Mock db.query returning success
      db.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ '1': 1 }] });

      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        status: 'healthy',
        database: 'connected'
      });
      expect(db.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return 503 and unhealthy status when database query fails or is empty', async () => {
      // Mock db.query returning no rows
      db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(503);
      expect(res.body).toEqual({
        success: false,
        status: 'unhealthy',
        database: 'disconnected',
        message: 'Database connection is not available'
      });
    });

    it('should return 503 and unhealthy status when database throws an exception', async () => {
      // Mock db.query throwing an error
      db.query.mockRejectedValueOnce(new Error('Connection refused'));

      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(503);
      expect(res.body).toEqual({
        success: false,
        status: 'unhealthy',
        database: 'disconnected',
        message: 'Database connection could not be established'
      });
    });
  });

  describe('Unknown route 404 handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const res = await request(app).get('/api/invalid-endpoint-path');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resource not found');
    });
  });
});
