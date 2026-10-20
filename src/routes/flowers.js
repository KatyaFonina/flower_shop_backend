const express = require('express');
const prisma = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/flowers:
 *   get:
 *     summary: Получить список всех цветов/букетов
 *     tags: [Flowers]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', async (req, res) => {
  const flowers = await prisma.flower.findMany({
    orderBy: { id: 'asc' },
  });
  res.json(flowers);
});

/**
 * @swagger
 * /api/flowers/{id}:
 *   get:
 *     summary: Получить один цветок по ID
 *     tags: [Flowers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const flower = await prisma.flower.findUnique({ where: { id } });
  if (!flower) {
    return res.status(404).json({ message: 'Flower not found' });
  }
  res.json(flower);
});

/**
 * @swagger
 * /api/flowers:
 *   post:
 *     summary: Создать новый цветок (требуется JWT)
 *     tags: [Flowers]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: integer }
 *               image: { type: string }
 *               category: { type: string }
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    if (!name || !description || !price || !image) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const flower = await prisma.flower.create({
      data: {
        name,
        description,
        price: Number(price),
        image,
        category: category || 'flower',
      },
    });
    res.status(201).json(flower);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Create failed' });
  }
});

/**
 * @swagger
 * /api/flowers/{id}:
 *   put:
 *     summary: Обновить цветок (требуется JWT)
 *     tags: [Flowers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: integer }
 *               image: { type: string }
 *               category: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, image, category } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (image !== undefined) data.image = image;
    if (category !== undefined) data.category = category;

    const flower = await prisma.flower.update({ where: { id }, data });
    res.json(flower);
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: 'Flower not found or update failed' });
  }
});

/**
 * @swagger
 * /api/flowers/{id}:
 *   delete:
 *     summary: Удалить цветок (требуется JWT)
 *     tags: [Flowers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.flower.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: 'Flower not found' });
  }
});

module.exports = router;