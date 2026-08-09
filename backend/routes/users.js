import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

// GET /api/users/search?q=username - Search users by username
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        username: { contains: q, mode: 'insensitive' }
      },
      select: {
        id: true,
        username: true,
        bio: true,
        isPublic: true,
        _count: { select: { posts: true, followers: true, following: true } }
      },
      take: 20
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/me - Get current user's profile
router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        isPublic: true,
        createdAt: true,
        _count: { select: { posts: true, followers: true, following: true } }
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/:username - Get a user's profile
router.get('/:username', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true,
        username: true,
        bio: true,
        isPublic: true,
        createdAt: true,
        _count: { select: { posts: true, followers: true, following: true } }
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if current user follows this user
    const isFollowing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.user.id, followingId: user.id } }
    });

    // If profile is private and not following, don't show posts
    let posts = [];
    if (user.isPublic || isFollowing || user.id === req.user.id) {
      posts = await prisma.post.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, image: true, audio: true, audioName: true, caption: true, createdAt: true }
      });
    }

    res.json({
      ...user,
      isFollowing: !!isFollowing,
      isOwnProfile: user.id === req.user.id,
      posts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/me - Update profile (bio, isPublic, username)
router.put('/me', async (req, res) => {
  try {
    const { bio, isPublic, username } = req.body;
    const data = {};

    if (bio !== undefined) data.bio = bio;
    if (isPublic !== undefined) data.isPublic = isPublic;
    if (username) {
      // Check if username is taken
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      data.username = username;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, username: true, bio: true, isPublic: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
