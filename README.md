# LCT Games

FE và BE là **hai Cloudflare Worker riêng biệt**, deploy độc lập.

```
lct-games-web.<subdomain>.workers.dev   ← FE (React, static assets)
lct-games-api.<subdomain>.workers.dev   ← BE (Hono API)
```

## Cấu trúc

```
frontend/              # FE — React 19 + Vite 7
├── src/
│   ├── App.tsx
│   ├── api.ts         # client gọi BE qua VITE_API_URL
│   └── main.tsx
├── index.html
├── vite.config.ts
├── wrangler.json      # Worker: lct-games-web (assets-only)
└── package.json

backend/               # BE — Hono 4
├── src/index.ts       # routes /api/* + CORS
├── wrangler.json      # Worker: lct-games-api
└── package.json

package.json           # npm workspaces
```

## Chạy local

Cần **hai terminal**:

```bash
npm run dev:api    # BE → http://localhost:8787
npm run dev        # FE → http://localhost:5173
```

FE đọc địa chỉ BE từ `VITE_API_URL`, mặc định `http://localhost:8787`. Muốn đổi thì copy `frontend/.env.example` thành `frontend/.env`.

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | FE dev server |
| `npm run dev:api` | BE dev server |
| `npm run build` | Build FE ra `frontend/dist` |
| `npm run check` | Typecheck + build + dry-run cả hai Worker |
| `npm run deploy` | Deploy cả hai Worker |
| `npm run deploy:web` | Chỉ deploy FE |
| `npm run deploy:api` | Chỉ deploy BE |
| `npm run lint` | ESLint |

## CORS

Vì FE và BE khác origin, BE bắt buộc bật CORS. Danh sách origin được phép nằm ở `CORS_ORIGIN` trong [backend/wrangler.json](backend/wrangler.json), nhiều origin thì ngăn cách bằng dấu phẩy:

```json
"vars": {
  "CORS_ORIGIN": "https://lct-games-web.<subdomain>.workers.dev,http://localhost:5173"
}
```

Sau khi deploy FE lần đầu, **phải thêm URL thật của FE vào đây rồi deploy lại BE**, nếu không trình duyệt sẽ chặn mọi request.

Preflight được cache 24h (`maxAge: 86400`) để trình duyệt không gửi `OPTIONS` trước mỗi request — giảm đáng kể số request tính vào quota.

## Thêm API route

```ts
// backend/src/index.ts
app.get("/api/games", (c) => c.json({ games: [] }));
```

Gọi từ FE:

```ts
import { apiGet } from "./api";
const data = await apiGet<{ games: Game[] }>("/api/games");
```

## Thêm database

```bash
cd backend && npx wrangler d1 create lct-games-db
```

Thêm binding vào [backend/wrangler.json](backend/wrangler.json):

```json
"d1_databases": [
  { "binding": "DB", "database_name": "lct-games-db", "database_id": "<id>" }
]
```

Chạy `npm run cf-typegen -w backend` để cập nhật types, rồi dùng `c.env.DB`.
