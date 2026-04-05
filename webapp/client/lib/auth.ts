import { PublicClientApplication, type Configuration } from "@azure/msal-browser";

/** MSAL の基本設定です。Azure Entra ID との接続先をここでまとめて定義します。 */
const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID ?? "",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID ?? "common"}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

/** API 用アクセストークンを要求するときのスコープ定義です。 */
export const loginRequest = {
  scopes: [`api://${import.meta.env.VITE_AZURE_CLIENT_ID ?? ""}/.default`],
};

/**
 * 既存セッションからアクセストークンを静かに取得します。
 * 取得失敗時に null を返しているので、呼び出し側は「未ログイン」として素直に扱えます。
 */
export async function acquireToken(): Promise<string | null> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;
  try {
    const result = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return result.accessToken;
  } catch {
    return null;
  }
}
