const Post = require('../models/Post');
const User = require('../models/User');

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const post = await Post.create({
      title,
      content,
      userId,
    });

    res.status(201).json({ message: 'Post berhasil dibuat', post });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: 'Post tidak ditemukan' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post tidak ditemukan' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Anda tidak berhak mengubah post ini' });
    }

    await post.update({ title, content });
    res.status(200).json({ message: 'Post berhasil diubah', post });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post tidak ditemukan' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus post ini' });
    }

    await post.destroy();
    res.status(200).json({ message: 'Post berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

module.exports = { createPost, getAllPosts, getPostById, updatePost, deletePost };
