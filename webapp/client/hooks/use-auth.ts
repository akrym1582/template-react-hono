import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../lib/auth.js";

/**
 * 認証状態を画面側で扱いやすい形に整えるカスタムフックです。
 * ボタンからは `login` / `logout` を呼ぶだけでよいように、MSAL の詳細を隠しています。
 */
export function useAuth() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = accounts.length > 0;
  const user = accounts[0] ?? null;

  /** Azure Entra ID のログイン画面へリダイレクトします。 */
  const login = async () => {
    await instance.loginRedirect(loginRequest);
  };

  /** セッションを破棄し、ログアウト後の遷移も MSAL に任せます。 */
  const logout = async () => {
    await instance.logoutRedirect();
  };

  return { isAuthenticated, user, login, logout };
}
