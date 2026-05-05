import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { defaultQueue } from '../lib/queue';

export const signalRouter = Router();

// GET /api/signals
signalRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const signals = await prisma.signal.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

// POST /api/signals
signalRouter.post('/', async (req: Request, res: Response) => {
  const { name, payload } = req.body;
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  try {
    const signal = await prisma.signal.create({ data: { name, payload } });
    // Enqueue a job for this signal
    await defaultQueue.add('process-signal', { signalId: signal.id });
    res.status(201).json(signal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create signal' });
  }
});

// DELETE /api/signals/:id
signalRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.signal.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'Signal not found' });
  }
});
