import { useCallback, useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import type { AuthResponse } from "../../shared/types/index.js";
import type { LocalLoginInput } from "../../shared/validators/index.js";
import {
  exchangeMsalIdToken,
  fetchCurrentSession,
  loginRequest,
  loginWithPasswordRequest,
  logoutSession,
} from "../lib/auth.js";

/**
 * 認証状態を画面側で扱いやすい形に整えるカスタムフックです。
 * local / MSAL の入口が違っても、画面側からは「共通セッションを更新する関数」として扱えます。
 */
export function useAuth() {
  const { instance } = useMsal();
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await fetchCurrentSession();
      setUser(session.authenticated ? session.user ?? null : null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const loginWithPassword = useCallback(async (input: LocalLoginInput) => {
    setIsLoading(true);
    try {
      const response = await loginWithPasswordRequest(input);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithMsal = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await instance.loginPopup(loginRequest);
      const response = await exchangeMsalIdToken(result.idToken);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [instance]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    refreshSession,
    loginWithPassword,
    loginWithMsal,
    logout,
  };
}
