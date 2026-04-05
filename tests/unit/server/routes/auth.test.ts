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

const { getRequestAuthUser } = vi.hoisted(() => ({
  getRequestAuthUser: vi.fn(),
}));

vi.mock("../../../../webapp/server/middleware/session-auth.js", async () => {
  const { createMiddleware } = await import("hono/factory");
  return {
    sessionAuthMiddleware: createMiddleware(async (_c, next) => {
      await next();
    }),
    getRequestAuthUser,
  };
});

vi.mock("../../../../webapp/server/services/auth.service.js", () => {
  const AuthService = vi.fn().mockImplementation(() => ({
    loginWithPassword: vi.fn().mockResolvedValue({
      token: "local-session-token",
      user: {
        userId: "local-user",
        email: "local@example.com",
        displayName: "Local User",
        roles: ["viewer"],
        loginProvider: "local",
      },
    }),
    loginWithMsal: vi.fn().mockResolvedValue({
      token: "msal-session-token",
      user: {
        userId: "msal-user",
        email: "msal@example.com",
        displayName: "MSAL User",
        roles: ["manager"],
        loginProvider: "msal",
      },
    }),
  }));

  Object.assign(AuthService, {
    toPublicUser: (user: {
      userId: string;
      email?: string;
      displayName?: string;
      roles: string[];
      loginProvider: "local" | "msal";
    }) => ({
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      loginProvider: user.loginProvider,
    }),
  });

  return {
    AuthService,
    isAuthError: vi.fn().mockReturnValue(false),
  };
});

import { app } from "../../../../webapp/server/app.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Auth Route", () => {
  it("POST /api/auth/login issues a session cookie", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "local-user", password: "secret" }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("app_session=local-session-token");
    await expect(res.json()).resolves.toEqual({
      ok: true,
      user: {
        userId: "local-user",
        email: "local@example.com",
        displayName: "Local User",
        roles: ["viewer"],
        loginProvider: "local",
      },
    });
  });

  it("POST /api/auth/msal/login issues a session cookie", async () => {
    const res = await app.request("/api/auth/msal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "entra-id-token" }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("app_session=msal-session-token");
    await expect(res.json()).resolves.toEqual({
      ok: true,
      user: {
        userId: "msal-user",
        email: "msal@example.com",
        displayName: "MSAL User",
        roles: ["manager"],
        loginProvider: "msal",
      },
    });
  });

  it("POST /api/auth/logout clears the session cookie", async () => {
    const res = await app.request("/api/auth/logout", {
      method: "POST",
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("app_session=");
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("GET /api/auth/me returns the current session user", async () => {
    getRequestAuthUser.mockResolvedValue({
      internalUserId: "internal-user-1",
      userId: "cookie-user",
      email: "cookie@example.com",
      displayName: "Cookie User",
      roles: ["admin"],
      loginProvider: "local",
      sessionVersion: 1,
    });

    const res = await app.request("/api/auth/me");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      authenticated: true,
      user: {
        userId: "cookie-user",
        email: "cookie@example.com",
        displayName: "Cookie User",
        roles: ["admin"],
        loginProvider: "local",
      },
    });
  });
});
