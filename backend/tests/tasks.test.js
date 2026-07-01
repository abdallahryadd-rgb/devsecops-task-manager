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

describe('Tasks API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Tests', () => {
    it('should return 400 when creating a task without a title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title provided' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('title');
      expect(res.body.errors[0].message).toBe('Title is required');
    });

    it('should return 400 when creating a task with title shorter than 3 characters', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'ab', description: 'Too short' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('title');
      expect(res.body.errors[0].message).toBe('Title must be at least 3 characters long');
    });

    it('should return 400 when updating a task with an invalid status', async () => {
      const res = await request(app)
        .put('/api/tasks/1')
        .send({ status: 'in-progress' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('status');
      expect(res.body.errors[0].message).toBe("Status must be either 'pending' or 'completed'");
    });

    it('should return 400 when changing task status to an invalid value', async () => {
      const res = await request(app)
        .patch('/api/tasks/1/status')
        .send({ status: 'done' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('status');
      expect(res.body.errors[0].message).toBe("Status must be either 'pending' or 'completed'");
    });

    it('should return 400 when using an invalid task ID (non-numeric)', async () => {
      const res = await request(app).get('/api/tasks/abc');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('id');
      expect(res.body.errors[0].message).toContain('Invalid task ID');
    });

    it('should return 400 when using an invalid task ID (negative integer)', async () => {
      const res = await request(app).get('/api/tasks/-5');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('id');
    });

    it('should return 404 when requesting a missing task', async () => {
      // Mock getTaskById returning nothing
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/api/tasks/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Task not found');
    });
  });

  describe('CRUD API Actions', () => {
    it('should create a task successfully', async () => {
      const mockTask = {
        id: 1,
        title: 'New Graduation Task',
        description: 'Implement tests',
        status: 'pending',
        created_at: '2026-06-23T00:00:00Z',
        updated_at: '2026-06-23T00:00:00Z'
      };
      
      db.query.mockResolvedValueOnce({ rows: [mockTask] });

      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Graduation Task', description: 'Implement tests' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockTask);
    });

    it('should get tasks list optionally filtered by status', async () => {
      const mockTasks = [
        { id: 2, title: 'Task B', status: 'completed' },
        { id: 1, title: 'Task A', status: 'pending' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockTasks });

      const res = await request(app).get('/api/tasks');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toEqual(mockTasks);
    });

    it('should get a single task by ID', async () => {
      const mockTask = { id: 10, title: 'Single Task', status: 'pending' };
      db.query.mockResolvedValueOnce({ rows: [mockTask] });

      const res = await request(app).get('/api/tasks/10');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockTask);
    });

    it('should update a task details successfully', async () => {
      const mockUpdatedTask = { id: 5, title: 'Updated Task', description: 'Updated Desc', status: 'completed' };
      
      // PUT dynamic check first reads, then updates
      db.query.mockResolvedValueOnce({ rows: [mockUpdatedTask] });

      const res = await request(app)
        .put('/api/tasks/5')
        .send({ title: 'Updated Task', description: 'Updated Desc', status: 'completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockUpdatedTask);
    });

    it('should update task status via PATCH successfully', async () => {
      const mockUpdatedTask = { id: 5, title: 'Task', description: '', status: 'completed' };
      db.query.mockResolvedValueOnce({ rows: [mockUpdatedTask] });

      const res = await request(app)
        .patch('/api/tasks/5/status')
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
    });

    it('should delete a task successfully', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 5 }] });

      const res = await request(app).delete('/api/tasks/5');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Task deleted successfully');
    });

    it('should return 404 when deleting a non-existent task', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const res = await request(app).delete('/api/tasks/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should get task stats successfully', async () => {
      const mockStats = { total: 10, pending: 6, completed: 4 };
      db.query.mockResolvedValueOnce({ rows: [mockStats] });

      const res = await request(app).get('/api/tasks/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockStats);
    });
  });
});
