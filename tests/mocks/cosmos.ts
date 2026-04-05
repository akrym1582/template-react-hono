import { vi } from "vitest";

export const mockContainer = {
  items: {
    query: vi.fn().mockReturnValue({
      fetchAll: vi.fn().mockResolvedValue({ resources: [] }),
    }),
    create: vi.fn().mockResolvedValue({ resource: null }),
  },
  item: vi.fn().mockReturnValue({
    read: vi.fn().mockResolvedValue({ resource: null }),
    replace: vi.fn().mockResolvedValue({ resource: null }),
    delete: vi.fn().mockResolvedValue({}),
  }),
};

export const mockCosmosClient = {
  database: vi.fn().mockReturnValue({
    container: vi.fn().mockReturnValue(mockContainer),
  }),
};

vi.mock("@azure/cosmos", () => ({
  CosmosClient: vi.fn().mockImplementation(() => mockCosmosClient),
}));
