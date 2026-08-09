import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

// GET /api/posts - Get feed (own posts + followed users + public users)
router.get('/', async (req, res) => {
  try {
    // Get list of users I follow
    const followingList = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true }
    });
    const followingIds = followingList.map(f => f.followingId);

    // Get posts from: myself, people I follow, public profiles
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { userId: { in: followingIds } },
          { user: { isPublic: true } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, username: true, isPublic: true } } },
      take: 50
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
      include: { user: { select: { id: true, email: true, username: true } } }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/posts/stories - Get recent posts from followed users (for stories)
router.get('/stories', async (req, res) => {
  try {
    const followingList = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true }
    });
    const followingIds = followingList.map(f => f.followingId);

    // Get recent posts (last 24h) from followed users
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentPosts = await prisma.post.findMany({
      where: {
        userId: { in: followingIds },
        createdAt: { gte: oneDayAgo }
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true } } },
      take: 20
    });

    // Group by user
    const storiesMap = new Map();
    for (const post of recentPosts) {
      if (!storiesMap.has(post.userId)) {
        storiesMap.set(post.userId, {
          user: post.user,
          latestPost: post
        });
      }
    }

    res.json(Array.from(storiesMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/posts - Create a new post
router.post('/', async (req, res) => {
  try {
    const { caption, image, audio, audioName } = req.body;

    if (!caption && !image && !audio) {
      return res.status(400).json({ message: 'Post must have caption, image, or audio' });
    }

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
        audioName: audioName || null,
        userId: req.user.id
      },
      include: { user: { select: { id: true, email: true, username: true } } }
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
