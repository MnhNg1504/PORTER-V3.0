# POTTER 3.0 — Hợp đồng API (Backend Contract)

> Nguồn: [[00-brief]] · [[05-synthesis-spec]] · [[02-ux-ui-5tabs]] · [[03-map-ux-flows]] + **code thật `server/src`**.
> Stack thật: **NestJS + TypeORM + PostgreSQL/PostGIS + Socket.IO** (Swagger tại `/docs`).
> Quy ước: REST/JSON, `Authorization: Bearer <accessToken>`. Toạ độ luôn `[lon, lat]` (GeoJSON).
> **Khi contract và code lệch nhau: CODE LÀ CHUẨN** — file này đã đồng bộ theo code ngày 2026-07-22.
> Phần đánh dấu 📋 là **roadmap** (chưa code, giữ làm đặc tả cho giai đoạn sau).

---

## 0. TRẠNG THÁI TRIỂN KHAI

> ✅ = đã code trong `server/src` (đường dẫn thật, đã qua typecheck) · 🟡 = stub có chủ đích · 📋 = chỉ trong contract (roadmap).
> Tổng: **34 endpoint REST đã code** (33 hoạt động + 1 stub Apple) + **1 WebSocket gateway** (5 event) · **~24 endpoint 📋 roadmap**.

