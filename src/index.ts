import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authRouter } from './routes/auth';
import { jobRouter } from './routes/jobs';
import { alertRulesRouter } from './routes/alertRules';
import { pricesRouter } from './routes/prices';
import { eventsRouter } from './routes/events';
import { authenticate } from './middleware/authenticate';
import { startPriceFeed } from './services/priceFeed.service';
import { startAlertWorker } from './services/alertWorker.service';
import { startAlertProcessor } from './queues/alertProcessor';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());

// Public routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/jobs', authenticate, jobRouter);
app.use('/api/alert-rules', authenticate, alertRulesRouter);

// Public price feed (read-only)
app.use('/api/prices', pricesRouter);

// SSE — auth via ?token= query param (EventSource can't set headers)
app.use('/events', eventsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startPriceFeed();
  startAlertWorker();
  startAlertProcessor();
});

export default app;
