# template-react-hono

Azure App Service へ載せやすい **React + Hono のフルスタックテンプレート**です。  
「画面」「API」「認証」「Azure 連携」の最小構成をそろえつつ、今後の機能追加ポイントが追いやすい形に整理しています。

## このテンプレートでできること

- React 19 + Vite で SPA を構築する
- Hono で `/api/*` のバックエンド API を同居させる
- MSAL を使って Azure Entra ID ログインを行う
- ローカル / MSAL ログイン後に HttpOnly Cookie セッションを発行する
- Cosmos DB / Blob Storage / Table Storage / Queue Storage を使う前提の構成を用意する
- Azure Table Storage の user 管理、Cosmos DB の SampleList / SampleDetail サンプルを使う
- Zod で API 入力値を検証する
- Vitest / Testing Library でユニットテストを行う

## 全体アーキテクチャ

```text
Azure App Service (:3000)
├── /api/*  → Hono Routes → Services → Repositories → Cosmos DB / Azure Storage
├── /*      → React SPA
└── Auth    → Local / MSAL Login → Session JWT Cookie → Cookie 認証 (backend)
```

### レイヤーごとの役割

| レイヤー | 主な責務 | まず見るファイル |
| --- | --- | --- |
| client/routes | 画面表示・画面遷移 | `webapp/client/App.tsx` |
| client/hooks | 画面から使う状態管理・API 呼び出し | `webapp/client/hooks/use-users.ts` |
| server/routes | HTTP 入出力、認証、バリデーション | `webapp/server/routes/users.ts` |
| server/services | 業務処理のまとまり | `webapp/server/services/user.service.ts` |
| server/repositories | DB / Storage とのやり取り | `webapp/server/repositories/user.repository.ts` |
| shared | フロント・バック共通の型とスキーマ | `webapp/shared/validators/index.ts` |

## 技術スタック

| 役割 | 技術 |
| --- | --- |
| フロントエンド | React 19, Vite, React Router |
| バックエンド | Hono, `@hono/node-server`, `@hono/zod-validator` |
| データ取得 | SWR |
| 認証 | `argon2`, `@azure/msal-browser`, `@azure/msal-react`, `jose` |
| バリデーション | Zod |
| Azure SDK | Cosmos DB, Blob Storage, Table Storage, Queue Storage |
| テスト | Vitest, Testing Library |
| IaC | Bicep |
| CI | GitHub Actions |

## セットアップ

```bash
cd webapp
cp .env.example .env
npm install --legacy-peer-deps
```

`.env` では最低でも以下を用途に応じて設定してください。

| 変数名 | 用途 |
| --- | --- |
| `PORT` | ローカル起動ポート |
| `AZURE_TENANT_ID` | Azure Entra ID テナント ID |
| `AZURE_CLIENT_ID` | MSAL / サーバー検証で使うアプリケーション ID |
| `AUTH_JWT_*` | アプリ独自のセッション JWT 発行設定 |
| `AUTH_COOKIE_*` | セッション Cookie 名・有効期限 |
| `COSMOS_*` | Cosmos DB 接続設定（`COSMOS_CONTAINER` は `SampleItems` を想定） |
| `STORAGE_CONNECTION_STRING` | Blob / Table / Queue Storage で共通利用する接続文字列 |
| `USER_TABLE_NAME` | Azure Table Storage の user テーブル名 |

## 開発コマンド

すべて `webapp/` ディレクトリで実行します。

```bash
npm run dev        # 開発サーバー起動（Hono API + Vite HMR）
npm run lint       # ESLint
npm run typecheck  # TypeScript 型検査
npm run build      # クライアント/サーバーをまとめてビルド
npm test           # Vitest 実行
npm start          # ビルド済みアプリを起動
```

## ディレクトリ構成

```text
webapp/
├── client/
│   ├── App.tsx                 # 画面ルーティング定義
│   ├── main.tsx                # React の最上位エントリポイント
│   ├── routes/                 # ページコンポーネント
│   ├── hooks/                  # 画面用のカスタムフック
│   ├── lib/                    # API クライアント / MSAL 設定
│   └── providers/              # React Provider 群
├── server/
│   ├── app.ts                  # Hono アプリ本体
│   ├── index.ts                # 本番起動エントリ
│   ├── dev.ts                  # 開発起動エントリ
│   ├── routes/                 # API ルート群
│   ├── middleware/             # 認証・エラーハンドリング
│   ├── services/               # 業務処理
│   ├── repositories/           # DB / Storage アクセス
│   └── lib/                    # 環境変数・ロガー
└── shared/
    ├── types/                  # 共通 TypeScript 型
    └── validators/             # 共通 Zod スキーマ

tests/
└── unit/                       # client / server / shared のユニットテスト
```

## 機能追加の拡張ポイント

### 1. 新しい API を追加したい

1. `webapp/shared/validators/index.ts` に入力スキーマを追加する  
2. `webapp/server/services/` に業務処理を追加する  
3. `webapp/server/repositories/` にデータアクセスを追加する  
4. `webapp/server/routes/` に新しい route ファイルを作る  
5. `webapp/server/routes/index.ts` で `route("/api/xxx", ...)` を追加する  
6. `webapp/client/lib/api-client.ts` 経由で型付き API 呼び出しを使う  
7. `webapp/client/hooks/` に画面用フックを追加する  

### 2. 新しい画面を追加したい

1. `webapp/client/routes/` にページコンポーネントを作る  
2. `webapp/client/App.tsx` に `<Route>` を追加する  
3. 必要に応じて `webapp/client/hooks/` に画面専用フックを作る  

### 3. 認証付き API を増やしたい

- `webapp/server/middleware/session-auth.ts` を route に付与する
- 認証後のユーザー情報は `c.get("authUser")` / `c.get("roles")` で参照する
- フロント側は `webapp/client/lib/api-client.ts` が Cookie を自動送信する

### 4. 環境変数を増やしたい

- `webapp/server/lib/env.ts` にスキーマを追加する
- 起動時に Zod で検証されるため、設定漏れを早期発見できる

## テンプレートとして読むときのおすすめ順

初学者の方は次の順で読むと流れを追いやすいです。

1. `webapp/client/main.tsx` — アプリ全体の起動方法
2. `webapp/client/App.tsx` — どの画面があるか
3. `webapp/client/hooks/use-users.ts` — 画面から API を呼ぶ方法
4. `webapp/client/routes/sample-list.tsx` — 検索 + 無限ロード + CSV 出力の例
5. `webapp/client/routes/sample-detail.tsx` — 追加 / 編集 / 削除画面の例
6. `webapp/server/repositories/user.repository.ts` — Azure Table Storage に user を保存する実装

## テスト方針

- `tests/unit/client/` : React コンポーネント・フック
- `tests/unit/server/` : ルート・ミドルウェア・サービス
- `tests/unit/shared/` : Zod スキーマや共通ロジック

今回のテンプレートは、**ルート → サービス → リポジトリ** の責務分離を学びやすいことを重視しています。  
新しい機能を追加するときも、この分離を保つと長期的に保守しやすくなります。
