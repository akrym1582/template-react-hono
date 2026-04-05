import { describe, it, expect, beforeEach, vi } from "vitest";

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

vi.mock("../../../../webapp/server/services/user.service.js", () => ({
  UserService: vi.fn().mockImplementation(() => ({
    getAll: vi.fn().mockResolvedValue([
      {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        userId: "test@example.com",
        type: "user",
        hasLocalPassword: false,
        roles: ["viewer"],
        isActive: true,
        sessionVersion: 0,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ]),
    getById: vi.fn().mockResolvedValue({
      id: "1",
      name: "Test User",
      email: "test@example.com",
      userId: "test@example.com",
      type: "user",
      hasLocalPassword: false,
      roles: ["viewer"],
      isActive: true,
      sessionVersion: 0,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    }),
    create: vi.fn().mockResolvedValue({
      id: "2",
      name: "New User",
      email: "new@example.com",
      userId: "new@example.com",
      type: "user",
      hasLocalPassword: false,
      roles: ["viewer"],
      isActive: true,
      sessionVersion: 0,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    }),
    update: vi.fn().mockResolvedValue({
      id: "1",
      name: "Updated User",
      email: "test@example.com",
      userId: "test@example.com",
      type: "user",
      hasLocalPassword: false,
      roles: ["viewer"],
      isActive: true,
      sessionVersion: 0,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    }),
    delete: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { app } from "../../../../webapp/server/app.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Users Route", () => {
  it("GET /api/users returns list of users", async () => {
    const res = await app.request("/api/users");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it("POST /api/users creates a user", async () => {
    const res = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New User", email: "new@example.com" }),
    });
    expect(res.status).toBe(201);
  });

  it("POST /api/users returns 400 for invalid data", async () => {
    const res = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", email: "not-an-email" }),
    });
    expect(res.status).toBe(400);
  });
});
