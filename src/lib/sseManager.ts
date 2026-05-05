import { Response } from 'express';

interface SSEClient {
  userId: string;
  res:    Response;
}

// In-memory registry: clientId → SSEClient
const clients = new Map<string, SSEClient>();

export function addClient(clientId: string, userId: string, res: Response): void {
  clients.set(clientId, { userId, res });
  console.log(`[SSE] Client connected — userId=${userId} clientId=${clientId} (total: ${clients.size})`);
}

export function removeClient(clientId: string): void {
  clients.delete(clientId);
  console.log(`[SSE] Client disconnected — clientId=${clientId} (total: ${clients.size})`);
}

export function sendToUser(userId: string, event: string, data: unknown): void {
  for (const [, client] of clients) {
    if (client.userId !== userId) continue;
    writeEvent(client.res, event, data);
  }
}

export function broadcast(event: string, data: unknown): void {
  for (const [, client] of clients) {
    writeEvent(client.res, event, data);
  }
}

function writeEvent(res: Response, event: string, data: unknown): void {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch {
    // Client likely disconnected mid-write — harmless
  }
}
