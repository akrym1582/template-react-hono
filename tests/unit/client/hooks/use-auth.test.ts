// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "../../../../webapp/client/hooks/use-auth.js";

vi.mock("@azure/msal-react", () => ({
  useMsal: vi.fn().mockReturnValue({
    instance: {
      loginRedirect: vi.fn(),
      logoutRedirect: vi.fn(),
    },
    accounts: [],
  }),
}));

vi.mock("../../../../webapp/client/lib/auth.js", () => ({
  loginRequest: { scopes: [] },
}));

describe("useAuth", () => {
  it("returns isAuthenticated false when no accounts", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
