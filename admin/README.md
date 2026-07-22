# POTTER 3.0 — Trang quản trị (web admin)

Công cụ **nội bộ** cho admin: duyệt GPX, xử lý báo cáo, đổi cấp người dùng.
**1 file tĩnh, JS thuần, không build, không CDN** — mở `index.html` là chạy.

## Cách chạy

1. Chạy server backend (`server/`): `npm run start:dev` — mặc định `http://localhost:3000`.
2. Mở `admin/index.html` bằng trình duyệt (double-click hoặc kéo vào Chrome/Edge).
3. Ô **API URL** ở thanh trên: mặc định `http://localhost:3000`, bấm **Lưu** để ghi vào `localStorage` (key `potter_admin_api_url`).
4. Đăng nhập bằng tài khoản có `role = admin`. Tài khoản thường vẫn đăng nhập được nhưng mọi API quản trị sẽ bị máy chủ trả **403** (trang hiện cảnh báo ngay sau đăng nhập).

> Nếu trình duyệt chặn fetch từ trang `file://` (hiếm — CORS server đã bật `origin: true`),
> phục vụ thư mục này qua một static server bất kỳ, vd: `npx http-server admin -p 8080`.

## Chức năng & API sử dụng (prefix `api/v1`)

| Chức năng | API |
|---|---|
| Đăng nhập | `POST /auth/login` → `{ accessToken, refreshToken, user }` |
| Làm mới phiên khi 401 | `POST /auth/refresh` (tự retry request 1 lần) |
| Đăng xuất | `POST /auth/logout` |
| Tab **Duyệt GPX** — danh sách | `GET /admin/gpx?status=pending|approved|rejected` |
| Duyệt / Từ chối bản nộp | `PATCH /admin/gpx/:id` body `{ status, reviewNote? }` — approved sẽ **tự tạo cung** (hiện `createdRoute.slug`) |
| Tab **Báo cáo** — danh sách | `GET /admin/reports?status=open|resolved|dismissed` |
| Xử lý / Bỏ qua báo cáo | `PATCH /admin/reports/:id` body `{ status, resolutionNote? }` |
| Tab **Người dùng** — đổi cấp | `PATCH /admin/users/:id/tier` body `{ tier: 1|2|3 }` |

## Bảo mật / hành vi

- `accessToken` + `refreshToken` chỉ giữ **in-memory** (không ghi localStorage) — F5 là phải đăng nhập lại. Chỉ API URL được lưu localStorage.
- Khi access token hết hạn (TTL 900s): gặp 401 → tự gọi `POST /auth/refresh` rồi retry đúng 1 lần; refresh hỏng → quay về màn đăng nhập.
- Lỗi hiển thị rõ theo tình huống: mất kết nối (không gọi được API URL), 401 (hết phiên), 403 (không phải admin), 404 (không tìm thấy user), 429 (rate limit). Ưu tiên message tiếng Việt từ server nếu có.
- Đổi lên **Cấp 3** có hộp cảnh báo + confirm nêu ý nghĩa pháp lý theo `docs/04-user-tiers-scoring.md` (pháp nhân + giấy phép lữ hành + hợp đồng; xét duyệt luôn thủ công). Cấp 2 confirm nhắc gate KYC/GPX/rating.
- Mọi dữ liệu server trả về đều được escape trước khi render (chống XSS từ tên user/tên cung).

## Hạn chế đã biết

- Chưa có endpoint tra cứu user (`GET /admin/users/:id` không tồn tại) → tab Người dùng phải **nhập đúng UUID**, không xem trước được thông tin user trước khi đổi cấp; kết quả hiển thị từ response của PATCH.
- Refresh token giữ in-memory nên reload trang mất phiên (đánh đổi có chủ đích cho công cụ nội bộ).
- Chưa phân trang — danh sách GPX/báo cáo tải toàn bộ theo status.
