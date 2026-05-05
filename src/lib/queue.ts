import { Queue, Worker, QueueEvents } from 'bullmq';
import { redis } from './redis';

export const defaultQueue = new Queue('signal-flow-queue', {
  connection: redis,
});

export const createWorker = (name: string, processor: any) => {
  return new Worker(name, processor, { connection: redis });
};

export const queueEvents = new QueueEvents('signal-flow-queue', { connection: redis });
