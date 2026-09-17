// Địa chỉ backend. FE và BE là hai Worker riêng nên phải gọi bằng URL đầy đủ.
// Cấu hình qua biến môi trường VITE_API_URL (xem .env.example).
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export function apiUrl(path: string): string {
	return `${API_URL.replace(/\/$/, "")}${path}`;
}

export async function apiGet<T>(path: string): Promise<T> {
	const res = await fetch(apiUrl(path));
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.json() as Promise<T>;
}
