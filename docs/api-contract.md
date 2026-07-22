# POTTER 3.0 — Hợp đồng API (Backend Contract)

> Agent: Code. Nguồn: [[00-brief]] · [[05-synthesis-spec]] · [[02-ux-ui-5tabs]] · [[03-map-ux-flows]].
> Mục tiêu: mô tả **contract** để backend & app khớp nhau. KHÔNG kèm code backend đầy đủ.
> Gợi ý stack: **NestJS + PostgreSQL/PostGIS + Object Storage (S3/MinIO) + WebSocket**.
> Quy ước: REST/JSON, `Authorization: Bearer <accessToken>`. Toạ độ luôn `[lon, lat]` (GeoJSON).
> Mọi endpoint đánh dấu `// TODO(api)` trong code app tương ứng với mục dưới đây.

---

## 0. Nguyên tắc chung

- **Base URL:** `https://api.potter.vn/v1`
- **Auth:** JWT access token (15 phút) + refresh token (30 ngày, rotate).
- **Lỗi:** `{ "error": { "code": "STRING", "message": "..." } }` + HTTP status chuẩn.
- **Phân trang:** `?cursor=<opaque>&limit=20` → `{ items: [...], nextCursor: string | null }`.
- **Địa lý:** PostGIS `geometry(Point,4326)` / `geometry(LineString,4326)`. Trả GeoJSON.
- **Cấp user (`level`):** 1 (Mới) / 2 (Kinh nghiệm) / 3 (Tổ chức). Enforce quyền theo cấp ở server (không tin client).

---

## 1. Auth & User

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/auth/register` | Đăng ký (email/phone + password/OTP). |
| POST | `/auth/login` | Đăng nhập → `{ accessToken, refreshToken, user }`. |
| POST | `/auth/refresh` | Làm mới token. |
| POST | `/auth/logout` | Thu hồi refresh token. |
| GET | `/me` | Hồ sơ + cấp + uy tín + cột mốc. |
| PATCH | `/me` | Cập nhật hồ sơ. |

**`User` object:**
```json
{
  "id": "u_123",
  "name": "Nao Chi",
  "level": 2,
  "reputation": 780,
  "stats": { "routes": 14, "km": 168, "gain": 9400, "days": 21 },
  "premium": { "active": false, "expiresAt": null }
}
```
> App dùng ở: `mockData.currentUser` (Tab 5, và bật/khoá tính năng theo `level` ở mọi tab).

---

## 2. Cung đường (Routes) — Tab 2

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/routes` | Danh sách cung. Query: `difficulty, region, season, sort=hot\|saves, cursor, limit`. |
| GET | `/routes/hot` | Điểm đến hot (carousel). |
| GET | `/routes/:id` | Chi tiết cung (kèm `startPoint`, thống kê, review count). |
| GET | `/routes/:id/gpx` | **Tải GPX mẫu THẬT** của cung (chỉ khi đã mua / công khai). Trả `application/gpx+xml`. |
| GET | `/routes/:id/elevation` | (Tuỳ chọn) elevation profile tính sẵn từ DEM, nếu không muốn tính client. |
| POST | `/routes` | **Mở cung mới** (chỉ `level>=2`). Multipart: metadata + GPX + ảnh điểm XP (bắt buộc). → trạng thái `pending_review`. |
| GET | `/routes/mine` | Cung của tôi (đã mở/bán). |

**`Route` object (khớp `mockData.Route`):**
```json
{
  "id": "r_taxua",
  "name": "Tà Xùa – Sống lưng khủng long",
  "region": "Sơn La",
  "difficulty": "hard",            // easy | standard | hard
  "distanceKm": 12.4,
  "gainM": 1120,
  "durationText": "~8h",
  "bestSeason": "Thu",
  "saves": 1204,
  "hot": 82,                        // 0..100
  "priceVnd": 350000,
  "rating": 4.7,
  "reviewCount": 88,
  "hasSampleGpx": true,
  "gpxUrl": "https://cdn.potter.vn/gpx/r_taxua.gpx",
  "startPoint": {
    "label": "Bản Tà Xùa",
    "note": "Cổng gỗ đầu bản...",
    "lat": 21.447808,
    "lon": 104.353528,
    "photoUrl": "https://cdn.potter.vn/startpoints/r_taxua_1.jpg",   // BẮT BUỘC
    "photoCaption": "Cổng gỗ đầu bản, có biển Tà Xùa",
    "guideName": "A Của",
    "guideRating": 4.9
  }
}
```
> **Ràng buộc schema (từ brief mục 4):** `startPoint.photoUrl` **NOT NULL** khi publish cung có hướng dẫn. Server phải chặn publish nếu thiếu ảnh thực địa.

---

## 3. GPX Upload & Kiểm duyệt (Tab 2 — Cấp 2+)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/gpx/upload` | Upload GPX thô (multipart) → server parse, tính km/gain/elevation (PostGIS + DEM), trả preview. |
| POST | `/routes/:id/submit-review` | Gửi cung đi kiểm duyệt. |
| GET | `/admin/reviews` | (Admin) hàng đợi kiểm duyệt. |
| POST | `/admin/reviews/:id/approve` | Duyệt → publish. |
| POST | `/admin/reviews/:id/reject` | Từ chối (kèm lý do). |

**Server-side khi nhận GPX:** validate XML, đếm điểm, tính distance/gain/loss/maxEle (khớp thuật toán `lib/gpx.ts`), lưu `geometry(LineString,4326)`, sinh contour/elevation nếu cần. Lưu file gốc trên object storage.

---

