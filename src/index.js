require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const authRoutes = require('./routes/auth');
const flowerRoutes = require('./routes/flowers');
const orderRoutes = require('./routes/orders');

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4000',
  'http://localhost:62855',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/flowers', flowerRoutes);
app.use('/api/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(` Flower Shop API running at http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});