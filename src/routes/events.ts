import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { verifyToken } from '../lib/jwt';
import { addClient, removeClient } from '../lib/sseManager';

export const eventsRouter = Router();

/**
 * GET /events?token=<jwt>
 *
 * SSE uses a persistent GET connection — Authorization headers can't be set
 * by EventSource in the browser, so we accept the JWT as a query param instead.
 */
eventsRouter.get('/', (req: Request, res: Response) => {
  const token = req.query.token as string | undefined;

  if (!token) {
    res.status(401).json({ error: 'token query param required' });
    return;
  }

  let userId: string;
  try {
    const payload = verifyToken(token);
    userId = payload.userId;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // SSE headers
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering
  res.flushHeaders();

  const clientId = randomUUID();
  addClient(clientId, userId, res);

  // Heartbeat every 30s to keep the connection alive through proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 30_000);

  // Send a connected confirmation event
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ clientId, userId })}\n\n`);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(clientId);
  });
});
