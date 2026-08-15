import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

// POST /api/follow/:userId - Follow a userso 
router.post('/:userId', async (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);

    if (followingId === req.user.id) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.user.id, followingId } }
    });

    if (existing) return res.status(400).json({ message: 'Already following' });

    await prisma.follow.create({
      data: { followerId: req.user.id, followingId }
    });

    res.json({ message: 'Followed successfully', isFollowing: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/follow/:userId - Unfollow a user
router.delete('/:userId', async (req, res) => {
  try {
    const followingId = parseInt(req.params.userId);

    await prisma.follow.deleteMany({
      where: { followerId: req.user.id, followingId }
    });

    res.json({ message: 'Unfollowed successfully', isFollowing: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/follow/following - Get list of users I follow
router.get('/following', async (req, res) => {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      include: {
        following: { select: { id: true, username: true, bio: true } }
      }
    });

    res.json(following.map(f => f.following));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/follow/followers - Get my followers
router.get('/followers', async (req, res) => {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: req.user.id },
      include: {
        follower: { select: { id: true, username: true, bio: true } }
      }
    });

    res.json(followers.map(f => f.follower));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
