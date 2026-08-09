import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

// GET /api/posts - Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/posts/me - Get user's own posts
router.get('/me', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/posts - Create a new post with base64 image/audio
router.post('/', async (req, res) => {
  try {
    const { caption, image, audio } = req.body;

    if (!caption && !image && !audio) {
      return res.status(400).json({ message: 'Post must have caption, image, or audio' });
    }

    // Validate base64 size (limit ~5MB for images, ~10MB for audio)
    if (image && image.length > 7 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image too large (max 5MB)' });
    }
    if (audio && audio.length > 14 * 1024 * 1024) {
      return res.status(400).json({ message: 'Audio too large (max 10MB)' });
    }

    const post = await prisma.post.create({
      data: {
        caption: caption || null,
        image: image || null,
        audio: audio || null,
        userId: req.user.id
      },
      include: { user: { select: { email: true } } }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
