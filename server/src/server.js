import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './db.js';
import { buildRouter } from './routes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.use(async (req, res, next) => {
  // The storage mode is attached at startup below; this middleware is intentionally simple.
  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const PORT = Number(process.env.PORT || 5000);

connectDatabase()
  .then((useMongo) => {
    app.use('/api', buildRouter(useMongo));
    app.use((err, _req, res, _next) => {
      console.error(err);
      res.status(500).json({ message: 'Server error. Check the backend terminal for details.' });
    });
    app.listen(PORT, () => console.log(`Group Shopping API listening at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  });
