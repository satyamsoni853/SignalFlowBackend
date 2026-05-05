import { Queue, QueueEvents } from 'bullmq';
export declare const ALERT_QUEUE_NAME = "alert-triggered";
export interface AlertJobData {
    ruleId: string;
    userId: string;
    assetSymbol: string;
    condition: string;
    targetPrice: number;
    triggeredPrice: number;
    triggeredAt: string;
}
export declare const alertQueue: Queue<AlertJobData, any, string, AlertJobData, any, string>;
export declare const alertQueueEvents: QueueEvents;
