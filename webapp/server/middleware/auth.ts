import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../lib/env.js";

type AuthVariables = {
  userId: string;
  userEmail: string;
};

/**
 * Bearer トークンを検証し、後続処理で使えるユーザー情報を context に保存します。
 * 「認証が必要な API」を増やすときは、この middleware を付けるだけで共通の検証処理を再利用できます。
 */
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authorization = c.req.header("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authorization.slice(7);
    const tenantId = env.AZURE_TENANT_ID;
    const clientId = env.AZURE_CLIENT_ID;

    if (!tenantId || !clientId) {
      return c.json({ error: "Auth not configured" }, 500);
    }

    try {
      /** Azure Entra ID の公開鍵を取得し、その鍵で JWT を検証します。 */
      const jwksUrl = new URL(
        `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
      );
      const JWKS = createRemoteJWKSet(jwksUrl);

      const { payload } = await jwtVerify(token, JWKS, {
        audience: clientId,
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      });

      /** 後続の route / service で利用しやすいよう、必要最小限の値だけ context に保存します。 */
      c.set("userId", (payload.oid as string) ?? "");
      c.set("userEmail", (payload.preferred_username as string) ?? "");

      await next();
    } catch {
      return c.json({ error: "Unauthorized" }, 401);
    }
  }
);