| Module | Endpoint | Trạng thái | Ghi chú |
|---|---|---|---|
| auth | `POST /auth/register` | ✅ | throttle 5 req/phút |
| auth | `POST /auth/login` | ✅ | throttle 10 req/phút, khoá 15' sau 5 lần sai |
| auth | `POST /auth/google` | ✅ | hoạt động khi set `GOOGLE_CLIENT_ID` |
| auth | `POST /auth/apple` | 🟡 | stub trả **501** tới khi có Apple Developer |
| auth | `POST /auth/refresh` | ✅ | rotate, hash refresh token trong DB |
| auth | `GET /auth/verify-email?token=` | ✅ | link trong email xác thực (chờ nối SMTP thật) |
| auth | `POST /auth/resend-verification` | ✅ | JWT, throttle 3 req/phút |
| auth | `POST /auth/logout` | ✅ | thu hồi refresh token |
| users | `GET /users/me` | ✅ | hồ sơ + tier + reputation |
| users | `GET /users/:id` | ✅ | hồ sơ công khai |
| users | `PATCH /users/me` | 📋 | cập nhật hồ sơ (app có `emergencyContact` chờ lưu) |
| routes | `GET /routes` | ✅ | query `difficulty`; top 50 theo lượt lưu |
| routes | `GET /routes/:slug` | ✅ | chi tiết (không kèm geometry nặng) |
| routes | `GET /routes/:slug/track` | ✅ | GeoJSON thật + cờ `requiresGuide` — cần free/đã mua/admin |
| routes | `GET /routes/hot` | 📋 | carousel điểm đến hot |
| routes | `GET /routes/:slug/gpx` | 📋 | tải file GPX gốc (`application/gpx+xml`) — hiện dùng `/track` GeoJSON |
| routes | `GET /routes/:slug/elevation` | 📋 | elevation profile tính sẵn từ DEM |
| routes | `POST /routes` (multipart + ảnh XP) | 📋 | thay bằng flow `POST /gpx/submit` → admin duyệt tự tạo cung; multipart cần lại khi có storage |
| routes | `GET /routes/mine` | 📋 | cung tôi đã mở/bán (seller) |
| gpx | `POST /gpx/submit` | ✅ | **Cấp 2+** (`@MinTier(2)`); JSON `{ routeName, rawGpx }` ≤ ~20MB |
| gpx | `GET /gpx/mine` | ✅ | bản nộp của tôi + trạng thái kiểm duyệt |
| purchases | `POST /purchases/routes/:slug` | ✅ | chặn Cấp 1 mua cung Khó; 0đ auto-`paid`, >0đ `pending` chờ cổng thanh toán |
| purchases | `GET /purchases/mine` | ✅ | cung đã mua |
| purchases | `POST /purchases/:id/pay` | 📋 | VNPay/MoMo → `paymentUrl`/deeplink (`TODO(payment)`) |
| purchases | `POST /webhooks/payment` | 📋 | webhook server-to-server |
| moderation | `POST /moderation/reports` | ✅ | report user/post/route/message |
| moderation | `POST /moderation/blocks/:userId` | ✅ | chặn user |
| moderation | `DELETE /moderation/blocks/:userId` | ✅ | bỏ chặn |
| moderation | `GET /moderation/blocks` | ✅ | danh sách tôi chặn |
| chat | `POST /chat/direct/:userId` | ✅ | mở/lấy hội thoại 1-1, block-aware |
| chat | `GET /chat/conversations` | ✅ | hội thoại của tôi |
| chat | `GET /chat/conversations/:id/messages` | ✅ | phân trang lùi `?limit=&before=<ISO>` |
| chat | `POST /chat/conversations/:id/messages` | ✅ | gửi text ≤4000 ký tự (fallback khi socket rớt) |
| chat | `POST /chat/conversations/:id/seen` | ✅ | đánh dấu đã xem tới `messageId` |
| chat | `POST /chat/messages/:id/recall` | ✅ | thu hồi trong 30' (người gửi) |
| chat (WS) | Socket.IO namespace **`/chat`** | ✅ | events: `join` · `message` · `seen` · `recall` · `typing` + broadcast `presence` |
| chat | tin nhắn ảnh/vị trí/route_card | 📋 | chờ media storage (GĐ3) |
| notifications | `POST /notifications/register` | ✅ | Expo push token (android/ios), tự dọn token chết |
| notifications | `DELETE /notifications/register/:token` | ✅ | huỷ đăng ký |
| admin | `GET /admin/gpx?status=` | ✅ | hàng đợi kiểm duyệt (mặc định `pending`) |
| admin | `PATCH /admin/gpx/:id` | ✅ | duyệt/từ chối; **approved → TỰ TẠO cung** + push cho người nộp |
| admin | `GET /admin/reports?status=` | ✅ | hàng đợi report (mặc định `open`) |
| admin | `PATCH /admin/reports/:id` | ✅ | resolved/dismissed + note |
| admin | `PATCH /admin/users/:id/tier` | ✅ | set cấp 1/2/3 thủ công |
| media | `POST /media/upload` | 📋 | GĐ3 — multer + object storage (ảnh XP, avatar, ảnh post) |
| tracks | `POST /tracks` · `GET /tracks` · `POST /tracks/:id/export` | 📋 | lưu/xuất track đã ghi |
| waypoints | `POST /waypoints` · `GET/PATCH/DELETE /waypoints/:id` | 📋 | waypoint icon/note/folder |
| sync | `POST /sync` | 📋 | đồng bộ delta local-first |
| community | `GET /feed` · `POST /posts` · `GET /posts/:id` · like/comment · follow | 📋 | Tab 1 (GĐ3) |
| tiers | `GET /tiers/criteria` · `POST /tiers/upgrade` | 📋 | thăng cấp (hiện set thủ công qua admin) |
| premium | `POST /premium/subscribe` · `GET/POST /offline/areas` | 📋 | GĐ5 |

---

## 1. Nguyên tắc chung (theo code thật)