## 4. Mua cung & Thanh toán (Tab 2)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/purchases` | Mua cung. Body `{ routeId, package: "self_gpx"\|"guided" }`. → tạo order. |
| POST | `/purchases/:id/pay` | Khởi tạo thanh toán (VNPay/Momo/Stripe) → trả `paymentUrl` / `deeplink`. |
| GET | `/purchases` | Cung đã mua của tôi (unlock GPX + tạo kênh chat hướng dẫn). |
| POST | `/webhooks/payment` | Webhook cổng thanh toán (server-to-server). |

> Sau khi `guided` thanh toán thành công: server **tự tạo conversation** giữa buyer ↔ guide (mục 6) và mở quyền `GET /routes/:id/gpx`.

---

## 5. Track / Waypoint / Đồng bộ (Tab 3 & 5)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/tracks` | Lưu track đã ghi (GPX/GeoJSON + stats). |
| GET | `/tracks` | Track của tôi. |
| POST | `/tracks/:id/export` | Xuất GPX/KML. |
| POST | `/waypoints` | Tạo waypoint (icon, note, folder, toạ độ). |
| GET/PATCH/DELETE | `/waypoints/:id` | CRUD waypoint. |
| POST | `/sync` | Đồng bộ delta local-first (conflict theo `updatedAt`/version). |

> Chỉ đồng bộ **meta** cho Area offline; KHÔNG đẩy tile/graph lên cloud (docs 03 §7.3).

---

## 6. Nhắn tin (Tab 4) — REST + WebSocket

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/conversations` | Danh sách hội thoại (`isGuide`, `routeName`, `unread`). |
| GET | `/conversations/:id/messages` | Lịch sử tin (phân trang). |
| POST | `/conversations/:id/messages` | Gửi tin (text/ảnh/vị trí/GPX card). |
| WS | `wss://api.potter.vn/ws` | Realtime: `message.new`, `typing`, `location.share`, `presence`. |

**`Message` object:** hỗ trợ `type: "text" | "image" | "location" | "route_card" | "startpoint_card"` (docs 02 Tab 4).

---

## 7. Cộng đồng (Tab 1)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/feed?scope=following\|explore` | Feed bài viết. |
| POST | `/posts` | Đăng bài / check-in (gắn track + ảnh + route ref). |
| GET | `/posts/:id` | Chi tiết + comment. |
| POST | `/posts/:id/like` · `/comment` | Tương tác. |
| POST | `/users/:id/follow` | Follow/unfollow. |

---

## 8. Cấp độ & Premium (Tab 5)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/tiers/criteria` | Tiêu chí thăng cấp + tiến độ hiện tại. |
| POST | `/tiers/upgrade` | Nộp hồ sơ thăng cấp (kèm chấp nhận disclaimer + giấy phép tour cho cấp 3). |
| POST | `/premium/subscribe` | Đăng ký Premium (mở offline + lớp nâng cao). |
| GET | `/offline/areas` · POST `/offline/areas` | Meta gói offline theo Area (chỉ meta, không tile). |

---

## 9. Bản đồ / Hạ tầng tile (KHÔNG qua API app — hạ tầng riêng)

> Không phải REST của backend chính; là dịch vụ tile self-host (xem docs 03 §8).
- **Vector tiles:** Planetiler build từ `vietnam-latest.osm.pbf` → **PMTiles** trên CDN. App trỏ `styleFor()` sang URL này (thay OpenTopoMap/OSM demo hiện tại).
- **DEM terrain-RGB:** Copernicus GLO-30 → terrain-RGB tiles (thay terrarium AWS demo).
- **Routing/snap:** GraphHopper (profile `hike`) → `GET /route`, `POST /match` (map-matching). Có bản embedded cho offline.
- **Vệ tinh (Premium):** nguồn có license (Esri/MapTiler/Bing) + proxy key server-side.

---

## 10. Bảng ánh xạ App ↔ API (để agent Kiểm-tra-chéo dò)

| Màn / file app | Đang dùng MOCK | Endpoint cần nối |
|---|---|---|
| `MapScreen`, `RouteNavigateScreen` | GPX bundle `ta-xua.gpx` | `GET /routes/:id/gpx` |
| `RoutesScreen`, `RouteDetailScreen`, `RouteCard` | `mockRoutes` | `GET /routes`, `/routes/:id`, `/routes/hot` |
| `StartPointScreen` (ảnh XP) | `startPoint.photoUrl=null` | `GET /routes/:id` (photoUrl thật) |
| `RouteDetailScreen` (nút mua) | không thanh toán | `POST /purchases`, `/purchases/:id/pay` |
| `CommunityScreen` | `mockPosts` | `GET /feed`, `POST /posts` |
| `MessagesScreen`, `ChatScreen` | `mockConversations`, `mockChat` | `GET /conversations`, WS |
| `ProfileScreen` | `currentUser`, `mockBadges` | `GET /me` |

---

## 11. Gợi ý PostGIS schema (rút gọn)

```sql
CREATE TABLE routes (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  region        TEXT,
  difficulty    TEXT CHECK (difficulty IN ('easy','standard','hard')),
  distance_m    DOUBLE PRECISION,
  gain_m        DOUBLE PRECISION,
  geom          geometry(LineString, 4326),
  start_point   geometry(Point, 4326) NOT NULL,
  start_photo_url TEXT NOT NULL,          -- BẮT BUỘC (brief mục 4)
  price_vnd     INTEGER,
  owner_id      TEXT REFERENCES users(id),
  status        TEXT DEFAULT 'pending_review',
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_routes_geom ON routes USING GIST (geom);
```

_Hết. Tham chiếu chéo: [[05-synthesis-spec]] §3 (map infra), [[03-map-ux-flows]] §8 (dữ liệu thật)._
