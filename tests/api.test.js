const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

describe('API Tests', () => {
  let app;

  beforeAll(() => {
    // Setup Express app untuk testing
    app = express();
    app.use(express.json());

    // Mock routes tanpa database
    const { authenticateToken } = require('../middleware/auth');

    // Auth endpoints
    app.post('/api/auth/register', (req, res) => {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
      }

      res.status(201).json({
        message: 'User berhasil terdaftar',
        user: { id: 1, name, email },
      });
    });

    app.post('/api/auth/login', (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi' });
      }

      const token = jwt.sign(
        { id: 1, email, name: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({ message: 'Login berhasil', token });
    });

    // Post endpoints
    app.get('/api/posts', (req, res) => {
      res.status(200).json([
        {
          id: 1,
          content: 'This is a test post',
          authorId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          User: {
            id: 1,
            name: 'testuser',
            email: 'test@example.com',
          },
        },
      ]);
    });

    app.get('/api/posts/:id', (req, res) => {
      const { id } = req.params;

      if (id === '1') {
        return res.status(200).json({
          id: 1,
          content: 'This is a test post',
          authorId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          User: {
            id: 1,
            name: 'testuser',
            email: 'test@example.com',
          },
        });
      }

      res.status(404).json({ message: 'Post tidak ditemukan' });
    });

    app.post('/api/posts', authenticateToken, (req, res) => {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
      }

      res.status(201).json({
        message: 'Post berhasil dibuat',
        post: {
          id: 1,
          content,
          authorId: req.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    app.put('/api/posts/:id', authenticateToken, (req, res) => {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
      }

      res.status(200).json({
        message: 'Post berhasil diubah',
        post: {
          id: req.params.id,
          content,
          authorId: req.user.id,
          updatedAt: new Date().toISOString(),
        },
      });
    });

    app.delete('/api/posts/:id', authenticateToken, (req, res) => {
      res.status(200).json({ message: 'Post berhasil dihapus' });
    });
  });

  describe('Auth Routes', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('User berhasil terdaftar');
    });

    it('should reject register with missing data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'testuser',
        });

      expect(res.status).toBe(400);
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.message).toBe('Login berhasil');
    });

    it('should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Post Routes', () => {
    it('should get all posts', async () => {
      const res = await request(app).get('/api/posts');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get post by id', async () => {
      const res = await request(app).get('/api/posts/1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('content');
      expect(res.body.id).toBe(1);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app).get('/api/posts/999');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post tidak ditemukan');
    });

    it('should create a new post with token', async () => {
      const token = jwt.sign(
        { id: 1, email: 'test@example.com', name: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'This is a new post',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Post berhasil dibuat');
      expect(res.body.post).toHaveProperty('content');
      expect(res.body.post).toHaveProperty('authorId');
    });

    it('should reject post creation without token', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          content: 'This is a new post',
        });

      expect(res.status).toBe(401);
    });

    it('should update a post with valid token', async () => {
      const token = jwt.sign(
        { id: 1, email: 'test@example.com', name: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const res = await request(app)
        .put('/api/posts/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Updated content',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post berhasil diubah');
      expect(res.body.post).toHaveProperty('authorId');
    });

    it('should delete a post with valid token', async () => {
      const token = jwt.sign(
        { id: 1, email: 'test@example.com', name: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const res = await request(app)
        .delete('/api/posts/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post berhasil dihapus');
    });
  });
});
