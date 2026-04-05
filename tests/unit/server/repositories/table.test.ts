import { beforeEach, describe, expect, it, vi } from "vitest";

async function importTableModule(connectionString?: string) {
  vi.resetModules();

  const mockTableClient = {
    createEntity: vi.fn(),
    getEntity: vi.fn(),
    updateEntity: vi.fn(),
    deleteEntity: vi.fn(),
  };
  const mockTableServiceClient = {};
  const fromServiceConnectionString = vi.fn().mockReturnValue(mockTableServiceClient);
  const fromTableConnectionString = vi.fn().mockReturnValue(mockTableClient);

  vi.doMock("@azure/data-tables", () => ({
    TableClient: {
      fromConnectionString: fromTableConnectionString,
    },
    TableServiceClient: {
      fromConnectionString: fromServiceConnectionString,
    },
  }));
  vi.doMock("../../../../webapp/server/lib/env.js", () => ({
    env: {
      STORAGE_CONNECTION_STRING: connectionString,
    },
  }));

  const module = await import("../../../../webapp/server/repositories/table.js");
  return {
    ...module,
    fromServiceConnectionString,
    fromTableConnectionString,
    mockTableClient,
    mockTableServiceClient,
  };
}

describe("table repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates and caches the Table service client from the shared storage connection string", async () => {
    const { getTableServiceClient, fromServiceConnectionString, mockTableServiceClient } =
      await importTableModule("UseDevelopmentStorage=true");

    const client1 = getTableServiceClient();
    const client2 = getTableServiceClient();

    expect(client1).toBe(mockTableServiceClient);
    expect(client2).toBe(mockTableServiceClient);
    expect(fromServiceConnectionString).toHaveBeenCalledOnce();
    expect(fromServiceConnectionString).toHaveBeenCalledWith("UseDevelopmentStorage=true");
  });

  it("returns a named Table client", async () => {
    const { getTableClient, fromTableConnectionString, mockTableClient } =
      await importTableModule("UseDevelopmentStorage=true");

    const client = getTableClient("users");

    expect(client).toBe(mockTableClient);
    expect(fromTableConnectionString).toHaveBeenCalledWith("UseDevelopmentStorage=true", "users");
  });

  it("throws when the storage connection string is missing", async () => {
    const { getTableServiceClient } = await importTableModule();

    expect(() => getTableServiceClient()).toThrowError("Table Storage not configured");
  });

  it("throws when the table name is empty", async () => {
    const { getTableClient } = await importTableModule("UseDevelopmentStorage=true");

    expect(() => getTableClient("")).toThrowError("Table name is required");
  });
});
