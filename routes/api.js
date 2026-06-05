const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { createPost, getAllPosts, getPostById, updatePost, deletePost } = require('../controllers/postController');
const { authenticateToken } = require('../middleware/auth');

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Post Routes
router.post('/posts', authenticateToken, createPost);
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);
router.put('/posts/:id', authenticateToken, updatePost);
router.delete('/posts/:id', authenticateToken, deletePost);

module.exports = router;
