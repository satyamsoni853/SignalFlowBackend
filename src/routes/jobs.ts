import { Router, Request, Response } from 'express';
import { defaultQueue } from '../lib/queue';

export const jobRouter = Router();

// GET /api/jobs — list recent jobs
jobRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      defaultQueue.getWaiting(),
      defaultQueue.getActive(),
      defaultQueue.getCompleted(0, 20),
      defaultQueue.getFailed(0, 20),
    ]);
    res.json({ waiting, active, completed, failed });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// POST /api/jobs — manually enqueue a job
jobRouter.post('/', async (req: Request, res: Response) => {
  const { name, data } = req.body;
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  try {
    const job = await defaultQueue.add(name, data || {});
    res.status(201).json({ jobId: job.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to enqueue job' });
  }
});
