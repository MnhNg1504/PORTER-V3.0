# Changelog — POTTER 3.0

Định dạng theo [Keep a Changelog](https://keepachangelog.com/); phiên bản theo SemVer.

## [Unreleased]

### Added — 2026-07-22 (GĐ3 — Thời tiết + SOS)
- **Thời tiết thật** (`lib/weather.ts` + WeatherCard): Open-Meteo không cần key,
  contract test theo response thật; 7 ngày + đánh giá an toàn trekking
  (giông/mưa>30mm/gió>60kmh → khuyến cáo KHÔNG đi cung). Gắn mọi cung (RouteDetail).
- **SOS + chia sẻ vị trí** (`lib/sos.ts` + SosSheet, quyết định docs/05 §5 — SMS/gọi
  112·115·113, KHÔNG qua server): GPS THẬT khi mở sheet (fallback vị trí tuyến),
  toạ độ đọc-qua-điện-thoại, SMS người thân (iOS `&body` vs Android `?body`),
  Share vị trí thường; nút SOS Ember luôn hiện ở màn điều hướng.
- Hồ sơ: thêm `emergencyContact` (TODO(api) lưu server).
- Test: 10 sos + 17 weather — tổng 55/55 pass.

### Added — 2026-07-22 (GĐ1 — Hoàn thiện app)
- **ContourCard "Route covered"** (`src/components/ContourCard.tsx`): thẻ núi bình độ
  isometric trong app RN (react-native-svg) — port thuật toán marching squares +
  chiếu isometric từ prototype sang `src/lib/contour.ts` (thuần hàm, có test).
  Gắn vào RouteDetailScreen cung Tà Xùa với **DEM thật** + **GPX thật**, xoay được.
- **Lưới DEM offline** (`assets/dem/ta-xua-grid.json`, 96×96, 818–2871m, 0 lỗ tile)
  sinh bởi `scripts/gen-dem-grid.mjs` từ terrarium tiles thật (chạy được cho cung khác).
- **GPX export** `toGpxXml()` (checklist §5) — test roundtrip parse lại đúng.
- **Màn Tìm kiếm** (checklist §1): lọc không dấu ("ta xua" khớp "Tà Xùa"),
  vào từ header tab Cung đường; `TODO(api)` nối GET /routes?q=.
- **Jest** (checklist §8 — test tự động): 28 test cho `lib/gpx` (parse trkpt/rtept,
  stats, roundtrip export), `lib/nav` (khúc rẽ chữ L, off-route + hysteresis, ETA),
  `lib/contour` (marching squares kim tự tháp, chiếu iso, màu Lime). 28/28 pass.

### Added — 2026-07-22 (Brand PORTER vào app)
- **Design tokens theo bộ nhận diện PORTER** (`app/src/theme/tokens.ts`):
  Pine `#16281A` · Lime Signal `#C9E265` · Cream `#EAF1E4` · Mist `#A9CDD8`
  · Ember `#FF5233`; kèm `darkColors` (checklist §9 dark mode) và `brandPalette`.
- **Font thương hiệu Young** (Young + Young-Bold-Display) nạp qua expo-font,
  áp vào tiêu đề (ScreenHeader, stack header); logo 6 biến thể vào `assets/brand/`.
- FAB "Xuất phát" đổi sang Lime Signal (CTA thương hiệu), chữ Pine.
- Prototype `contour-iso.html` đồng bộ brand: nền Pine, contour glow Lime,
  pin Ember/Mist/Gold, tiêu đề Young Display (verify canvas: 1510 px lime, 0 cyan).

### Fixed — 2026-07-22
- App typecheck sạch với dependency thật (1.198 gói): bỏ `Terrain`/`RasterDemSource`
  (không tồn tại trong @maplibre/maplibre-react-native v10 — 3D chuyển sang camera
  pitch + TODO(native)), `useRef<CameraRef>`, export `Difficulty` từ mockData.

### Added — 2026-07-22 (GĐ2 — Backend scaffold)
- **Backend `server/`** (NestJS + TypeORM + PostgreSQL/PostGIS, typecheck 0 lỗi):
  - Auth: email + JWT access/refresh (hash trong DB), bcrypt, khoá 15' sau 5 lần
    sai, throttle login; guards `@Roles` + `@MinTier` enforce hệ 3 cấp docs/04.
  - Routes (PostGIS LineStringZ thật; track GeoJSON chỉ trả khi miễn phí/đã mua,
    cờ `requiresGuide` cho Cấp 1 × cung khó), GPX submit + kiểm duyệt,
    Purchases (chặn Cấp 1 mua cung Khó), Moderation (report/block), Admin API,
    Chat gateway Socket.IO (join/message/typing/presence).
  - Migration schema đầy đủ (index GIST) + seed 15 cung từ GPX thật
    (parser verify: Fansipan 9.541 điểm/24km/+3264m — khớp prototype).
  - docker-compose (PostGIS 16) + Dockerfile + Swagger `/docs` + `.env.example`.

### Added — 2026-07-22
- **Tài liệu thiết kế** (`docs/00` → `05`): brief gốc, R&D thị trường + tech stack,
  UX/UI 5 tab, luồng bản đồ (snap/offline/mua cung), hệ 3 cấp user + thang điểm,
  spec tổng hợp đã chốt (React Native · MapLibre · MVP rộng 5 tab).
- **Hợp đồng API** (`docs/api-contract.md`): auth, routes, GPX upload/duyệt,
  mua cung, track/waypoint, chat, community, tier — kèm gợi ý schema PostGIS.
- **Prototype map thật** (`prototype/`): `map-demo.html` (contour + 3D DEM +
  15 đỉnh Tây Bắc), `nav-demo.html` (vector xanh-sạch + card turn-by-turn +
  mô phỏng dẫn đường), `contour-iso.html` (contour isometric glow cyan từ DEM thật).
- **App React Native** (`app/`): Expo + `@maplibre/maplibre-react-native`,
  bottom nav 5 tab + FAB "Xuất phát", lib `gpx.ts`/`nav.ts` (parse GPX thật,
  thống kê leo/độ cao, sinh khúc rẽ), theme tokens, mock data đánh dấu `TODO(api)`.
- **Dữ liệu thật**: 15 file GPX các đỉnh Tây Bắc (`16 Đỉnh Tây Bắc/`).
- Nền repo: `.gitignore`, `LICENSE` (proprietary), `CHANGELOG.md`,
  `docs/06-gap-analysis.md` (bảng bám checklist bàn giao).
