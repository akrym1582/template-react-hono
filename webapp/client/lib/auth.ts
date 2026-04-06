import { PublicClientApplication, type Configuration } from "@azure/msal-browser";
import type {
  AuthResponse,
  CurrentSessionResponse,
} from "../../shared/types/index.js";
import type { LocalLoginInput } from "../../shared/validators/index.js";
import { parseApiResponse } from "./api-response.js";

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

/** サインイン時は本人属性が取りやすい ID token 用スコープに寄せます。 */
export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

export async function loginWithPasswordRequest(input: LocalLoginInput): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parseApiResponse<AuthResponse>(response, "Authentication request failed");
}

export async function exchangeMsalIdToken(idToken: string): Promise<AuthResponse> {
  const response = await fetch("/api/auth/msal/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  return parseApiResponse<AuthResponse>(response, "Authentication request failed");
}

export async function fetchCurrentSession(): Promise<CurrentSessionResponse> {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });

  return parseApiResponse<CurrentSessionResponse>(response, "Authentication request failed");
}

export async function logoutSession(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  await parseApiResponse<{ ok: true }>(response, "Authentication request failed");
}
