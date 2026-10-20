const express = require('express');
const prisma = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Создать заказ (требуется JWT)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items: { type: array }
 *               total: { type: integer }
 *               address: { type: string }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 */
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, address } = req.body;
    if (!items || !total) {
      return res.status(400).json({ message: 'Items and total required' });
    }
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        items: JSON.stringify(items),
        total: Number(total),
        address: address || null,
      },
    });
    res.status(201).json(order);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Create order failed' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: История заказов текущего пользователя
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
router.get('/', auth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

module.exports = router;