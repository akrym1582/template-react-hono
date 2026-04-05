import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../../../webapp/server/lib/env.js", () => ({
  env: {
    NODE_ENV: "test",
    PORT: "3000",
    AZURE_TENANT_ID: "test-tenant",
    AZURE_CLIENT_ID: "test-client",
  },
}));

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn().mockReturnValue({}),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { oid: "user-123", preferred_username: "test@example.com" },
  }),
}));

vi.mock("../../../../webapp/server/services/user.service.js", () => ({
  UserService: vi.fn().mockImplementation(() => ({
    getAll: vi.fn().mockResolvedValue([
      { id: "1", name: "Test User", email: "test@example.com", type: "user", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
    ]),
    getById: vi.fn().mockResolvedValue(
      { id: "1", name: "Test User", email: "test@example.com", type: "user", createdAt: "2024-01-01", updatedAt: "2024-01-01" }
    ),
    create: vi.fn().mockResolvedValue(
      { id: "2", name: "New User", email: "new@example.com", type: "user", createdAt: "2024-01-01", updatedAt: "2024-01-01" }
    ),
    update: vi.fn().mockResolvedValue(
      { id: "1", name: "Updated User", email: "test@example.com", type: "user", createdAt: "2024-01-01", updatedAt: "2024-01-01" }
    ),
    delete: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { app } from "../../../../webapp/server/app.js";

beforeEach(() => {
  vi.clearAllMocks();
});

const authHeader = { Authorization: "Bearer valid-token" };

describe("Users Route", () => {
  it("GET /api/users returns list of users", async () => {
    const res = await app.request("/api/users", { headers: authHeader });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it("POST /api/users creates a user", async () => {
    const res = await app.request("/api/users", {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New User", email: "new@example.com" }),
    });
    expect(res.status).toBe(201);
  });

  it("POST /api/users returns 400 for invalid data", async () => {
    const res = await app.request("/api/users", {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", email: "not-an-email" }),
    });
    expect(res.status).toBe(400);
  });
});
