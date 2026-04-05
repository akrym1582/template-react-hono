import { z } from "zod";

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
  COSMOS_ENDPOINT: z.string().optional(),
  COSMOS_KEY: z.string().optional(),
  COSMOS_DATABASE: z.string().optional(),
  COSMOS_CONTAINER: z.string().optional(),
  STORAGE_CONNECTION_STRING: z.string().optional(),
});

/** import された時点で検証するため、不正な設定のまま処理が進むのを防げます。 */
export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
