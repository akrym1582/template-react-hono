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

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn().mockReturnValue({}),
  jwtVerify: vi.fn(),
  SignJWT: class {
    setProtectedHeader() {
      return this;
    }
    setSubject() {
      return this;
    }
    setIssuedAt() {
      return this;
    }
    setIssuer() {
      return this;
    }
    setAudience() {
      return this;
    }
    setExpirationTime() {
      return this;
    }
    sign() {
      return Promise.resolve("signed-token");
    }
  },
}));

vi.mock("../../../../webapp/server/repositories/user.repository.js", () => ({
  UserRepository: vi.fn().mockImplementation(() => ({
    findById: vi.fn().mockResolvedValue({
      id: "internal-user-1",
      type: "user",
      name: "Template User",
      email: "user@example.com",
      userId: "template-user",
      displayName: "Template User",
      hasLocalPassword: true,
      roles: ["admin"],
      isActive: true,
      sessionVersion: 2,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    }),
  })),
}));

import { app } from "../../../../webapp/server/app.js";
import { jwtVerify } from "jose";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Session auth middleware", () => {
  it("returns authenticated false when no session cookie is present", async () => {
    const res = await app.request("/api/auth/me");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ authenticated: false });
  });

  it("rejects protected routes when the session token is invalid", async () => {
    (jwtVerify as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Invalid token"));

    const res = await app.request("/api/users", {
      headers: { Cookie: "app_session=invalid-token" },
    });

    expect(res.status).toBe(401);
  });

  it("loads the authenticated session user from the cookie", async () => {
    (jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      payload: {
        sub: "internal-user-1",
        userId: "template-user",
        email: "user@example.com",
        displayName: "Template User",
        roles: ["admin"],
        loginProvider: "local",
        sessionVersion: 2,
        iss: "test-issuer",
        aud: "test-audience",
        iat: 1,
        exp: 2,
      },
    });

    const res = await app.request("/api/auth/me", {
      headers: { Cookie: "app_session=valid-token" },
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      authenticated: true,
      user: {
        userId: "template-user",
        email: "user@example.com",
        displayName: "Template User",
        roles: ["admin"],
        loginProvider: "local",
      },
    });
  });
});
