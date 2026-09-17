import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

// FE và BE là hai Worker khác origin nên bắt buộc phải bật CORS.
// Danh sách origin được phép nằm ở biến CORS_ORIGIN trong wrangler.json
// (nhiều origin thì ngăn cách bằng dấu phẩy).
app.use(
	"/api/*",
	cors({
		origin: (origin, c) => {
			// Hono truyền Context chưa gắn Bindings nên phải ép kiểu để c.env không thành any.
			const allowed = ((c.env as Env).CORS_ORIGIN ?? "")
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
			return allowed.includes(origin) ? origin : null;
		},
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
		// Cache preflight 24h để trình duyệt không gửi OPTIONS trước mỗi request.
		maxAge: 86400,
	}),
);

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;
