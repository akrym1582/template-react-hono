import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../webapp/server/lib/env.js", () => ({
  env: {
    NODE_ENV: "test",
    PORT: "3000",
    AZURE_TENANT_ID: "test-tenant",
    AZURE_CLIENT_ID: "test-client",
    AUTH_JWT_SECRET: "test-secret",
    AUTH_JWT_ISSUER: "test-issuer",
    AUTH_JWT_AUDIENCE: "test-audience",
    AUTH_COOKIE_NAME: "app_session",
    AUTH_COOKIE_MAX_AGE: 3600,
    USER_TABLE_NAME: "Users",
  },
}));

vi.mock("../../../../webapp/server/middleware/session-auth.js", async () => {
  const { createMiddleware } = await import("hono/factory");
  return {
    sessionAuthMiddleware: createMiddleware(async (c, next) => {
      c.set("authUser", {
        internalUserId: "internal-user-1",
        userId: "template-user",
        email: "test@example.com",
        displayName: "Template User",
        roles: ["viewer"],
        loginProvider: "local",
        sessionVersion: 0,
      });
      c.set("userId", "template-user");
      c.set("roles", ["viewer"]);
      await next();
    }),
    getRequestAuthUser: vi.fn().mockResolvedValue(null),
  };
});

const sampleItemServiceMock = vi.hoisted(() => ({
  search: vi.fn().mockResolvedValue({
    items: [
      {
        id: "sample-1",
        type: "sampleItem",
        code: "ITEM-001",
        name: "Sample Item",
        category: "General",
        description: "Example",
        quantity: 10,
        price: 1200,
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ],
    nextCursor: null,
  }),
  streamSearch: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../../../webapp/server/services/sample-item.service.js", () => ({
  SampleItemService: vi.fn().mockImplementation(() => sampleItemServiceMock),
}));

import { app } from "../../../../webapp/server/app.js";

beforeEach(() => {
  vi.clearAllMocks();
  sampleItemServiceMock.streamSearch.mockImplementation(async function* () {
    yield {
      id: "sample-1",
      type: "sampleItem",
      code: "ITEM-001",
      name: "Sample Item",
      category: "General",
      description: "Example",
      quantity: 10,
      price: 1200,
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
  });
});

describe("Sample Items Route", () => {
  it("GET /api/sample-items returns a paged search result", async () => {
    const res = await app.request("/api/sample-items?keyword=item");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: "sample-1",
          code: "ITEM-001",
        }),
      ],
      nextCursor: null,
    });
  });

  it("GET /api/sample-items/export streams csv with a clearloading cookie", async () => {
    const res = await app.request("/api/sample-items/export");

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toContain("sample-items.csv");
    expect(res.headers.get("set-cookie")).toContain("clearloading=1");

    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
    const body = new TextDecoder("utf-8").decode(bytes);
    expect(body).toContain("Code,Name,Category,Description,Quantity,Price,Active");
    expect(body).toContain("ITEM-001,Sample Item,General,Example,10,1200,Yes");
  });
});
