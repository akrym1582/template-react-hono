import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { jwtVerify, SignJWT } from "jose";
import type {
  SessionJwtPayload,
  SessionUser,
  UserRole,
} from "../../../shared/types/index.js";
import { env } from "../env.js";

const secret = new TextEncoder().encode(env.AUTH_JWT_SECRET);
const allowedRoles: UserRole[] = ["admin", "manager", "operator", "viewer"];

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax" as const,
    path: "/",
    maxAge: env.AUTH_COOKIE_MAX_AGE,
  };
}

function parseRoles(value: unknown): UserRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (role): role is UserRole => typeof role === "string" && allowedRoles.includes(role as UserRole)
  );
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    roles: user.roles,
    loginProvider: user.loginProvider,
    sessionVersion: user.sessionVersion,
  })
    .setProtectedHeader({ alg: "HS512" })
    .setSubject(user.internalUserId)
    .setIssuedAt()
    .setIssuer(env.AUTH_JWT_ISSUER)
    .setAudience(env.AUTH_JWT_AUDIENCE)
    .setExpirationTime(`${env.AUTH_COOKIE_MAX_AGE}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionJwtPayload> {
  const { payload } = await jwtVerify(token, secret, {
    issuer: env.AUTH_JWT_ISSUER,
    audience: env.AUTH_JWT_AUDIENCE,
  });

  return {
    sub: payload.sub ?? "",
    userId: typeof payload.userId === "string" ? payload.userId : "",
    email: typeof payload.email === "string" ? payload.email : undefined,
    displayName:
      typeof payload.displayName === "string" ? payload.displayName : undefined,
    roles: parseRoles(payload.roles),
    loginProvider:
      payload.loginProvider === "local" || payload.loginProvider === "msal"
        ? payload.loginProvider
        : "local",
    sessionVersion:
      typeof payload.sessionVersion === "number" ? payload.sessionVersion : 0,
    iat: typeof payload.iat === "number" ? payload.iat : 0,
    exp: typeof payload.exp === "number" ? payload.exp : 0,
    iss: typeof payload.iss === "string" ? payload.iss : "",
    aud:
      typeof payload.aud === "string"
        ? payload.aud
        : Array.isArray(payload.aud)
          ? payload.aud[0] ?? ""
          : "",
  } as SessionJwtPayload;
}

export function getSessionToken(c: Context): string | undefined {
  return getCookie(c, env.AUTH_COOKIE_NAME);
}

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, env.AUTH_COOKIE_NAME, token, getCookieOptions());
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, env.AUTH_COOKIE_NAME, getCookieOptions());
}
