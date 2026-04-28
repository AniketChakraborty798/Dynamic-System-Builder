import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase, appConfig } from './db';
import { register, login } from './auth';
import dynamicApiRouter from './api';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Expose Config for Frontend
app.get('/api/config', (req, res) => {
  res.json(appConfig);
});

// Auth Routes
if (appConfig.features?.auth) {
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
}

// Register dynamic APIs
app.use('/api', dynamicApiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});
