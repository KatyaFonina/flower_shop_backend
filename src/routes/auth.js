const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: User created }
 *       400: { description: Email already exists }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash },
      select: { id: true, email: true, createdAt: true },
    });

    res.status(201).json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Registration failed' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход с выдачей JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: JWT token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;