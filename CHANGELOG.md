# Changelog — POTTER 3.0

Định dạng theo [Keep a Changelog](https://keepachangelog.com/); phiên bản theo SemVer.

## [Unreleased]

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
