# template-react-hono

React + Hono fullstack template for Azure App Service.

## Architecture

```
Azure App Service (:3000)
├── /api/*   → Hono Routes → Services → Repositories → Cosmos DB / Storage
├── /*       → React SPA (production: static / development: Vite HMR)
└── Auth: MSAL.js (FE) → Bearer Token → JWT validation (BE) → Entra ID
```

## Tech Stack

| Role | Technology |
|---|---|
| Server | Hono, @hono/node-server, @hono/zod-validator |
| Frontend | React 19, Vite 6, TanStack Router, TanStack Query |
| UI | Tailwind CSS v4, shadcn/ui |
| Type-safe API | Hono RPC Client (`hc<AppType>`) |
| Validation | Zod (shared FE/BE) |
| Auth | @azure/msal-browser (FE), jose (BE JWT validation) |
| Infrastructure | Azure App Service, Cosmos DB, Blob Storage |
| Testing | Vitest, @testing-library/react |
| IaC | Bicep |
| CI/CD | GitHub Actions |

## Getting Started

```bash
cd webapp
cp .env.example .env  # Fill in your Azure credentials
npm install
npm run dev           # Start dev server on :3000
```

## Scripts

```bash
npm run dev           # Development server (Hono + Vite HMR)
npm run build         # Production build (client + server)
npm start             # Start production server
npm run typecheck     # TypeScript type checking
npm run lint          # ESLint
npm test              # Vitest unit tests
```

## Project Structure

```
webapp/
├── server/           # Hono server
│   ├── app.ts        # Hono app definition
│   ├── routes/       # API routes (health, auth, users)
│   ├── middleware/   # Auth (JWT), error handling
│   ├── services/     # Business logic
│   ├── repositories/ # Cosmos DB + Blob Storage
│   └── lib/          # Env validation, logger
├── client/           # React SPA
│   ├── routes/       # TanStack Router pages
│   ├── components/   # UI components (shadcn/ui)
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # API client (Hono RPC), MSAL auth
│   └── providers/    # React providers
└── shared/           # Shared types, Zod schemas, constants

tests/
├── unit/
│   ├── server/       # Hono route & service tests
│   ├── client/       # React hook & component tests
│   └── shared/       # Zod schema tests

infra/                # Bicep IaC (App Service, Cosmos DB, Storage)
.github/workflows/    # CI (typecheck/lint/test) + Deploy
```
