import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if email already exist
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate username from email if not provided
    const finalUsername = username || email.split('@')[0] + Math.floor(Math.random() * 999);

    // Check if username is taken (try-catch in case column doesn't exist yet)
    try {
      const existingUsername = await prisma.user.findUnique({ where: { username: finalUsername } });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    } catch (e) {
      // username column may not exist yet, skip check
    }

    // Create user - try with username first, fall back without
    let user;
    try {
      user = await prisma.user.create({
        data: { email, password: await bcrypt.hash(password, 10), username: finalUsername }
      });
    } catch (e) {
      // If username column doesn't exist, create without it
      user = await prisma.user.create({
        data: { email, password: await bcrypt.hash(password, 10) }
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username || finalUsername }, process.env.JWT_SECRET);
    res.json({ token, email: user.email, username: user.username || finalUsername });
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

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username || email.split('@')[0] }, process.env.JWT_SECRET);
    res.json({ token, email: user.email, username: user.username || email.split('@')[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
