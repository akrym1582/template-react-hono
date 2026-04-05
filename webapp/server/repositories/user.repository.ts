import type { User } from "../../shared/types/index.js";
import { getContainer } from "./cosmos.js";

export class UserRepository {
  /** Cosmos DB から type=user のデータだけを取得します。 */
  async findAll(): Promise<User[]> {
    const container = getContainer();
    const { resources } = await container.items
      .query<User>("SELECT * FROM c WHERE c.type = 'user'")
      .fetchAll();
    return resources;
  }

  /** パーティションキー兼 ID を使って 1 件取得します。 */
  async findById(id: string): Promise<User | null> {
    const container = getContainer();
    const { resource } = await container.item(id, id).read<User>();
    return resource ?? null;
  }

  async findByUserId(userId: string): Promise<User | null> {
    const container = getContainer();
    const { resources } = await container.items
      .query<User>({
        query: "SELECT * FROM c WHERE c.type = 'user' AND c.userId = @userId",
        parameters: [{ name: "@userId", value: userId }],
      })
      .fetchAll();
    return resources[0] ?? null;
  }

  async findByMsalIdentity(tenantId: string, oid: string, email?: string): Promise<User | null> {
    const container = getContainer();

    if (!email) {
      const { resources } = await container.items
        .query<User>({
          query: `SELECT * FROM c
                  WHERE c.type = 'user'
                    AND c.msalTenantId = @tenantId
                    AND c.msalOid = @oid`,
          parameters: [
            { name: "@tenantId", value: tenantId },
            { name: "@oid", value: oid },
          ],
        })
        .fetchAll();
      return resources[0] ?? null;
    }

    const { resources } = await container.items
      .query<User>({
        query: `SELECT * FROM c
                WHERE c.type = 'user'
                  AND (
                    (c.msalTenantId = @tenantId AND c.msalOid = @oid)
                    OR (IS_DEFINED(c.msalEmail) AND LOWER(c.msalEmail) = @email)
                  )`,
        parameters: [
          { name: "@tenantId", value: tenantId },
          { name: "@oid", value: oid },
          { name: "@email", value: email.toLowerCase() },
        ],
      })
      .fetchAll();
    return resources[0] ?? null;
  }

  /**
   * 新規ユーザーを作成します。
   * ID や作成日時は呼び出し元に任せず repository 側で付与すると、保存ルールを一元化できます。
   */
  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const container = getContainer();
    const now = new Date().toISOString();
    const user: User = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const { resource } = await container.items.create<User>(user);
    return resource!;
  }

  /**
   * 既存データを読み直してから上書きします。
   * 将来「更新者」や「更新履歴」を持たせる場合も、このメソッドでまとめて扱えます。
   */
  async update(id: string, data: Partial<User>): Promise<User | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const container = getContainer();
    const updated: User = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    const { resource } = await container.item(id, id).replace<User>(updated);
    return resource ?? null;
  }

  /** 物理削除です。論理削除へ変更するときはここだけ差し替えれば済みます。 */
  async delete(id: string): Promise<void> {
    const container = getContainer();
    await container.item(id, id).delete();
  }
}
