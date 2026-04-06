import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthResponse, CurrentSessionResponse } from "../../shared/types/index.js";
import { localLoginSchema, msalLoginSchema } from "../../shared/validators/index.js";
import { clearSessionCookie, setSessionCookie } from "../lib/auth/session.js";
import {
  getRequestAuthUser,
  type SessionAuthVariables,
} from "../middleware/session-auth.js";
import { serverContainer } from "../container.js";
import { AuthService } from "../services/auth.service.js";

const authService = serverContainer.get(AuthService);

/**
 * 認証 API 群です。
 * local / MSAL の入口は分かれていても、成功後は同じ Cookie セッションへそろえます。
 */
export const authRoute = new Hono<SessionAuthVariables>()
  .post("/login", zValidator("json", localLoginSchema), async (c) => {
    const body = c.req.valid("json");
    const result = await authService.loginWithPassword(body);
    setSessionCookie(c, result.token);
    return c.json<AuthResponse>({ ok: true, user: result.user });
  })
  .post("/msal/login", zValidator("json", msalLoginSchema), async (c) => {
    const body = c.req.valid("json");
    const result = await authService.loginWithMsal(body);
    setSessionCookie(c, result.token);
    return c.json<AuthResponse>({ ok: true, user: result.user });
  })
  .post("/logout", (c) => {
    clearSessionCookie(c);
    return c.json({ ok: true });
  })
  .get("/me", async (c) => {
    const authUser = await getRequestAuthUser(c);
    if (!authUser) {
      return c.json<CurrentSessionResponse>({ authenticated: false });
    }

    return c.json<CurrentSessionResponse>({
      authenticated: true,
      user: AuthService.toPublicUser(authUser),
    });
  });
