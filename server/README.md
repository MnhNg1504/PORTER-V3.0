# POTTER 3.0 — Backend (NestJS + PostgreSQL/PostGIS)

API theo [docs/api-contract.md](../docs/api-contract.md). Toàn bộ dữ liệu cung đường là **GPX thật** (PostGIS `LineStringZ`).

## Yêu cầu
- Node 20+, Docker (cho PostGIS).

## Chạy lần đầu

```bash
cd server
cp .env.example .env          # rồi sửa secret nếu cần
docker compose up -d db       # PostGIS 16
npm install
npm run migration:run         # tạo schema (checklist §4: migration + index)
npm run seed                  # nạp 15 cung Tây Bắc từ GPX thật
npm run start:dev             # http://localhost:3000/api/v1 — Swagger: /docs
```

Chạy cả API trong Docker: `docker compose --profile full up`.

## Đã có (GĐ2)
- **Auth**: đăng ký/đăng nhập email + JWT access (15') + refresh (7d, hash trong DB),
  bcrypt, khoá 15' sau 5 lần sai (checklist §7), throttle login 10 req/phút.
- **Phân quyền**: `@Roles('admin')` + `@MinTier(1|2|3)` — enforce hệ 3 cấp docs/04
  (Cấp 2+ mới nộp GPX mở cung; Cấp 1 không mua được cung Khó).
- **Routes**: list/detail; `GET /routes/:slug/track` trả GeoJSON thật CHỈ khi miễn phí/đã mua,
  kèm cờ `requiresGuide` cho Cấp 1 × cung khó.
- **GPX**: nộp + validate (parse thật, tính km/leo), hàng đợi kiểm duyệt.
- **Purchases**: mua cung (0đ auto-paid; cổng thanh toán thật `TODO(payment)`).
- **Moderation**: báo cáo nội dung + chặn user (checklist §1).
- **Admin API**: duyệt GPX, xử lý report, set tier (web admin ở GĐ4).
- **Chat**: Socket.IO namespace `/chat` — auth JWT, join/message/typing/presence (GĐ3 hoàn thiện).
- **Media**: `POST /media/upload` (JWT, multipart field `file`) — ảnh jpeg/png/webp ≤10MB,
  validate magic bytes; dev lưu `uploads/` + serve `/uploads` (`TODO(storage)`: S3/R2 — user chọn).
- **Bảo mật**: helmet, ValidationPipe whitelist (chống injection qua DTO), rate limit toàn cục.
- **Test**: `npx jest` — unit test route-utils/gpx/auth/chat/media (jest 29 + ts-jest 29,
  KHÔNG nâng jest 30 — xung khắc ts-jest). CI chạy typecheck + jest (checklist §8).
- Swagger `/docs` (checklist §12).

## Chưa có (GĐ kế)
- OAuth Google/Apple chờ key thật (GĐ3) · storage S3/R2 cho ảnh (user chọn dịch vụ)
- Web admin (GĐ4) · Queue BullMQ, monitoring (GĐ5)
- Tạo TrekRoute tự động khi admin approve GPX (`TODO(api)` trong admin.controller)
