import { Queue, Worker, QueueEvents } from 'bullmq';
export declare const defaultQueue: Queue<any, any, string, any, any, string>;
export declare const createWorker: (name: string, processor: any) => Worker<any, any, string>;
export declare const queueEvents: QueueEvents;
