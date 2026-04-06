import { CosmosClient } from "@azure/cosmos";
import { env } from "../lib/env.js";

let _client: CosmosClient | null = null;

export function getCosmosClient(): CosmosClient {
  if (!_client) {
    const endpoint = env.COSMOS_ENDPOINT;
    const key = env.COSMOS_KEY;
    if (!endpoint || !key) {
      throw new Error("Cosmos DB not configured");
    }
    _client = new CosmosClient({ endpoint, key });
  }
  return _client;
}

export function getContainer(containerName = env.COSMOS_CONTAINER ?? "") {
  const client = getCosmosClient();
  const database = env.COSMOS_DATABASE ?? "";
  return client.database(database).container(containerName);
}
