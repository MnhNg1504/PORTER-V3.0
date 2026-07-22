# Changelog — POTTER 3.0

Định dạng theo [Keep a Changelog](https://keepachangelog.com/); phiên bản theo SemVer.

## [Unreleased]

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
