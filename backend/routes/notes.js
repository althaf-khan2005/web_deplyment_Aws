import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// All routes require authentications
router.use(authMiddleware);

// GET /api/notes - Get user's active notes (not expired)
router.get('/', async (req, res) => {
  try {
    // First, delete expired notes (cleanup)
    await prisma.note.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });

    // Get user's active notes
    const notes = await prisma.note.findMany({
      where: {
        userId: req.user.id,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/notes - Create a new note (expires in 24 hours)
router.post('/', async (req, res) => {
  try {
    const { text, color } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    if (text.length > 200) {
      return res.status(400).json({ message: 'Note must be 200 characters or less' });
    }

    // Expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const note = await prisma.note.create({
      data: {
        text: text.trim(),
        color: color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        userId: req.user.id,
        expiresAt
      }
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/notes/:id - Delete a specific note
router.delete('/:id', async (req, res) => {
  try {
    const noteId = parseInt(req.params.id);

    const note = await prisma.note.findUnique({ where: { id: noteId } });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.note.delete({ where: { id: noteId } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
