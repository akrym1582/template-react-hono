import type { User } from "../../shared/types/index.js";
import type { CreateUserInput, UpdateUserInput } from "../../shared/validators/index.js";
import { UserRepository } from "../repositories/user.repository.js";

export class UserService {
  private readonly repo: UserRepository;

  /**
   * Service は「画面や API から見た業務処理のまとまり」です。
   * 引数で repository を受け取れるようにしておくと、テスト時に差し替えやすくなります。
   * 今後ルールが増えたら、route ではなくこの層に集めると責務が分かりやすく保てます。
   */
  constructor(repo?: UserRepository) {
    this.repo = repo ?? new UserRepository();
  }

  /** 一覧取得の業務処理です。必要になれば並び順や検索条件をここで追加します。 */
  async getAll(): Promise<User[]> {
    return this.repo.findAll();
  }

  /** ID 指定の取得処理です。見つからないときは null を返して呼び出し側に判断を委ねます。 */
  async getById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  /** 作成時に template 用の共通属性 `type` を補ってから永続化します。 */
  async create(data: CreateUserInput): Promise<User> {
    return this.repo.create({ ...data, type: "user" });
  }

  /** 更新処理です。事前チェックや監査ログが必要になったらここに追加していきます。 */
  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    return this.repo.update(id, data);
  }

  /** 削除処理です。論理削除に切り替えたい場合もこのメソッドが拡張ポイントになります。 */
  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