- **Base URL:** global prefix **`/api/v1`** — dev: `http://localhost:3000/api/v1`; production dự kiến `https://api.potter.vn/api/v1`. Swagger: `/docs`.
- **Auth:** JWT access **15 phút** (`JWT_ACCESS_TTL=900s`) + refresh **7 ngày** (`JWT_REFRESH_TTL=7d`, rotate, bcrypt hash trong DB). *(Contract cũ ghi refresh 30 ngày — code 7d là chuẩn, đổi được qua env.)*
- **JWT payload:** `{ sub, role: 'user'|'admin', tier: 1|2|3 }` — guard `@Roles('admin')` + `@MinTier(n)` enforce server-side, không tin client.
- **Cấp user:** field thật là **`tier`** (không phải `level` như contract cũ): 1 Mới / 2 Kinh nghiệm / 3 Tổ chức.
- **Định danh cung:** dùng **`slug`** (vd `ta-xua`), không phải id, trong mọi endpoint routes/purchases.
- **Bảo mật:** helmet, `ValidationPipe` whitelist (chống injection qua DTO), throttle toàn cục + siết riêng cho auth.
- **Lỗi:** NestJS chuẩn `{ statusCode, message, error }` + HTTP status. *(Contract cũ tả `{ error: { code, message } }` — format Nest là chuẩn.)*
- **Địa lý:** PostGIS `geometry(LineStringZ,4326)` (có độ cao) / `Point,4326`. Trả GeoJSON qua `ST_AsGeoJSON`.
- **Phân trang:** 📋 cursor chung chưa làm; hiện routes `take: 50`, chat phân trang lùi bằng `?before=<ISO>&limit=`.

---

## 2. Auth & User — ✅ đã code

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/auth/register` | Đăng ký email + password (bcrypt) → gửi email xác thực (token 24h). |
| POST | `/auth/login` | → `{ accessToken, refreshToken, user }`. Sai 5 lần → khoá 15'. |
| POST | `/auth/google` | Body `{ token }` = Google ID token từ SDK trên app → verify → login/tạo user. |
| POST | `/auth/apple` | 🟡 Stub **501** (docs/05 §6 — chờ Apple Developer). Body giống Google. |
| POST | `/auth/refresh` | Body `{ refreshToken }` → cặp token mới (rotate). |
| GET | `/auth/verify-email?token=` | Link trong email xác thực trỏ về đây. |
| POST | `/auth/resend-verification` | (JWT) gửi lại email xác thực. |
| POST | `/auth/logout` | (JWT) xoá refresh token hash → phiên cũ hết refresh được. |
| GET | `/users/me` | (JWT) hồ sơ đầy đủ của tôi. |
| GET | `/users/:id` | (JWT) hồ sơ user khác. |
| PATCH | `/users/me` | 📋 cập nhật hồ sơ (displayName, avatar, `emergencyContact`…). |

**`user` trong response login/refresh (code là chuẩn):**
```json
{
  "id": "uuid",
  "email": "a@b.c",
  "displayName": "Nao Chi",
  "role": "user",
  "tier": 2,
  "reputation": 780
}
```
> Contract cũ tả `level`, `stats { routes, km, gain, days }`, `premium {...}` — **`stats`/`premium` là 📋** (tính từ tracks + subscription sau).

---

## 3. Cung đường (Routes) — Tab 2 · ✅ lõi đã code

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/routes` | ✅ Cung `published`, sort theo lượt lưu, top 50. Query: `difficulty=easy\|standard\|hard`. 📋 thêm `region, season, sort, q` (màn Search app đang chờ `q`). |
| GET | `/routes/:slug` | ✅ Chi tiết cung (name, difficulty, distanceM, ascentM, durationEstMin, priceVnd, seller…) — không kèm geometry nặng. |
| GET | `/routes/:slug/track` | ✅ (JWT) `{ route, requiresGuide, track: GeoJSON LineStringZ }`. Chỉ trả khi: cung **0đ** / **đã mua** (`status=paid`) / **admin**. `requiresGuide=true` khi user Cấp 1 × cung không-dễ → app chặn tự điều hướng (docs/04). |
| GET | `/routes/hot` | 📋 Điểm đến hot (carousel). |
| GET | `/routes/:slug/gpx` | 📋 File GPX gốc `application/gpx+xml` (hiện app dùng GeoJSON từ `/track`). |
| GET | `/routes/:slug/elevation` | 📋 Elevation profile tính sẵn từ DEM (app đang tính client từ GPX). |
| GET | `/routes/mine` | 📋 Cung tôi là seller. |

