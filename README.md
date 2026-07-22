# POTTER 3.0

**App di động cho cộng đồng trekking/hiking Việt Nam & Đông Nam Á.**
Lõi mạnh nhất là **BẢN ĐỒ THẬT** (ngang tầm AllTrails / Gaia GPS), khác biệt bằng
**marketplace cung đường có hướng dẫn**: người dùng Cấp 2 mở cung từ GPX thật, bán kèm support;
người mua được dẫn tới **điểm xuất phát có ảnh thực địa** rồi đi cung theo track mẫu (turn-by-turn).

> Quyết định đã chốt (docs/05): **React Native (Expo)** · map **MapLibre GL + OSM** · backend **NestJS + PostGIS** · MVP rộng đủ **5 tab**.

## 1. Sản phẩm trong 30 giây

- **5 tab:** Cộng đồng · Cung đường · Bản đồ/Chỉ đường (lõi) · Nhắn tin · Hồ sơ/Cột mốc.
- **Hệ 3 cấp user** (giảm rủi ro pháp lý — docs/04):
  - **Cấp 1 (Mới):** chỉ đi cung Dễ; cung khó bắt buộc có người hướng dẫn (server chặn thật).
  - **Cấp 2 (Kinh nghiệm):** nộp GPX mở cung riêng, **bán cung + support**.
  - **Cấp 3 (Doanh nghiệp/Tour):** tài khoản tổ chức, chạy tour, quản đoàn.
- **Luồng mua cung hướng dẫn:** Bước 1 dẫn tới điểm xuất phát (**bắt buộc có ảnh thực địa**) → Bước 2 đi cung snap theo GPX mẫu, cảnh báo lệch hướng.

## 2. Cấu trúc repo

```
POTTER 3.0/
├─ app/          # App React Native (Expo) — 5 tab, map MapLibre, GPX/nav/contour thật
├─ server/       # Backend NestJS + PostgreSQL/PostGIS — auth, routes, chat, admin API
├─ prototype/    # Demo HTML chạy trình duyệt: map-demo, nav-demo, contour-iso, app-preview
├─ docs/         # Tài liệu thiết kế 00→06 + api-contract.md (hợp đồng API)
├─ 16 Đỉnh Tây Bắc/            # 15 file GPX THẬT các đỉnh Tây Bắc (dữ liệu seed)
├─ BỘ NHẬN DIỆN THƯƠNG HIỆU PORTER/  # Brand: logo, font Young, palette Pine/Lime/Ember
├─ CHANGELOG.md  # Nhật ký thay đổi (Keep a Changelog)
└─ LICENSE       # Proprietary — All rights reserved
```

> `admin/` (web quản trị) **chưa có** — dự kiến GĐ4; API admin đã chạy trong `server/` (duyệt GPX, xử lý report, set tier).

## 3. Quickstart

**App mobile** — xem chi tiết [`app/README.md`](app/README.md):

```bash
cd app && npm install
npx expo prebuild        # MapLibre là native module — KHÔNG chạy trên Expo Go
npx expo run:android     # hoặc run:ios
```

**Backend** — xem chi tiết [`server/README.md`](server/README.md):

```bash
cd server && cp .env.example .env
docker compose up -d db  # PostGIS 16
npm install
npm run migration:run && npm run seed   # schema + 15 cung từ GPX thật
npm run start:dev        # http://localhost:3000/api/v1 — Swagger: /docs
```

## 4. Trạng thái tính năng (tóm tắt từ [docs/06-gap-analysis.md](docs/06-gap-analysis.md))

