import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";

type AuthVariables = {
  Variables: {
    userId: string;
    userEmail: string;
  };
};

/**
 * 認証済みユーザーの情報を返すサンプル API です。
 * フロントエンド側で「今ログイン中のユーザーを表示したい」ときの土台になります。
 * 認証後に返したいプロフィール情報が増えたら、まずはここを拡張すると全体像を保ちやすいです。
 */
export const authRoute = new Hono<AuthVariables>().get("/me", authMiddleware, (c) => {
  return c.json({
    userId: c.get("userId"),
    userEmail: c.get("userEmail"),
  });
});
