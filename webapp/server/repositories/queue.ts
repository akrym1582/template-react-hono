import { QueueServiceClient, type QueueClient } from "@azure/storage-queue";
import { env } from "../lib/env.js";

let _client: QueueServiceClient | null = null;

export function getQueueServiceClient(): QueueServiceClient {
  if (!_client) {
    const connectionString = env.STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("Queue Storage not configured");
    }
    _client = QueueServiceClient.fromConnectionString(connectionString);
  }
  return _client;
}

export function getQueueClient(queueName: string): QueueClient {
  if (!queueName) {
    throw new Error("Queue name is required");
  }
  return getQueueServiceClient().getQueueClient(queueName);
}
