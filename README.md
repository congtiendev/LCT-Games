# LCT Games

React + Hono chạy trên Cloudflare Workers.

## Stack

| Thành phần | Công nghệ |
|---|---|
| Frontend | React 19 + Vite 7 |
| Backend | Hono 4 (Worker) |
| Hosting | Cloudflare Workers + Static Assets |
| Ngôn ngữ | TypeScript |

Frontend và API chạy chung **một** Worker: static assets phục vụ SPA, request `/api/*` vào Hono.

## Cấu trúc

```
src/
  react-app/     # React SPA (Vite)
    main.tsx
    App.tsx
  worker/
    index.ts     # Hono API — routes /api/*
wrangler.json    # Cấu hình Worker
vite.config.ts
```

## Chạy local

```bash
npm install
npm run dev          # http://localhost:5173
```

Vite dev server chạy cả React lẫn Worker qua `@cloudflare/vite-plugin`, nên gọi `/api/` ở local hoạt động y như trên production.

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build ra `dist/` |
| `npm run check` | Typecheck + build + `wrangler deploy --dry-run` |
| `npm run deploy` | Deploy thủ công lên Cloudflare |
| `npm run lint` | ESLint |
| `npm run cf-typegen` | Sinh lại types cho bindings |

## Deploy

Deploy tự động khi push lên `main` (Cloudflare Workers Builds, xem phần cài đặt bên dưới).

Deploy thủ công:

```bash
npx wrangler login
npm run deploy
```

## Thêm API route

```ts
// src/worker/index.ts
app.get("/api/games", (c) => c.json({ games: [] }));
```

## Thêm database

```bash
npx wrangler d1 create lct-games-db
```

Rồi thêm binding vào `wrangler.json`:

```json
"d1_databases": [
  { "binding": "DB", "database_name": "lct-games-db", "database_id": "<id>" }
]
```

Chạy `npm run cf-typegen` để cập nhật types, sau đó dùng `c.env.DB` trong Hono.
