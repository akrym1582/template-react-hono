import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import type { SessionUser, UserRole } from "../../shared/types/index.js";
import { getSessionToken, verifySessionToken } from "../lib/auth/session.js";
import { UserRepository } from "../repositories/user.repository.js";

export type SessionAuthVariables = {
  Variables: {
    authUser: SessionUser;
    userId: string;
    roles: UserRole[];
  };
};

const userRepository = new UserRepository();

async function resolveAuthUser(c: Context): Promise<SessionUser | null> {
  const token = getSessionToken(c);
  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    const user = await userRepository.findById(payload.sub);
    const sessionVersion = payload.sessionVersion ?? 0;

    if (!user || !user.isActive) {
      return null;
    }

    if ((user.sessionVersion ?? 0) !== sessionVersion) {
      return null;
    }

    return {
      internalUserId: user.id,
      userId: payload.userId,
      email: payload.email,
      displayName: payload.displayName,
      roles: payload.roles,
      loginProvider: payload.loginProvider,
      sessionVersion,
    };
  } catch {
    return null;
  }
}

export async function getRequestAuthUser(c: Context): Promise<SessionUser | null> {
  return resolveAuthUser(c);
}

export const sessionAuthMiddleware = createMiddleware<SessionAuthVariables>(
  async (c, next) => {
    const authUser = await resolveAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("authUser", authUser);
    c.set("userId", authUser.userId);
    c.set("roles", authUser.roles);

    await next();
  }
);
