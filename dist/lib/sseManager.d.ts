import { Response } from 'express';
export declare function addClient(clientId: string, userId: string, res: Response): void;
export declare function removeClient(clientId: string): void;
export declare function sendToUser(userId: string, event: string, data: unknown): void;
export declare function broadcast(event: string, data: unknown): void;
