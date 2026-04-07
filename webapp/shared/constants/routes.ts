import { API_PREFIX } from "./index.js";

export const HEALTH_ROUTE = {
  base: `${API_PREFIX}/health`,
  segment: "health",
} as const;

export const AUTH_ROUTE = {
  base: `${API_PREFIX}/auth`,
  segment: "auth",
  login: "login",
  msal: "msal",
  me: "me",
  logout: "logout",
} as const;

export const SAMPLE_ITEMS_ROUTE = {
  base: `${API_PREFIX}/sample-items`,
  segment: "sample-items",
  id: ":id",
  export: "export",
} as const;

export const USERS_ROUTE = {
  base: `${API_PREFIX}/users`,
  segment: "users",
  id: ":id",
} as const;
