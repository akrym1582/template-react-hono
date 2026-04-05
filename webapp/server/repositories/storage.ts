import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "../lib/env.js";

let _client: BlobServiceClient | null = null;

export function getStorageClient(): BlobServiceClient {
  if (!_client) {
    const connectionString = env.STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("Blob Storage not configured");
    }
    _client = BlobServiceClient.fromConnectionString(connectionString);
  }
  return _client;
}
