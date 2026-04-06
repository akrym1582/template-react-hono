// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_ROUTE } from "../../../../webapp/shared/constants/routes.js";

vi.mock("@azure/msal-browser", () => ({
  PublicClientApplication: vi.fn().mockImplementation(() => ({})),
}));

import {
  exchangeMsalIdToken,
  fetchCurrentSession,
  loginWithPasswordRequest,
  logoutSession,
} from "../../../../webapp/client/lib/auth.js";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

describe("auth client", () => {
  it("posts local login requests to the shared auth login route", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, user: { userId: "local-user" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await loginWithPasswordRequest({ userId: "local-user", password: "secret" });

    expect(fetchMock).toHaveBeenCalledWith(`${AUTH_ROUTE.base}/${AUTH_ROUTE.login}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: "local-user", password: "secret" }),
    });
  });

  it("posts MSAL login requests to the shared auth MSAL route", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, user: { userId: "msal-user" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await exchangeMsalIdToken("id-token");

    expect(fetchMock).toHaveBeenCalledWith(
      `${AUTH_ROUTE.base}/${AUTH_ROUTE.msal}/${AUTH_ROUTE.login}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: "id-token" }),
      }
    );
  });

  it("gets the current session from the shared auth me route", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ authenticated: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await fetchCurrentSession();

    expect(fetchMock).toHaveBeenCalledWith(`${AUTH_ROUTE.base}/${AUTH_ROUTE.me}`, {
      credentials: "include",
    });
  });

  it("posts logout requests to the shared auth logout route", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await logoutSession();

    expect(fetchMock).toHaveBeenCalledWith(`${AUTH_ROUTE.base}/${AUTH_ROUTE.logout}`, {
      method: "POST",
      credentials: "include",
    });
  });
});