> **Ràng buộc ảnh điểm xuất phát (brief §4):** `startPoint.photoUrl` **BẮT BUỘC trước khi bán** cung có hướng dẫn. Hiện cung tạo từ duyệt GPX chưa có ảnh + giá — server phải chặn bán tới khi seller bổ sung (📋 cùng media upload GĐ3, `TODO(api)` trong `admin.service.ts`).

---

## 4. GPX nộp & Kiểm duyệt — ✅ đã code (khác contract cũ, code là chuẩn)

Flow thật: **Cấp 2 nộp GPX → admin duyệt → server TỰ TẠO cung published** (seller = người nộp) → push kết quả.

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/gpx/submit` | ✅ (JWT + **`@MinTier(2)`**) Body JSON `{ routeName, rawGpx }` (XML ≤ ~20MB — không multipart như contract cũ). Server parse thật, tính km/leo, vào hàng đợi `pending`. |
| GET | `/gpx/mine` | ✅ Bản nộp của tôi + trạng thái + ghi chú admin. |
| PATCH | `/admin/gpx/:id` | ✅ (admin) Body `{ status: "approved"\|"rejected", reviewNote? }`. **approved** → parse GPX, tạo `trek_routes` PostGIS (slug tự sinh, độ khó auto theo leo/km, status `published`) + push. Response: `{ submission, createdRoute: { id, slug } \| null }`. |

> Contract cũ (`POST /gpx/upload` multipart, `POST /routes/:id/submit-review`, `POST /admin/reviews/:id/approve|reject`) **đã thay** bằng 3 endpoint trên.

---

## 5. Mua cung & Thanh toán — Tab 2 · ✅ mua, 📋 cổng thanh toán

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/purchases/routes/:slug` | ✅ (JWT) Mua cung. Enforce: **Cấp 1 không mua được cung Khó** (403 — cần guide, docs/04); không mua trùng (409). Cung 0đ → `status: "paid"` ngay; >0đ → `"pending"` chờ thanh toán. *(Contract cũ `POST /purchases` body `{ routeId, package }` — chưa có chọn gói self_gpx/guided.)* |
| GET | `/purchases/mine` | ✅ Cung đã mua (kèm route). |
| POST | `/purchases/:id/pay` | 📋 Khởi tạo VNPay/MoMo → `paymentUrl`/deeplink (`TODO(payment)` trong code). |
| POST | `/webhooks/payment` | 📋 Webhook cổng thanh toán. |

> 📋 Sau khi gói `guided` thanh toán thành công: server tự tạo conversation buyer ↔ guide (dùng `POST /chat/direct` nội bộ) và mở quyền track.

---

## 6. Nhắn tin (Tab 4) — ✅ REST + Socket.IO đã code đầy đủ

**REST** (fallback + nạp lịch sử — client nên ưu tiên gateway):

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/chat/direct/:userId` | ✅ Mở (hoặc lấy lại) hội thoại 1-1 — **block-aware** (đã chặn nhau thì cấm). |
| GET | `/chat/conversations` | ✅ Hội thoại của tôi. |
| GET | `/chat/conversations/:id/messages` | ✅ Lịch sử, phân trang lùi `?limit=50&before=<ISO>`. |
| POST | `/chat/conversations/:id/messages` | ✅ Gửi text (1–4000 ký tự). |
| POST | `/chat/conversations/:id/seen` | ✅ Body `{ messageId }` — đã xem tới tin này. |
| POST | `/chat/messages/:id/recall` | ✅ Thu hồi trong **30 phút**, chỉ người gửi. |

**WebSocket — Socket.IO namespace `/chat`** *(code là chuẩn — contract cũ ghi `wss://api.potter.vn/ws`)*:
- **Auth:** JWT trong `handshake.auth.token` — sai thì disconnect ngay.
- **Client emit:** `join(convId)` (kiểm tra membership) · `message({ convId, content })` · `seen({ convId, messageId })` · `recall({ convId, messageId })` · `typing(convId)`.
- **Server emit:** `message` `{ id, convId, senderId, content, createdAt }` · `seen` · `recall` · `typing` · `presence` `{ userId, online }` (đếm socket theo user).
- Mọi nghiệp vụ (block, quyền, cửa sổ thu hồi) dùng chung `ChatService` với REST.

