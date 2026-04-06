export type UserRole = "admin" | "manager" | "operator" | "viewer";
export type LoginProvider = "local" | "msal";

export interface User {
  id: string;
  type: "user";
  name: string;
  email: string;
  userId: string;
  displayName?: string;
  passwordHash?: string;
  hasLocalPassword: boolean;
  msalOid?: string;
  msalTenantId?: string;
  msalEmail?: string;
  roles: UserRole[];
  isActive: boolean;
  sessionVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface SampleItem {
  id: string;
  type: "sampleItem";
  code: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface SessionUser {
  internalUserId: string;
  userId: string;
  email?: string;
  displayName?: string;
  roles: UserRole[];
  loginProvider: LoginProvider;
  sessionVersion: number;
}

export interface SessionJwtPayload {
  sub: string;
  userId: string;
  email?: string;
  displayName?: string;
  roles: UserRole[];
  loginProvider: LoginProvider;
  sessionVersion: number;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface AuthResponse {
  ok: true;
  user: {
    userId: string;
    email?: string;
    displayName?: string;
    roles: UserRole[];
    loginProvider: LoginProvider;
  };
}

export interface CurrentSessionResponse {
  authenticated: boolean;
  user?: AuthResponse["user"];
}
