# AI エージェント向け開発ガイド

このリポジトリは **React + Hono + Azure** のテンプレートです。  
AI エージェントは「最小変更で安全に拡張できること」を最優先にしてください。

## 目的

- テンプレート利用者が読みやすい構成を保つ
- 初学者でも責務分離を追えるコードを維持する
- 新機能追加時に拡張ポイントが分かりやすい状態を守る

## コード構成の考え方

### バックエンド

- `webapp/server/routes/`
  - HTTP 入出力を担当します
  - 認証、バリデーション、レスポンス整形をここで行います
- `webapp/server/services/`
  - 業務処理を担当します
  - route に複雑な条件分岐を書きすぎないでください
- `webapp/server/repositories/`
  - Cosmos DB や Storage とのやり取りを担当します
  - 永続化の都合は service や route に漏らさないでください

### フロントエンド

- `webapp/client/routes/`
  - 画面コンポーネントを置きます
- `webapp/client/hooks/`
  - 画面から使う状態管理や API 呼び出しを置きます
- `webapp/client/lib/`
  - API クライアントや認証など、横断的な処理を置きます
- `webapp/client/providers/`
  - アプリ全体に配る context / 設定を置きます

### 共通コード

- `webapp/shared/validators/`
  - API 入力値やフォーム入力値の Zod スキーマを置きます
- `webapp/shared/types/`
  - フロントとバックで共有する型を置きます

## 機能追加時の原則

1. **route に業務処理を書き込みすぎない**
   - route は「受け取る」「検証する」「service を呼ぶ」に留めます
2. **service で処理をまとめる**
   - 再利用したい業務ルールは service に集約します
3. **repository は保存処理に専念させる**
   - SQL や SDK 呼び出しの詳細を上位レイヤーへ漏らさないでください
4. **shared の Zod スキーマを優先する**
   - 同じ入力ルールをフロントとバックで二重管理しないでください
5. **初学者向けの日本語コメントを維持する**
   - 主要メソッド、拡張ポイント、責務の境界を短く明確に説明してください

## 変更時の具体ルール

- 既存の設計を崩さず、**最小差分**で対応してください
- 新しい API を追加する場合は、必要に応じて次をそろえてください
  - `shared/validators`
  - `server/services`
  - `server/repositories`
  - `server/routes`
  - `client/hooks`
- 新しい画面を追加する場合は
  - `client/routes` にコンポーネントを追加
  - `client/App.tsx` にルートを追加
- 新しい環境変数を使う場合は
  - `webapp/server/lib/env.ts` の Zod スキーマへ追加

## このリポジトリ特有の注意点

- Hono RPC の型推論を壊さないため、route 定義は **`new Hono().get(...).post(...)` のようなチェーン形式**を維持してください
- サーバーテストでは `webapp/server/lib/env.js` を import 前に mock する必要があります
  - `env.ts` は import 時に環境変数を評価するためです
- テスト設定は `tests/vitest.config.ts` にあります

## 推奨コマンド

作業ディレクトリは `webapp/` です。

```bash
npm install --legacy-peer-deps
npm run lint
npm run typecheck
npm run build
npm test
```

## ドキュメント更新ルール

- README は日本語で保守してください
- テンプレート利用者が「どこを拡張すればよいか」を読み取れるようにしてください
- 実装変更に合わせて README やコメントも更新してください

## 避けたい変更

- 無関係なリファクタリング
- 初学者向け説明を減らす変更
- route / service / repository の責務を混ぜる変更
- 型安全性を崩す変更