📋 Chưa có: chat **nhóm** tạo qua API, message `type: image | location | route_card | startpoint_card` (chờ media storage GĐ3).

---

## 7. Push Notification — ✅ server đã code

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/notifications/register` | ✅ (JWT) Body `{ token: "ExponentPushToken[...]", platform: "android"\|"ios" }` — validate format Expo. |
| DELETE | `/notifications/register/:token` | ✅ Huỷ đăng ký (logout/gỡ app). |

Server gửi qua **Expo Push API**, tự dọn token chết (`DeviceNotRegistered`). Đang dùng cho kết quả duyệt GPX; 📋 mở rộng: tin nhắn mới, cập nhật cung đã mua.

---

## 8. Moderation — ✅ đã code (checklist §1: report + block)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/moderation/reports` | ✅ (JWT) Body `{ targetType: "user"\|"post"\|"route"\|"message", targetId, reason (10–1000 ký tự) }`. |
| POST | `/moderation/blocks/:userId` | ✅ Chặn user (chat direct sẽ bị từ chối 2 chiều). |
| DELETE | `/moderation/blocks/:userId` | ✅ Bỏ chặn. |
| GET | `/moderation/blocks` | ✅ Danh sách tôi đã chặn. |

---

## 9. Admin API — ✅ đã code (web admin GĐ4 sẽ gọi các endpoint này)

Tất cả yêu cầu JWT + `@Roles('admin')`.

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/gpx?status=pending` | ✅ Hàng đợi kiểm duyệt GPX (kèm người nộp). |
| PATCH | `/admin/gpx/:id` | ✅ Duyệt/từ chối — xem §4 (tự tạo cung + push). |
| GET | `/admin/reports?status=open` | ✅ Hàng đợi report. |
| PATCH | `/admin/reports/:id` | ✅ Body `{ status: "resolved"\|"dismissed", resolutionNote? }`. |
| PATCH | `/admin/users/:id/tier` | ✅ Body `{ tier: 1\|2\|3 }` — thăng/giáng cấp thủ công (docs/04: 1→2 gate KYC/GPX; 2→3 theo pháp nhân). |

---

## 10. 📋 ROADMAP — giữ nguyên đặc tả, chưa code

### 10.1 Media upload (GĐ3 — mở khoá ảnh XP, avatar, ảnh post, chat ảnh)
`POST /media/upload` (multipart, multer + object storage S3/MinIO) → `{ url, width, height }`.

### 10.2 Track / Waypoint / Đồng bộ (Tab 3 & 5)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/tracks` | Lưu track đã ghi (GPX/GeoJSON + stats). |
| GET | `/tracks` | Track của tôi. |
| POST | `/tracks/:id/export` | Xuất GPX/KML (app đã có `toGpxXml()` client-side). |
| POST | `/waypoints` · GET/PATCH/DELETE `/waypoints/:id` | Waypoint icon/note/folder/toạ độ. |
| POST | `/sync` | Đồng bộ delta local-first (conflict theo `updatedAt`/version). |

> Chỉ đồng bộ **meta** cho Area offline; KHÔNG đẩy tile/graph lên cloud (docs/03 §7.3).

