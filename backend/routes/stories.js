import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

// GET /api/stories - Get all active stories (from followed + public users)
router.get('/', async (req, res) => {
  try {
    // Cleanup expired stories
    await prisma.story.deleteMany({ where: { expiresAt: { lt: new Date() } } });

    // Get users I follow
    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);

    // Get stories from: me, followed users, public users
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: new Date() },
        OR: [
          { userId: req.user.id },
          { userId: { in: followingIds } },
          { user: { isPublic: true } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, email: true } } }
    });

    // Group by user
    const grouped = {};
    for (const story of stories) {
      if (!grouped[story.userId]) {
        grouped[story.userId] = {
          user: story.user,
          stories: [],
          isOwn: story.userId === req.user.id
        };
      }
      grouped[story.userId].stories.push(story);
    }

    // Own stories first, then others
    const result = Object.values(grouped).sort((a, b) => {
      if (a.isOwn) return -1;
      if (b.isOwn) return 1;
      return 0;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/stories - Create a story (expires in 24h)
router.post('/', async (req, res) => {
  try {
    const { image, audio, audioName, text, bgColor } = req.body;

    if (!image && !audio && !text) {
      return res.status(400).json({ message: 'Story must have content' });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: {
        image: image || null,
        audio: audio || null,
        audioName: audioName || null,
        text: text || null,
        bgColor: bgColor || null,
        userId: req.user.id,
        expiresAt
      },
      include: { user: { select: { id: true, username: true, email: true } } }
    });

    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/stories/:id - Delete your story
router.delete('/:id', async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const story = await prisma.story.findUnique({ where: { id: storyId } });

    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await prisma.story.delete({ where: { id: storyId } });
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
