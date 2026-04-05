import { Hono } from "hono";

/**
 * 稼働確認用の最小 API です。
 * 監視ツールやデプロイ直後の疎通確認から呼ばれることを想定しています。
 * 将来ヘルスチェック項目を増やす場合も、この route を起点に段階的に拡張できます。
 */
export const healthRoute = new Hono().get("/", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});