### 10.3 Cộng đồng (Tab 1)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/feed?scope=following\|explore` | Feed bài viết. |
| POST | `/posts` | Đăng bài / check-in (gắn track + ảnh + route ref). |
| GET | `/posts/:id` | Chi tiết + comment. |
| POST | `/posts/:id/like` · `/comment` | Tương tác. |
| POST | `/users/:id/follow` | Follow/unfollow. |

### 10.4 Cấp độ & Premium (Tab 5)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/tiers/criteria` | Tiêu chí thăng cấp + tiến độ (thang uy tín 0–1000 đã có field `reputation`). |
| POST | `/tiers/upgrade` | Nộp hồ sơ thăng cấp (disclaimer + giấy phép tour cấp 3). |
| POST | `/premium/subscribe` | Premium: offline + lớp nâng cao. |
| GET/POST | `/offline/areas` | Meta gói offline theo Area (chỉ meta, không tile). |

### 10.5 Hạ tầng tile (KHÔNG qua API backend — dịch vụ riêng, docs/03 §8)
- **Vector tiles:** Planetiler từ `vietnam-latest.osm.pbf` → **PMTiles** trên CDN (thay OSM/OpenTopoMap demo).
- **DEM terrain-RGB:** Copernicus GLO-30 (thay terrarium AWS demo).
- **Routing/snap:** GraphHopper (profile `hike`) → `GET /route`, `POST /match`; bản embedded cho offline.
- **Vệ tinh (Premium):** nguồn có license + proxy key server-side.

---

## 11. Bảng ánh xạ App ↔ API (cho agent Kiểm-tra-chéo)

| Màn / file app | Đang dùng MOCK | Endpoint nối |
|---|---|---|
| `MapScreen`, `RouteNavigateScreen` | GPX bundle `ta-xua.gpx` | ✅ `GET /routes/:slug/track` (GeoJSON) — 📋 `/gpx` nếu cần file gốc |
| `RoutesScreen`, `RouteDetailScreen`, `RouteCard` | `mockRoutes` | ✅ `GET /routes`, `GET /routes/:slug` — 📋 `/routes/hot` |
| `SearchScreen` | lọc client không dấu | 📋 `GET /routes?q=` |
| `StartPointScreen` (ảnh XP) | `photoUrl=null` | 📋 media upload + field ảnh XP |
| `RouteDetailScreen` (nút mua) | không thanh toán | ✅ `POST /purchases/routes/:slug` — 📋 `/purchases/:id/pay` |
| `CommunityScreen` | `mockPosts` | 📋 `GET /feed`, `POST /posts` |
| `MessagesScreen`, `ChatScreen` | `mockConversations`, `mockChat` | ✅ `GET /chat/conversations` + Socket.IO `/chat` |
| `ProfileScreen` | `currentUser`, `mockBadges` | ✅ `GET /users/me` — 📋 `PATCH /users/me`, stats/cột mốc |
| Đăng ký push (khi build FCM) | chưa gọi | ✅ `POST /notifications/register` |

---

## 12. Schema thật (PostGIS qua TypeORM migration — `server/src/migrations`)

Bảng chính: `users` (role, tier, reputation, emailVerified, refreshTokenHash) ·
`trek_routes` (**`geometry(LineStringZ,4326)`** + `startPoint Point` + GIST index, slug unique, seller, status, priceVnd) ·
`gpx_submissions` (rawGpx `select:false`, status pending/approved/rejected) ·
`purchases` · `reports` · `user_blocks` · `conversations`/`messages` (recalledAt, seen) · `device_tokens`.

> Contract cũ gợi ý `LineString` 2D — code dùng **LineStringZ** (giữ độ cao thật từ GPX) là chuẩn. Seed: 15 cung Tây Bắc từ GPX thật (`npm run seed`).

_Hết. Tham chiếu chéo: [[05-synthesis-spec]] §3 (map infra) · [[03-map-ux-flows]] §8 (dữ liệu thật) · [[06-gap-analysis]] (tiến độ tổng)._
