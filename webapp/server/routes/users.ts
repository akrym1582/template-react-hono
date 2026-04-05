import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../middleware/auth.js";
import { UserService } from "../services/user.service.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../../shared/validators/index.js";

type AuthVariables = {
  Variables: {
    userId: string;
    userEmail: string;
  };
};

/**
 * ルート層では「HTTP の入出力」を担当します。
 * - 認証が必要か
 * - リクエストをどう検証するか
 * - どのサービスを呼ぶか
 * をここで決め、実際の業務処理は service に委譲します。
 *
 * 新しい CRUD API を追加するときは、このファイルの構成をそのまま手本にすると
 * 「認証 → バリデーション → サービス呼び出し」の流れを再利用できます。
 */
const userService = new UserService();

export const usersRoute = new Hono<AuthVariables>()
  /** 一覧取得です。画面表示用に複数件をまとめて返します。 */
  .get("/", authMiddleware, async (c) => {
    const users = await userService.getAll();
    return c.json(users);
  })
  /** ID で 1 件取得します。存在しない場合は 404 を返します。 */
  .get("/:id", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = await userService.getById(id);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(user);
  })
  /** 作成時は Zod で JSON 本文を検証し、壊れたデータを早い段階で防ぎます。 */
  .post("/", authMiddleware, zValidator("json", createUserSchema), async (c) => {
    const body = c.req.valid("json");
    const user = await userService.create(body);
    return c.json(user, 201);
  })
  /** 更新時も同じく検証を挟み、存在しない ID なら 404 を返します。 */
  .put("/:id", authMiddleware, zValidator("json", updateUserSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const user = await userService.update(id, body);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(user);
  })
  /** 削除結果は最小限の成功フラグだけ返し、クライアント側で再取得しやすくします。 */
  .delete("/:id", authMiddleware, async (c) => {
    const id = c.req.param("id");
    await userService.delete(id);
    return c.json({ success: true });
  });
