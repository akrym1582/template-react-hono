import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../lib/auth.js";

export function useAuth() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = accounts.length > 0;
  const user = accounts[0] ?? null;

  const login = async () => {
    await instance.loginRedirect(loginRequest);
  };

  const logout = async () => {
    await instance.logoutRedirect();
  };

  return { isAuthenticated, user, login, logout };
}