| Nhóm | Trạng thái | Ghi chú |
|---|---|---|
| Bản đồ thật (MapLibre + OSM + DEM) | ✅ | Tile/hillshade/terrain thật, đã verify |
| GPX import/export + thống kê + turn-by-turn | ✅ | Parser verify với 15 GPX thật; Jest pass |
| Thời tiết + đánh giá an toàn trekking | ✅ | Open-Meteo thật, 7 ngày |
| SOS + chia sẻ vị trí | ✅ | SMS/gọi 112·115·113, GPS thật, không qua server |
| Backend API (auth JWT, routes PostGIS, mua cung, GPX, moderation, admin) | ✅ | NestJS, 3 cấp user enforce server-side |
| Chat realtime + REST | ✅ server / 🟡 app | Socket.IO đủ đã xem/typing/thu hồi; app còn mock |
| Push notification | ✅ server / 🟡 app | Expo Push; app đăng ký token khi build có FCM |
| Đăng nhập Google / Apple | 🟡 | Google code xong chờ `GOOGLE_CLIENT_ID`; Apple stub 501 |
| Hồ sơ, feed cộng đồng, tìm kiếm server | 🟡 | UI có, chờ nối API |
| Upload ảnh/video (storage) | ❌ | GĐ3 |
| Web admin | ❌ | GĐ4 (API đã sẵn) |
| Offline map (PMTiles theo Area), background tracking | ❌ | GĐ5 |
| Thanh toán thật (VNPay/MoMo) | ❌ | Hiện cung 0đ auto-paid |

## 5. Nguyên tắc: MAP THẬT — không fake

Mọi thứ liên quan bản đồ phải là **dữ liệu thật**: tile thật, DEM thật, GPX thật, tính toán thật
(haversine, tổng leo, elevation profile từ `<ele>`, khúc rẽ sinh từ hình học track).
Không dùng ảnh chụp bản đồ, không vẽ sóng độ cao bịa, không hard-code số liệu.

**Nguồn dữ liệu & attribution (bắt buộc giữ khi hiển thị):**

| Nguồn | Dùng cho | Attribution |
|---|---|---|
| [OpenStreetMap](https://www.openstreetmap.org) | Dữ liệu nền đường/địa danh | © OpenStreetMap contributors (ODbL) |
| [OpenFreeMap](https://openfreemap.org) | Vector tiles style sạch | © OpenFreeMap · © OpenMapTiles · © OSM |
| [OpenTopoMap](https://opentopomap.org) | Lớp bình độ (dev/MVP) | © OpenTopoMap (CC-BY-SA) |
| Terrarium DEM (AWS Terrain Tiles) | Hillshade + terrain 3D + contour | Mapzen/AWS Open Data |
| [Open-Meteo](https://open-meteo.com) | Thời tiết 7 ngày theo toạ độ | © Open-Meteo (CC-BY 4.0) |

> Tile OSM/OpenTopoMap public chỉ dùng cho dev (usage policy). Production: self-host **PMTiles** (Planetiler từ Geofabrik VN) + DEM Copernicus GLO-30 — xem docs/03 §8.

## 6. Tài liệu quan trọng

| File | Nội dung |
|---|---|
| [docs/00-brief.md](docs/00-brief.md) | Brief gốc — nguồn ngữ cảnh chung |
| [docs/01-rnd-market-tech.md](docs/01-rnd-market-tech.md) | R&D thị trường + tech stack |
| [docs/02-ux-ui-5tabs.md](docs/02-ux-ui-5tabs.md) | UX/UI 5 tab + design tokens |
| [docs/03-map-ux-flows.md](docs/03-map-ux-flows.md) | Luồng bản đồ: snap, offline, mua cung |
| [docs/04-user-tiers-scoring.md](docs/04-user-tiers-scoring.md) | Hệ 3 cấp user + thang uy tín + pháp lý |
| [docs/05-synthesis-spec.md](docs/05-synthesis-spec.md) | Spec tổng hợp + các quyết định ĐÃ CHỐT |
| [docs/06-gap-analysis.md](docs/06-gap-analysis.md) | Bảng bám tiến độ theo checklist bàn giao |
| [docs/api-contract.md](docs/api-contract.md) | Hợp đồng API + trạng thái triển khai từng endpoint |
| [CHANGELOG.md](CHANGELOG.md) | Nhật ký thay đổi theo ngày |

## 7. Giấy phép

**Proprietary — All rights reserved** (xem [LICENSE](LICENSE)). Không sao chép, phân phối hay sử dụng lại khi chưa có chấp thuận bằng văn bản của chủ dự án.
