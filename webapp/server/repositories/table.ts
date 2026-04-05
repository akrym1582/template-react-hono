import { TableClient, TableServiceClient } from "@azure/data-tables";
import { env } from "../lib/env.js";

let _client: TableServiceClient | null = null;

function getStorageConnectionString(): string {
  const connectionString = env.STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("Table Storage not configured");
  }
  return connectionString;
}

export function getTableServiceClient(): TableServiceClient {
  if (!_client) {
    _client = TableServiceClient.fromConnectionString(getStorageConnectionString());
  }
  return _client;
}

export function getTableClient(tableName: string): TableClient {
  if (!tableName) {
    throw new Error("Table name is required");
  }
  return TableClient.fromConnectionString(getStorageConnectionString(), tableName);
}
