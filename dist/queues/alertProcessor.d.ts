import { Worker } from 'bullmq';
import { AlertJobData } from './alertQueue';
export declare function startAlertProcessor(): Worker<AlertJobData>;
