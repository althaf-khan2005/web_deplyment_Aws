import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Generate username from email if not provided
    const finalUsername = username || email.split('@')[0] + Math.floor(Math.random() * 999);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: finalUsername }] }
    });
    if (existing) {
      if (existing.email === email) return res.status(400).json({ message: 'User already exists' });
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, username: finalUsername }
    });

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET);
    res.json({ token, email: user.email, username: user.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET);
    res.json({ token, email: user.email, username: user.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
