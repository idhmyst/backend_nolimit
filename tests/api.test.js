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
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
      }

      res.status(201).json({
        message: 'User berhasil terdaftar',
        user: { id: 1, username, email },
      });
    });

    app.post('/api/auth/login', (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi' });
      }

      const token = jwt.sign(
        { id: 1, email, username: 'testuser' },
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
          title: 'Welcome Post',
          content: 'This is a test post',
          userId: 1,
          User: {
            id: 1,
            username: 'testuser',
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
          title: 'Welcome Post',
          content: 'This is a test post',
          userId: 1,
          User: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
          },
        });
      }

      res.status(404).json({ message: 'Post tidak ditemukan' });
    });

    app.post('/api/posts', authenticateToken, (req, res) => {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
      }

      res.status(201).json({
        message: 'Post berhasil dibuat',
        post: {
          id: 1,
          title,
          content,
          userId: req.user.id,
        },
      });
    });

    app.put('/api/posts/:id', authenticateToken, (req, res) => {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
      }

      res.status(200).json({
        message: 'Post berhasil diubah',
        post: {
          id: req.params.id,
          title,
          content,
          userId: req.user.id,
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
          username: 'testuser',
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
          username: 'testuser',
          // missing email and password
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
          // missing password
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
      expect(res.body).toHaveProperty('title');
      expect(res.body.id).toBe(1);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app).get('/api/posts/999');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post tidak ditemukan');
    });

    it('should create a new post with token', async () => {
      const token = jwt.sign(
        { id: 1, email: 'test@example.com', username: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Post',
          content: 'This is a new post',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Post berhasil dibuat');
      expect(res.body.post).toHaveProperty('title');
    });

    it('should reject post creation without token', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          title: 'New Post',
          content: 'This is a new post',
        });

      expect(res.status).toBe(401);
    });

    it('should update a post with valid token', async () => {
      const token = jwt.sign(
        { id: 1, email: 'test@example.com', username: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const res = await request(app)
        .put('/api/posts/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Post',
          content: 'Updated content',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post berhasil diubah');
    });

    it('should delete a post with valid token', async () => {
      const token = jwt.sign(
        { id: 1, email: 'test@example.com', username: 'testuser' },
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
