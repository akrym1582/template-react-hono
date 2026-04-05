import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../env.js";

export interface MsalIdentity {
  oid: string;
  tenantId: string;
  email?: string;
  displayName?: string;
}

export async function verifyMsalIdToken(token: string): Promise<MsalIdentity> {
  const tenantId = env.AZURE_TENANT_ID;
  const clientId = env.AZURE_CLIENT_ID;

  if (!tenantId || !clientId) {
    throw new Error("MSAL authentication is not configured");
  }

  const jwksUrl = new URL(
    `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
  );
  const JWKS = createRemoteJWKSet(jwksUrl);

  const { payload } = await jwtVerify(token, JWKS, {
    audience: clientId,
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  });

  const oid = typeof payload.oid === "string" ? payload.oid : undefined;
  const tid = typeof payload.tid === "string" ? payload.tid : tenantId;

  if (!oid || !tid) {
    throw new Error("MSAL token is missing required claims");
  }

  return {
    oid,
    tenantId: tid,
    email:
      typeof payload.email === "string"
        ? payload.email
        : typeof payload.preferred_username === "string"
          ? payload.preferred_username
          : undefined,
    displayName: typeof payload.name === "string" ? payload.name : undefined,
  };
}
