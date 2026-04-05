import { beforeEach, describe, expect, it, vi } from "vitest";

async function importQueueModule(connectionString?: string) {
  vi.resetModules();

  const mockQueueClient = {
    sendMessage: vi.fn(),
    receiveMessages: vi.fn(),
    deleteMessage: vi.fn(),
  };
  const mockQueueServiceClient = {
    getQueueClient: vi.fn().mockReturnValue(mockQueueClient),
  };
  const fromConnectionString = vi.fn().mockReturnValue(mockQueueServiceClient);

  vi.doMock("@azure/storage-queue", () => ({
    QueueServiceClient: {
      fromConnectionString,
    },
  }));
  vi.doMock("../../../../webapp/server/lib/env.js", () => ({
    env: {
      STORAGE_CONNECTION_STRING: connectionString,
    },
  }));

  const module = await import("../../../../webapp/server/repositories/queue.js");
  return { ...module, fromConnectionString, mockQueueClient, mockQueueServiceClient };
}

describe("queue repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates and caches the Queue service client from the shared storage connection string", async () => {
    const { getQueueServiceClient, fromConnectionString, mockQueueServiceClient } =
      await importQueueModule("UseDevelopmentStorage=true");

    const client1 = getQueueServiceClient();
    const client2 = getQueueServiceClient();

    expect(client1).toBe(mockQueueServiceClient);
    expect(client2).toBe(mockQueueServiceClient);
    expect(fromConnectionString).toHaveBeenCalledOnce();
    expect(fromConnectionString).toHaveBeenCalledWith("UseDevelopmentStorage=true");
  });

  it("returns a named Queue client", async () => {
    const { getQueueClient, mockQueueClient, mockQueueServiceClient } =
      await importQueueModule("UseDevelopmentStorage=true");

    const client = getQueueClient("jobs");

    expect(client).toBe(mockQueueClient);
    expect(mockQueueServiceClient.getQueueClient).toHaveBeenCalledWith("jobs");
  });

  it("throws when the storage connection string is missing", async () => {
    const { getQueueServiceClient } = await importQueueModule();

    expect(() => getQueueServiceClient()).toThrowError("Queue Storage not configured");
  });

  it("throws when the queue name is empty", async () => {
    const { getQueueClient } = await importQueueModule("UseDevelopmentStorage=true");

    expect(() => getQueueClient("")).toThrowError("Queue name is required");
  });
});
