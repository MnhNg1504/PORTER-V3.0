# POTTER 3.0 — App mobile trekking (React Native + Expo)

Khung dự án THẬT cho app cộng đồng trekking. Lõi mạnh nhất = **bản đồ THẬT** (MapLibre + OSM/OpenFreeMap + DEM), khác biệt = **cung có hướng dẫn + ảnh điểm xuất phát**.

> Quyết định đã chốt (docs/05): **React Native**, map = `@maplibre/maplibre-react-native`, MVP rộng đủ **5 tab**.

## 1. Vì sao Expo (không phải bare)

Chọn **Expo (managed + config plugin)** vì:
- Dựng/chạy nhanh, quản lý native deps qua config plugin (`app.json`).
- `@maplibre/maplibre-react-native`, `expo-location`, `react-native-svg` đều có plugin/hỗ trợ Expo.

**QUAN TRỌNG:** MapLibre là **native module** → **KHÔNG chạy được trên Expo Go**. Bắt buộc dùng **development build** (prebuild + build native). Xem mục 3.

## 2. Yêu cầu môi trường

- Node 18+ (đã test Node 24), npm.
- Android Studio (Android SDK) hoặc Xcode (iOS) để build native.
- Thiết bị thật / emulator có GPS để test định vị.

## 3. Cài & chạy

```bash
cd app
npm install

# Sinh thư mục native (android/ios) từ app.json + config plugins
npx expo prebuild

# Chạy trên Android (thiết bị/emulator đã kết nối)
npx expo run:android
# hoặc iOS (macOS)
npx expo run:ios

# Sau lần build đầu, chạy dev server:
npm start          # = expo start --dev-client
```

Kiểm tra kiểu TypeScript:
```bash
npm run typecheck
```

## 4. Cấu trúc thư mục

```
app/
├─ App.tsx                    # điểm gốc (GestureHandler + SafeArea + Navigation)
├─ index.ts                   # registerRootComponent
├─ app.json                   # cấu hình Expo + config plugin MapLibre/Location + quyền GPS
├─ metro.config.js            # thêm 'gpx' vào assetExts để bundle GPX thật
├─ babel.config.js            # alias "@/..." -> src/
├─ tsconfig.json
├─ assets/gpx/ta-xua.gpx      # 1 cung GPX THẬT (Tà Xùa) bundle sẵn
└─ src/
   ├─ theme/                  # design tokens (docs/02): màu/typography/spacing/touch target
   │  ├─ tokens.ts
   │  └─ index.ts             # + helper độ khó (Dễ/Chuẩn/Khó)
   ├─ lib/
   │  ├─ gpx.ts               # THẬT: parseGPX, haversine, computeStats, positionAt, GeoJSON
   │  ├─ nav.ts               # THẬT: sinh khúc rẽ, off-route detection, grade->màu, ETA
   │  ├─ gpxAsset.ts          # nạp GPX bundle qua expo-asset + file-system
   │  ├─ mapStyles.ts         # style MapLibre thật (Sạch/Bình độ/Vệ tinh) + DEM
   │  └─ mockData.ts          # MOCK cho UI các tab (mọi chỗ có TODO(api))
   ├─ components/             # RouteCard, DifficultyChip, StatCell, ElevationProfile, ScreenHeader
   ├─ navigation/             # RootNavigator (stack) + BottomTabs (5 tab + FAB giữa) + types
   └─ screens/
      ├─ community/           # Tab 1 — feed + post card
      ├─ routes/              # Tab 2 — list, chi tiết, "Dẫn tới điểm xuất phát"
      ├─ map/                 # Tab 3 — MapScreen (kỹ nhất) + RouteNavigateScreen (BƯỚC 2)
      ├─ messages/            # Tab 4 — list + chat
      └─ profile/             # Tab 5 — hồ sơ + cột mốc + R&D
```

## 5. Phần nào THẬT / phần nào MOCK

### ✅ THẬT (không fake)
- **Map:** `MapView` MapLibre render tile OSM/OpenFreeMap/OpenTopoMap/Esri thật + DEM terrarium (hillshade + terrain 3D).
- **GPX:** cung Tà Xùa là file GPX thật (7.813 điểm). `parseGPX` đã verify: **20.0 km, +2.289 m leo, đỉnh 2.875 m**.
- **Tính toán:** khoảng cách (haversine), tổng leo/xuống, elevation profile (tô màu theo độ dốc thật), khúc rẽ turn-by-turn sinh từ hình học thật, off-route detection cục bộ — tất cả trong `src/lib/`.
- **GPS:** nút định vị dùng `expo-location` + `UserLocation` của MapLibre (mũi tên hướng thật).
- **Elevation profile:** vẽ từ `<ele>` trong GPX, không phác thảo sóng bịa.

### 🟡 MOCK (đánh dấu `// TODO(api):`)
- Danh sách cung, feed cộng đồng, hội thoại/chat, hồ sơ, huy hiệu (`src/lib/mockData.ts`).
- Ảnh cung / ảnh hero / ảnh điểm xuất phát: hiện là khối placeholder (ảnh thật lấy từ CDN qua API).
- Thanh toán, kiểm duyệt GPX, thăng cấp, Premium: chỉ có UI/khung.
- Điều hướng BƯỚC 2 hiện dùng **mô phỏng** chạy dọc tuyến; production thay bằng GPS thật + off-route realtime.

Xem `docs/api-contract.md` để biết endpoint cần nối cho từng phần.

## 6. Hạn chế / việc còn lại (bàn giao agent Kiểm-tra-chéo)

1. **Chưa `npm install` trong môi trường tạo** — cần cài deps & prebuild để build native. Phiên bản trong `package.json` khớp Expo SDK 51; nếu đổi SDK phải chỉnh version tương ứng.
2. **API MapLibre RN** (`@maplibre/maplibre-react-native` v10) có thể lệch tên prop/component theo bản phát hành (vd `mapStyle` vs `styleURL`, `RasterDemSource`/`Terrain`). Cần chạy thật để chốt và tinh chỉnh.
3. **Tile demo dùng OpenTopoMap/tile.osm.org** có usage policy — chỉ cho dev. Production phải trỏ sang PMTiles self-host (Planetiler) + DEM Copernicus (xem `mapStyles.ts` TODO).
4. **RouteNavigate** mới nạp GPX Tà Xùa cho mọi routeId (chỉ có 1 GPX bundle). Nối `GET /routes/:id/gpx` để đúng cung.
5. **Chưa làm:** ghi track nền (background location), snap-to-trail GraphHopper, tải offline theo Area, planner (out-and-back/undo), export GPX/KML, layers opacity/z-order đầy đủ — đã có chỗ đặt UI, cần code logic.
6. **Icon/emoji tab** dùng tạm emoji; production thay bằng icon vector set.
7. **Chưa có test tự động**; logic `lib/gpx.ts` & `lib/nav.ts` là thuần hàm, dễ viết unit test (khuyến nghị thêm Jest).
```
```
