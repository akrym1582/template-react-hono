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
  jwtVerify: vi.fn(),
}));

import { app } from "../../../../webapp/server/app.js";
import { jwtVerify } from "jose";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Auth Middleware", () => {
  it("returns 401 when no Authorization header", async () => {
    const res = await app.request("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is invalid", async () => {
    (jwtVerify as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Invalid token")
    );
    const res = await app.request("/api/auth/me", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 200 when token is valid", async () => {
    (jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      payload: {
        oid: "user-123",
        preferred_username: "test@example.com",
      },
    });
    const res = await app.request("/api/auth/me", {
      headers: { Authorization: "Bearer valid-token" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user-123");
    expect(body.userEmail).toBe("test@example.com");
  });
});
