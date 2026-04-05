// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../../../../webapp/client/hooks/use-auth.js";
import {
  exchangeMsalIdToken,
  fetchCurrentSession,
  loginWithPasswordRequest,
  logoutSession,
} from "../../../../webapp/client/lib/auth.js";

const { loginPopup } = vi.hoisted(() => ({
  loginPopup: vi.fn(),
}));

vi.mock("@azure/msal-react", () => ({
  useMsal: vi.fn().mockReturnValue({
    instance: {
      loginPopup,
    },
  }),
}));

vi.mock("../../../../webapp/client/lib/auth.js", () => ({
  loginRequest: { scopes: ["openid"] },
  fetchCurrentSession: vi.fn(),
  loginWithPasswordRequest: vi.fn(),
  exchangeMsalIdToken: vi.fn(),
  logoutSession: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchCurrentSession).mockResolvedValue({ authenticated: false });
});

describe("useAuth", () => {
  it("loads the current cookie session on mount", async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchCurrentSession).toHaveBeenCalledOnce();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("logs in with a local account and updates session state", async () => {
    vi.mocked(loginWithPasswordRequest).mockResolvedValue({
      ok: true,
      user: {
        userId: "local-user",
        displayName: "Local User",
        email: "local@example.com",
        roles: ["viewer"],
        loginProvider: "local",
      },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.loginWithPassword({ userId: "local-user", password: "secret" });
    });

    expect(loginWithPasswordRequest).toHaveBeenCalledWith({
      userId: "local-user",
      password: "secret",
    });
    expect(result.current.user?.userId).toBe("local-user");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("bridges MSAL sign-in into the server cookie session", async () => {
    loginPopup.mockResolvedValue({ idToken: "entra-id-token" });
    vi.mocked(exchangeMsalIdToken).mockResolvedValue({
      ok: true,
      user: {
        userId: "msal-user",
        displayName: "MSAL User",
        email: "msal@example.com",
        roles: ["manager"],
        loginProvider: "msal",
      },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.loginWithMsal();
    });

    expect(loginPopup).toHaveBeenCalledOnce();
    expect(exchangeMsalIdToken).toHaveBeenCalledWith("entra-id-token");
    expect(result.current.user?.userId).toBe("msal-user");
  });

  it("clears the local session on logout", async () => {
    vi.mocked(fetchCurrentSession).mockResolvedValue({
      authenticated: true,
      user: {
        userId: "cookie-user",
        displayName: "Cookie User",
        email: "cookie@example.com",
        roles: ["viewer"],
        loginProvider: "local",
      },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutSession).toHaveBeenCalledOnce();
    expect(result.current.user).toBeNull();
  });
});
