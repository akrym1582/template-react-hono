import { z } from "zod";

const developmentJwtSecret = "development-session-secret";

/**
 * サーバー起動時に環境変数をまとめて検証します。
 * 新しい外部サービスを追加するときは、まずここへ変数を足しておくと
 * 「設定漏れ」を起動直後に検知できるようになります。
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  AZURE_TENANT_ID: z.string().optional(),
  AZURE_CLIENT_ID: z.string().optional(),
  AZURE_CLIENT_SECRET: z.string().optional(),
  AUTH_JWT_SECRET: z.string().min(1).default(developmentJwtSecret),
  AUTH_JWT_ISSUER: z.string().min(1).default("template-react-hono"),
  AUTH_JWT_AUDIENCE: z.string().min(1).default("template-react-hono"),
  AUTH_COOKIE_NAME: z.string().min(1).default("app_session"),
  AUTH_COOKIE_MAX_AGE: z.coerce.number().int().positive().default(60 * 60 * 8),
  COSMOS_ENDPOINT: z.string().optional(),
  COSMOS_KEY: z.string().optional(),
  COSMOS_DATABASE: z.string().optional(),
  COSMOS_CONTAINER: z.string().optional(),
  STORAGE_CONNECTION_STRING: z.string().optional(),
});

/** import された時点で検証するため、不正な設定のまま処理が進むのを防げます。 */
const parsedEnv = envSchema.parse(process.env);

if (
  parsedEnv.NODE_ENV === "production" &&
  parsedEnv.AUTH_JWT_SECRET === developmentJwtSecret
) {
  throw new Error("AUTH_JWT_SECRET must be explicitly configured in production");
}

export const env = parsedEnv;
export type Env = z.infer<typeof envSchema>;
