# POTTER 3.0 — Đặc tả UX & Logic Bản đồ (Tab 3)

> Agent phụ trách: **MAP-UX**. Nguồn ngữ cảnh: [[00-brief]] (mục 4 & mục 6).
> Map engine đã chốt: **MapLibre GL + OpenStreetMap**, routing/snap qua **GraphHopper hoặc OSRM**.
> Ngôn ngữ: Tiếng Việt (thuật ngữ kỹ thuật giữ nguyên tiếng Anh).
> Phạm vi file: thao tác bản đồ, tracking, điều hướng, snap-to-trail, luồng mua cung, offline, waypoint, xuất/nhập.
>
> ⚠️ **RÀNG BUỘC TỐI THƯỢNG (từ User — ưu tiên cao nhất):** Sản phẩm dùng **BẢN ĐỒ THẬT, KHÔNG fake / KHÔNG mock**. Mọi tile, GPS, routing/snap, offline, elevation phải chạy trên **dữ liệu & dịch vụ thật**. Xem **§8 — Dữ liệu & dịch vụ THẬT** (nguồn cụ thể + cảnh báo dữ liệu VN).

---

## 0. Nguyên tắc thiết kế chung

- **One-hand friendly:** mọi thao tác chính phải với tới bằng ngón cái khi cầm điện thoại một tay (cụm nút gom về **cạnh phải** và **cạnh dưới**).
- **Map-first:** bản đồ chiếm toàn màn hình; UI nổi (floating) trên map, nền mờ, không che tuyến đang đi.
- **Ngón tay > menu:** ưu tiên gesture cho thao tác tần suất cao (pan/zoom/rotate); nút bấm cho thao tác chính xác/ít lặp (re-center, đo, lớp).
- **Trạng thái luôn hiển thị:** GPS accuracy, còn/mất sóng, còn/mất GPS, đang ghi track hay không — luôn có chỉ báo.
- **Fail-safe:** mất GPS/mất sóng KHÔNG làm mất dữ liệu track đang ghi; mọi thứ ghi cục bộ trước, đồng bộ sau.

### Bản đồ vùng chạm (bố cục màn hình dọc)

```
┌─────────────────────────────┐
│ [Search cung/địa danh]  [⚙] │  ← top bar (mờ, tự ẩn khi đi)
│                             │
│                             │
│           BẢN ĐỒ            │     ┌──────┐ cụm nút phải:
│                             │     │  3D  │  ← 2D/3D
│                             │     │  ▲▲  │  ← elevation/phân tích đồ
│                             │     │ km|  │  ← mốc km / grid
│                             │     │  🧭  │  ← la bàn (reset bearing)
│                             │     │  ◎   │  ← 居中 / re-center
│                             │     └──────┘
│  [◀ elevation profile ▶]    │  ← panel kéo lên từ đáy
│ [ Bắt đầu ] [ + ] [ Lớp ]   │  ← action bar dưới
└─────────────────────────────┘
```

> Cụm nút phải mô phỏng bố cục 2bulu: **3D video / phân tích đồ / mốc km / 居中 (re-center)**.

---

## 1. Thao tác bản đồ cơ bản

### 1.1 Gesture (cử chỉ)

| Gesture | Hành vi | Ghi chú |
|---|---|---|
| 1 ngón kéo | Pan (di chuyển map) | |
| Pinch 2 ngón | Zoom in/out | Zoom quanh tâm 2 ngón |
| Double-tap | Zoom in 1 bậc | Tap-and-hold rồi kéo dọc = zoom mượt (one-hand) |
| 2 ngón xoay | Rotate (đổi bearing) | Có haptic nhẹ khi về đúng hướng Bắc |
| 2 ngón kéo dọc | Tilt (đổi pitch 0–60°) | Vào chế độ nghiêng/2.5D–3D |
| 1 ngón tap giữ | Đặt điểm tạm (waypoint nhanh / điểm A-B) | |
| 2 ngón tap | Zoom out 1 bậc | |

MapLibre GL đã hỗ trợ sẵn phần lớn gesture này qua `dragPan`, `touchZoomRotate`, `dragRotate` — chỉ cần cấu hình ngưỡng cho phù hợp mobile.

### 1.2 Cụm nút điều khiển (cạnh phải)

| Nút | Chức năng | Trạng thái |
|---|---|---|
| **◎ Re-center (居中)** | Đưa map về vị trí hiện tại | 3 chế độ toggle: **Free → Follow (theo vị trí) → Follow+Bearing (xoay theo hướng đi)**. Icon đổi theo chế độ. |
| **🧭 La bàn** | Chạm để reset bearing về Bắc (pitch giữ nguyên); chạm giữ = reset cả pitch=0 | Chỉ hiện khi bearing ≠ 0. Kim đỏ chỉ Bắc. |
| **3D** | Chuyển 2D ⇄ 3D (pitch 0 ⇄ 60°, bật terrain 3D) | Cần DEM/terrain tile (xem §2.4). |
| **▲▲ Phân tích đồ** | Mở/đóng elevation profile panel | Đồng bộ với tuyến đang chọn. |
| **km‖ Mốc km / Grid** | Bật/tắt nhãn cột mốc km dọc tuyến + lưới toạ độ | Toggle 3 mức: off → mốc km → mốc km + grid. |

**Quy tắc "Follow":** khi user tự pan map trong lúc đang Follow → tự chuyển về **Free** và hiện nút ◎ nhấp nháy nhẹ để nhắc quay lại. Sau 8s không tương tác (tuỳ chọn) có thể auto quay lại Follow.

### 1.3 Đo khoảng cách (ad-hoc measure)

- Vào từ menu ⚙ hoặc long-press → "Đo".
- Chạm để thả các điểm; hiển thị **tổng cự ly** + **cự ly từng đoạn** realtime.
- Nút **Undo điểm cuối**, **Xoá hết**, **Chốt thành route** (chuyển sang tính năng lập lộ trình §3).
- Hiển thị cả **elevation gain** ước tính nếu có DEM.

### 1.4 Trạng thái lỗi cơ bản

| Lỗi | Biểu hiện | Xử lý UX |
|---|---|---|
| Mất GPS / accuracy kém (>50m) | Chấm vị trí chuyển vàng/xám, vòng accuracy phình to | Banner "Tín hiệu GPS yếu — đang dùng vị trí gần đúng". Vẫn cho pan/xem map. |
| Không quyền định vị | Nút ◎ mờ | Dialog xin quyền + link tới Settings. Map vẫn dùng được ở chế độ Free. |
| Mất sóng mạng (chưa tải offline) | Tile hiện ô xám/blur | Banner "Ngoài vùng phủ sóng — tải Area offline để dùng tiếp" (§5). Tile đã cache vẫn hiển thị. |

---

## 2. Lớp & Overlay (Layers)

### 2.1 Base layer (chọn 1)

| Lớp | Nguồn dữ liệu | Dùng khi |
|---|---|---|
| **Đường bộ (Street/OSM)** | OSM raster/vector tiles (tự host) | Mặc định, đô thị & tiếp cận. |
| **Địa hình (Topo)** | OSM + contour lines + hillshade (từ DEM) | Trekking, xem dốc/đường mòn. |
| **Vệ tinh (Satellite)** | Ảnh vệ tinh (nguồn cấp phép, ví dụ Esri/Mapbox Satellite hoặc nguồn OSS) | Đối chiếu địa hình thực, nhận diện điểm mốc. |
| **Vệ tinh + nhãn (Hybrid)** | Satellite + vector labels overlay | Vừa ảnh thật vừa tên đường/địa danh. |

### 2.2 Overlay (bật/tắt độc lập, xếp chồng)

- **Waypoints** — điểm do user/hệ thống đặt (icon tuỳ chỉnh).
- **Tracks** — vệt GPS đã ghi (của user / của cung mẫu).
- **Routes** — lộ trình đã lập/mua (đường dẫn hướng).
- **Grid toạ độ** — lưới lat/lon hoặc UTM/MGRS (tuỳ chọn hệ).
- **Cột mốc km** — nhãn mốc dọc tuyến.
- **Cung công khai / Heatmap cộng đồng** — mật độ tuyến phổ biến (từ dữ liệu chia sẻ).

### 2.3 Layer manager (bảng quản lý lớp)

- Danh sách lớp có **toggle bật/tắt** + **thanh trượt opacity (0–100%)** từng lớp.
- **Kéo–thả để đổi thứ tự xếp chồng** (z-order): lớp trên cùng đè lớp dưới.
- Kiến trúc kỹ thuật: mỗi overlay là một (hoặc cụm) **MapLibre layer** trên cùng style; opacity map vào `raster-opacity` / `line-opacity` / `fill-opacity`; z-order điều khiển bằng thứ tự `addLayer`/`moveLayer`.
- Nhóm "Premium": vệ tinh độ phân giải cao, topo nâng cao, heatmap → khoá theo gói (xem [[00-brief]] mục 6).

### 2.4 3D / Terrain

- Nguồn: **DEM tiles** (terrain-RGB) → MapLibre `setTerrain({ source, exaggeration })`.
- Nút 3D bật terrain + pitch; hillshade layer cho cảm giác khối núi.
- Trên máy yếu: cho phép hạ `exaggeration` hoặc tắt terrain, giữ 2.5D (chỉ pitch, không nâng địa hình).

---

## 3. Snap-to-trail & Lập lộ trình

### 3.1 Dữ liệu cần

| Dữ liệu | Vai trò | Nguồn |
|---|---|---|
| **Mạng lưới trail (trail network)** | Tập đường mòn/đường đi được để snap & định tuyến | OSM (`highway=path/footway/track`, `sac_scale`, …) đã lọc cho hiking. |
| **Routing graph** | Đồ thị định tuyến A→B | Build từ OSM bằng **GraphHopper** (profile `hike/foot`) hoặc **OSRM** (profile foot). |
| **DEM / elevation** | Tính độ dốc, tổng leo, elevation profile | SRTM/ASTER/nguồn DEM; GraphHopper hỗ trợ elevation sẵn. |
| **Routing graph offline** | Định tuyến khi mất sóng | Xuất graph theo Area (§5) nhúng trong gói offline. |

> **Khuyến nghị:** dùng **GraphHopper** làm engine chính vì hỗ trợ profile hiking + elevation + có bản offline/nhúng (GraphHopper Android/embedded) tốt hơn cho snap-to-trail. OSRM là phương án dự phòng/độ trễ thấp.

### 3.2 Cơ chế snap

- Khi user thả điểm gần một trail (trong bán kính ~25m), điểm được **snap vào node/edge gần nhất** của routing graph (map-matching).
- Nếu ngoài mạng trail → giữ điểm tự do (freehand) và cảnh báo "Đoạn này ngoài đường mòn — sẽ tính đường thẳng".
- Snap có 2 chế độ: **Snap-to-trail (bám mòn)** ⇄ **Freehand (vẽ tự do)** — nút chuyển nhanh.

### 3.3 Lập lộ trình (route planner)

Các bước:
1. Chọn điểm **A** (tap hoặc "vị trí hiện tại").
2. Chọn điểm **B** → hệ thống **autocalculated**: gọi routing engine tính tuyến bám trail A→B.
3. Thêm điểm giữa (via) → tuyến tự tính lại từng đoạn.
4. Công cụ:
   - **Undo từng đoạn** — bỏ điểm/đoạn vừa thêm (stack lịch sử).
   - **Out-and-back** — nhân đôi tuyến đi rồi quay lại y hệt.
   - **Back-to-start** — nối điểm cuối về điểm đầu (tạo vòng khép kín, tự định tuyến đoạn nối).
   - **Reverse** — đảo chiều tuyến.
5. Hiển thị realtime: **tổng cự ly, tổng leo (m), tổng xuống (m), độ dốc max, thời gian ước tính**.
6. Lưu route → đặt tên, gán folder, chọn màu.

### 3.4 Elevation profile

- Panel kéo từ đáy: trục X = cự ly, trục Y = cao độ.
- **Tô màu theo độ dốc:** đỏ = dốc gắt (>25%), cam = trung bình, **xanh = phẳng/thoải**. Gradient theo ngưỡng cấu hình.
- Chạm vào profile → con trỏ đồng bộ hiện vị trí tương ứng trên map (và ngược lại).
- Hiển thị: điểm cao nhất/thấp nhất, tổng gain/loss, các đoạn dốc.

### 3.5 Trạng thái lỗi (planner)

| Lỗi | Xử lý |
|---|---|
| Routing engine không trả tuyến (không có đường) | Fallback đường thẳng + cảnh báo "Không tìm được đường mòn nối 2 điểm". |
| Mất sóng, chưa có graph offline | Cho vẽ freehand, tắt autocalculated, banner nhắc tải offline. |
| Điểm nằm ngoài vùng có DEM | Ẩn/đánh dấu "?" phần elevation, vẫn tính được cự ly. |

---

## 4. LUỒNG QUAN TRỌNG — Mua cung hướng dẫn (State machine)

> Bám sát [[00-brief]] mục 4. Sau khi user MUA cung, luồng gồm **2 bước lớn**: (1) Dẫn tới điểm xuất phát, (2) Đi cung theo track mẫu.

### 4.0 Sơ đồ trạng thái tổng

```
[PURCHASED]
    │  mở cung
    ▼
[NAV_TO_START] ──(tới gần <300m)──► [APPROACHING_START] ──(tới nơi <30m)──► [AT_START]
    │  (mất GPS / lệch)                                                          │ xác nhận ảnh thực địa khớp
    ▼                                                                            ▼
[RECOVER]  ◄──────────────────────────────────────────────────────────────  [ON_ROUTE]
                                                             ┌── off-route ──► [OFF_ROUTE] ──back-on──► [ON_ROUTE]
                                                             │── mất GPS ────► [GPS_LOST] ──lấy lại──► [ON_ROUTE]
                                                             └── tới đích ───► [FINISHED]
```

### 4.1 BƯỚC 1 — Dẫn tới ĐIỂM XUẤT PHÁT

**Mục tiêu:** đưa user từ vị trí hiện tại → điểm bắt đầu cung, xác nhận đúng chỗ bằng **ảnh thực địa**.

Trạng thái & bước:

1. **NAV_TO_START**
   - Tính tuyến từ vị trí hiện tại → toạ độ điểm xuất phát (routing bám trail nếu trong mạng, hoặc đường bộ nếu đang ở khu dân cư).
   - Hiển thị: mũi tên hướng, cự ly còn lại, ETA, hướng đi bước kế.
   - Thẻ nổi "Điểm xuất phát" luôn có **thumbnail ẢNH thực địa**; chạm để xem ảnh lớn + mô tả ("bãi gửi xe cạnh cổng đá", …).
2. **APPROACHING_START** (khi còn <300m)
   - Cảnh báo rung + tiếng: "Sắp tới điểm xuất phát (còn 280m)".
   - **Mở lớn ảnh thực địa** để user vừa đi vừa đối chiếu khung cảnh.
3. **AT_START** (khi <30m và tốc độ ~0)
   - Thông báo "Bạn đã tới điểm xuất phát".
   - Hiển thị **ảnh thực địa side-by-side với camera/khung cảnh trước mặt** (tuỳ chọn mở camera) để đối chiếu.
   - Nút xác nhận: **"Đúng điểm này — Bắt đầu đi cung"** / **"Không giống — Xem chỉ dẫn"**.
   - Nếu "Không giống" → hiển thị ảnh + mô tả chi tiết + toạ độ + nút gọi/nhắn người bán/hướng dẫn ([[00-brief]] Tab 4).

Trạng thái lỗi (Bước 1):

| Lỗi | Xử lý |
|---|---|
| Mất GPS giữa đường | Chuyển **RECOVER**: giữ tuyến, hiện la bàn + hướng thô tới điểm xuất phát, banner "Mất GPS — dùng la bàn tạm". |
| Mất sóng | Nếu đã tải Area offline → tiếp tục bình thường; nếu chưa → dùng tile cache + tuyến thẳng, nhắc tải offline. |
| Đi sai hướng > ngưỡng | Nhắc "Bạn đang đi xa điểm xuất phát" + re-route. |
| Không có ảnh thực địa (thiếu dữ liệu cung) | Chặn bán/hiện cảnh báo cho người bán ở khâu tạo cung (đây là dữ liệu BẮT BUỘC theo brief). |

### 4.2 BƯỚC 2 — Đi cung (navigate theo GPX track mẫu)

**Mục tiêu:** dẫn user theo **track mẫu (GPX)** của cung, snap vào tuyến, cảnh báo lệch hướng.

1. **ON_ROUTE**
   - Load **GPX track mẫu** của cung → hiển thị làm route chính (màu nổi bật).
   - Vị trí user được **snap/map-match** vào track khi ở trong hành lang (corridor ~30–50m).
   - HUD hiển thị: **cự ly còn lại tới đích**, **ETA**, **tổng leo còn lại**, **cột mốc km kế tiếp**, cảnh báo điểm nguy hiểm/waypoint hệ thống (nếu cung có).
   - Elevation profile hiện đoạn sắp tới; đoạn dốc đỏ báo trước.
2. **OFF_ROUTE** (lệch > ngưỡng, ví dụ >50m khỏi track trong >X giây)
   - Cảnh báo rung + tiếng + banner đỏ: **"Bạn đã lệch tuyến — quay lại đường mòn"**.
   - Hiển thị **mũi tên + cự ly ngắn nhất trở lại track** (điểm re-join gần nhất).
   - Không tự đổi track mẫu; chỉ dẫn user quay lại. Ghi lại điểm lệch để review sau.
3. **GPS_LOST**
   - Giữ vị trí cuối, chuyển sang la bàn + dead-reckoning thô (nếu có), banner "Mất GPS".
   - Vẫn hiển thị track mẫu để user tự bám địa hình.
4. **FINISHED** (tới cuối track)
   - Thông báo hoàn thành, tổng kết: cự ly, thời gian, tổng leo, so với track mẫu.
   - Lưu vào **cột mốc/thành tích** ([[00-brief]] Tab 5), gợi ý đăng feed (Tab 1).

Trạng thái lỗi (Bước 2):

| Lỗi | Xử lý |
|---|---|
| Off-route lặp lại nhiều lần | Nâng cấp cảnh báo (âm to hơn), gợi ý liên hệ hướng dẫn (Tab 4). |
| Mất sóng | Dùng gói offline (GPX + tile + graph đã tải); off-route detection vẫn chạy cục bộ (so khớp với GPX local). |
| Pin yếu | Chế độ tiết kiệm: giảm tần suất render, tắt 3D, vẫn ghi track. |
| Dừng lâu bất thường | (Tuỳ chọn an toàn) nhắc "Bạn ổn chứ?" + nút chia sẻ vị trí khẩn (nếu bật SOS). |

> **Ghi chú off-route detection:** so khoảng cách vuông góc từ vị trí (đã lọc nhiễu) tới polyline GPX; dùng hysteresis (ngưỡng vào > ngưỡng ra) để tránh cảnh báo rung lắc. Chạy hoàn toàn cục bộ, không cần mạng.

---

## 5. Offline

### 5.1 Luồng tạo gói offline (Area)

1. **Chọn "Tải bản đồ offline"** → vào chế độ chọn Area.
2. **Vẽ/khoanh vùng** (khung chữ nhật kéo giãn hoặc quanh 1 cung đã chọn — auto bao track + biên đệm).
3. **Chọn lớp** cần lưu (topo / vệ tinh / đường bộ — có thể nhiều).
4. **Chọn độ phân giải / zoom range** (Standard / High) — hiện ước lượng **dung lượng** & **số tile**.
5. **Tích "Include data to create and navigate routes offline"** → kèm **routing graph + DEM** của vùng để snap/route/elevation hoạt động khi mất sóng.
6. **Tải** → thanh tiến trình; cho phép tải nền, tạm dừng/tiếp tục.
7. **Kiểm tra bằng Airplane mode:** hướng dẫn user bật máy bay → mở Area → xác nhận map hiển thị, lập route được, elevation có. Hiện checklist "✔ Tile ✔ Routing ✔ Elevation".

### 5.2 Cấu trúc lưu trữ offline (đề xuất)

```
/offline
  /areas/{areaId}/
    meta.json           # tên, bbox, lớp, zoom range, ngày tải, version
    tiles/              # MBTiles hoặc PMTiles cho từng base layer
      street.pmtiles
      topo.pmtiles
      satellite.pmtiles
    terrain/dem.pmtiles # DEM cho 3D + elevation
    routing/graph.ghz   # GraphHopper graph (hoặc OSRM .osrm) của vùng
    gpx/{cungId}.gpx    # track mẫu các cung trong vùng (nếu đã mua)
    waypoints.db        # waypoint/route offline (SQLite)
```

- **Tile:** khuyến nghị **PMTiles** (1 file, đọc theo range, không cần server) hoặc **MBTiles**.
- **Routing offline:** graph GraphHopper cắt theo bbox; nạp bằng engine embedded.
- Gói offline gắn **Premium** ([[00-brief]] mục 6).

### 5.3 Trạng thái lỗi (offline)

| Lỗi | Xử lý |
|---|---|
| Hết dung lượng máy | Chặn tải, hiện dung lượng cần vs còn trống, gợi ý xoá Area cũ. |
| Tải dở dang / mất mạng khi tải | Lưu tiến trình, cho **resume**; đánh dấu Area "chưa hoàn tất". |
| Tile lỗi/thiếu ở zoom sâu | Hiện tile zoom thấp gần nhất (overzoom) thay vì ô trống. |
| Graph offline thiếu → không route được | Cho freehand + cảnh báo; nhắc tải lại kèm tùy chọn routing. |
| Area quá cũ (dữ liệu OSM đổi) | Nhắc "Bản đồ vùng này đã có cập nhật — tải lại?". |

---

## 6. Waypoint khi đang đi

### 6.1 Luồng đặt waypoint nhanh

1. Nút **"+"** trên action bar (luôn với tới bằng ngón cái).
2. Mặc định đặt tại **vị trí hiện tại** (hoặc kéo ghim trên map để chỉnh).
3. **Chọn icon:** lều 🏕, ống nhòm/điểm ngắm cảnh, nước 💧, nguy hiểm ⚠, hang, đỉnh, ngã rẽ, chụp ảnh… (bộ icon phân loại).
4. Nhập **tên / ghi chú / màu**.
5. **Lưu vào folder** (mặc định "Chuyến hiện tại"; có thể chọn/ tạo folder).
6. Đồng bộ khi có mạng (§7); offline thì lưu local, cờ "chờ sync".

- **Đặt nhanh không rời màn đi:** long-press "+" → thả waypoint mặc định (icon "chấm") tức thì, chỉnh chi tiết sau.
- Waypoint hiển thị ngay trên map (overlay Waypoints) và trong danh sách chuyến.

### 6.2 Trạng thái lỗi (waypoint)

| Lỗi | Xử lý |
|---|---|
| Mất GPS khi đặt | Cho đặt bằng cách kéo ghim thủ công + nhãn "vị trí ước tính". |
| Chưa có mạng | Lưu local, cờ "pending sync", đồng bộ tự động khi có mạng. |
| Trùng/nhầm | Undo xoá waypoint vừa tạo; sửa được icon/tên/màu/folder sau. |

---

## 7. Xuất/Nhập GPX/KML & Đồng bộ web↔mobile

### 7.1 Xuất (Export)

- Đối tượng xuất: **track đã ghi, route đã lập, tập waypoint, cả folder**.
- Định dạng: **GPX** (track/route/waypoint), **KML/KMZ** (chia sẻ, xem trên Google Earth).
- Chia sẻ qua: file, link cung công khai, gửi trong chat (Tab 4).

### 7.2 Nhập (Import)

- Nhận **GPX/KML/KMZ** từ file/link/chat.
- Tự phân loại thành track/route/waypoint; cho **preview trên map trước khi lưu**; chọn folder đích.
- Có thể **dùng GPX nhập làm route dẫn đường** (giống track mẫu cung).

### 7.3 Đồng bộ web↔mobile

- Mô hình: dữ liệu người dùng (waypoint, route, track, folder, Area meta) lưu **local-first**, đồng bộ 2 chiều với backend.
- **Conflict resolution:** theo `updatedAt` + version; nếu xung đột thực sự → giữ cả hai (đánh dấu "bản đồng bộ").
- Tile/graph offline **không** sync qua tài khoản (dung lượng lớn) — chỉ sync **meta Area** để máy khác biết & tự tải lại.
- Trạng thái sync hiển thị: đã đồng bộ / đang đồng bộ / chờ mạng / lỗi (retry).

### 7.4 Trạng thái lỗi (sync/import)

| Lỗi | Xử lý |
|---|---|
| File GPX/KML hỏng | Báo lỗi cụ thể (dòng/thẻ), cho nhập phần đọc được. |
| Sync fail (mạng/timeout) | Retry nền + hàng đợi; không mất dữ liệu local. |
| Xung đột phiên bản | Giữ cả hai, cho user chọn bản giữ lại. |

---

## 8. Dữ liệu & dịch vụ THẬT (không mock — bắt buộc)

> Mục này khoá lại nguồn dữ liệu/dịch vụ thật cho từng tính năng. **Không phần nào được giả lập.** Nếu VN thiếu dữ liệu → dùng phương án thật thay thế nêu ở §8.7.

### 8.1 Tile bản đồ THẬT

| Yếu tố | Chốt thực tế |
|---|---|
| Engine | **MapLibre GL** (vector rendering). |
| Nguồn dữ liệu | **OpenStreetMap** thật (planet hoặc extract **Việt Nam** từ Geofabrik: `vietnam-latest.osm.pbf`). |
| Cách phục vụ | **Tự host** vector tiles (khuyến nghị chính, kiểm soát chi phí theo brief): dựng MBTiles/PMTiles từ OSM bằng **Planetiler** (hoặc OpenMapTiles), phục vụ qua **Martin / TileServer GL / tegola**, style vector **OpenMapTiles schema** (`positron/basic/topo`). |
| Nguồn dịch vụ (dự phòng/khởi động nhanh) | **MapTiler** hoặc **Stadia Maps** (có gói OSM vector thật, có VN) — dùng khi chưa kịp tự host; vẫn là tile OSM thật, không fake. |
| Zoom range | Vector tile z0–z14 (overzoom hiển thị tới z18–20); topo/contour tách source riêng. |
| Địa hình (Topo) | Contour lines sinh từ DEM thật (§8.5) + hillshade; **không** vẽ tay. |

> **Dữ liệu thật cần có:** OSM extract VN (Geofabrik), pipeline Planetiler, máy chủ tile (hoặc tài khoản MapTiler/Stadia). Ảnh vệ tinh cần **license riêng** (Esri/MapTiler Satellite/Bing) — không có trong OSM.

### 8.2 GPS THẬT

| Yếu tố | Chốt thực tế |
|---|---|
| Nguồn vị trí | GPS/GNSS **thật của thiết bị** (đọc qua API OS), không toạ độ giả lập. |
| Foreground | Cập nhật vị trí realtime khi app mở (1–2s/lần khi đang đi). |
| Background tracking | **Background location THẬT** (foreground service Android / background modes iOS) để ghi track khi tắt màn/đút túi. |
| Độ chính xác | Đọc `accuracy` (m) thật; hiển thị vòng sai số; lọc điểm accuracy >50m; làm mượt bằng EMA/Kalman. |
| Mất tín hiệu | Trạng thái GPS_LOST thật (§4): giữ điểm cuối + la bàn (magnetometer thật) + cảnh báo; không "bịa" chuyển động. |

> **Dữ liệu/dịch vụ thật cần có:** quyền Location (fine + background), API định vị OS, magnetometer. Không có server nào thay được — đây là cảm biến thiết bị thật.

### 8.3 Routing & Snap-to-trail THẬT

| Yếu tố | Chốt thực tế |
|---|---|
| Engine | **GraphHopper** (khuyến nghị, profile `hike/foot` + elevation) hoặc **OSRM** (profile foot). |
| Dữ liệu đồ thị | Build **routing graph THẬT từ OSM** (`highway=path/footway/track/steps`, `sac_scale`, `trail_visibility`). |
| Autocalculated A→B | Gọi engine thật để tính tuyến bám đường mòn thật — **không vẽ đường thẳng giả**. |
| Snap / map-matching | GraphHopper **Map Matching** hoặc OSRM `match` — gắn vị trí thật vào edge thật của graph. |
| Off-route detection | So khoảng cách thật tới polyline GPX thật, chạy cục bộ. |

> **Dữ liệu/dịch vụ thật cần có:** graph GraphHopper/OSRM build từ `vietnam-latest.osm.pbf`, cập nhật định kỳ theo OSM.

### 8.4 Offline THẬT

| Yếu tố | Chốt thực tế |
|---|---|
| Tile offline | **PMTiles/MBTiles thật** tải về máy — cùng dữ liệu OSM đang dùng online, cắt theo bbox Area. |
| Routing offline | **Graph GraphHopper cắt theo bbox**, nạp bằng engine embedded → route/snap chạy **không cần mạng thật**. |
| Elevation offline | DEM tiles thật (§8.5) đóng gói theo Area. |
| Kiểm thử | Airplane mode thật: mọi thứ phải chạy bằng dữ liệu đã tải (§5.1 bước 7). |

> **Dữ liệu/dịch vụ thật cần có:** pipeline cắt tile + graph + DEM theo Area; loader embedded (GraphHopper/OSRM offline); lưu trên bộ nhớ máy (§5.2).

### 8.5 Elevation THẬT

| Yếu tố | Chốt thực tế |
|---|---|
| Nguồn DEM | **DEM thật, công khai**: **Copernicus GLO-30 (~30m)** — khuyến nghị chính cho VN; hoặc **SRTM 1-arc-second (30m)**; NASADEM. |
| Dùng cho | Tính cao độ điểm, tổng leo/xuống, **độ dốc** (đỏ/xanh) — **số liệu thật từ DEM, không bịa**. |
| Terrain 3D | Terrain-RGB tiles dựng từ DEM thật → MapLibre `setTerrain`. |
| Contour | Đường bình độ sinh từ DEM thật (GDAL contour). |

> **Dữ liệu/dịch vụ thật cần có:** tải DEM Copernicus/SRTM vùng VN, pipeline GDAL → terrain-RGB + contour. Elevation trong response GraphHopper cũng lấy từ DEM này.

### 8.6 Ảnh thực địa điểm xuất phát (luồng mua cung) — THẬT

- **Ảnh chụp thực địa thật** do người bán/hướng dẫn upload khi tạo cung (BẮT BUỘC theo [[00-brief]] mục 4), gắn toạ độ GPS thật + mô tả.
- Lưu trên CDN/storage thật, cache offline theo Area. **Không dùng ảnh minh hoạ generic.**

### 8.7 ⚠️ Cảnh báo: nơi thực tế khó có dữ liệu thật ở Việt Nam

| Vấn đề | Thực trạng VN | Phương án thật (không fake) |
|---|---|---|
| **Mạng lưới trail trên OSM còn thưa** | Nhiều cung trek VN (vùng núi phía Bắc, Tây Nguyên) **chưa được map** đường mòn trên OSM → GraphHopper/OSRM không có đường để snap. | (a) **Dùng GPX thật của người dùng/người bán làm nguồn trail chính**: cung đã mua dẫn đường theo **GPX track mẫu thật** (§4.2), không phụ thuộc graph OSM. (b) User cấp 2 khi mở cung phải **nộp GPX thật** ([[00-brief]] mục 5) → dần làm giàu dữ liệu. (c) Khuyến khích đóng góp ngược lại OSM. |
| **Snap-to-trail cho tuyến mới** | Ngoài mạng OSM thì không snap được. | Cho **freehand thật** + snap vào **GPX đã import** (map-match với chính track thật), không vẽ đường giả. |
| **Ảnh vệ tinh phân giải cao** | OSM không có; nguồn thật cần license. | Lớp vệ tinh là **Premium**, dùng nhà cung cấp có license thật (Esri/MapTiler/Bing) theo điều khoản. |
| **DEM 30m có thể thô ở địa hình dốc gắt** | Copernicus/SRTM 30m đủ cho tổng leo nhưng có sai số cục bộ ở vách/khe hẹp. | Ghi rõ nguồn + độ phân giải trên profile; nếu có DEM tốt hơn theo vùng (LiDAR/đo đạc) thì thay bằng dữ liệu thật đó. |
| **Địa danh/nhãn tiếng Việt trên OSM chưa đầy đủ** | Một số điểm mốc thiếu tên. | Cho phép cộng đồng thêm waypoint thật (§6); ưu tiên `name:vi` khi render. |
| **Độ phủ GNSS/tín hiệu dưới tán rừng rậm** | Rừng già/thung sâu VN dễ mất/nhiễu GPS. | Xử lý GPS_LOST thật + la bàn + bám GPX; không nội suy chuyển động giả. |

---

## 9. Rủi ro & đề xuất (không tự đổi quyết định mục 2)

- **Ảnh vệ tinh:** OSM không cấp ảnh vệ tinh; cần nguồn ảnh có license (chi phí). Đề xuất tách "vệ tinh" thành lớp Premium hoặc dùng nguồn OSS/độ phân giải giới hạn ở free.
- **Routing engine:** đề xuất **GraphHopper** làm chính (hiking profile + elevation + embedded offline tốt). OSRM dự phòng. → cần agent Code chốt.
- **DEM/elevation offline** làm tăng dung lượng gói — cần cảnh báo dung lượng rõ ràng ở §5.
- **Off-route/an toàn:** cân nhắc tính năng SOS/chia sẻ vị trí trực tiếp (liên quan pháp lý mục 5 brief) — đề xuất đưa vào giai đoạn sau.

---

## 10. Yêu cầu kỹ thuật cho agent Code (API/thư viện + dữ liệu thật cần)

### 9.1 Map & render
- **MapLibre GL** (native mobile: `maplibre-react-native` nếu RN, hoặc plugin Flutter tương ứng) — render, gesture, layers, terrain 3D (`setTerrain`), hillshade.
- **Style spec MapLibre**: quản lý base layer + overlay, `line-opacity/fill-opacity/raster-opacity`, `moveLayer` cho z-order.
- **Tile server tự host**: **Planetiler** build MBTiles/PMTiles từ **`vietnam-latest.osm.pbf` (Geofabrik)**; phục vụ qua **Martin / TileServer GL / tegola**. Dự phòng: **MapTiler/Stadia** (OSM vector thật). DEM terrain-RGB tiles từ Copernicus/SRTM.

### 9.2 Routing & snap & elevation
- **GraphHopper** (server + embedded/offline) hoặc **OSRM** — profile hiking/foot, map-matching (snap-to-trail), elevation. GraphHopper Map Matching API cho snap; `/route` cho autocalculated A→B; via points; elevation trong response.
- **DEM source** (SRTM/ASTER) để dựng terrain-RGB + tính gain/loss.

### 9.3 Offline
- **PMTiles** (khuyến nghị) hoặc **MBTiles** cho tile & DEM.
- Cơ chế cắt & đóng gói **GraphHopper graph** theo bbox; loader embedded.
- **SQLite** cho waypoint/route/folder/sync-queue local-first.

### 9.4 Định vị & cảm biến
- API định vị nền: `expo-location`/`react-native-geolocation` (RN) hoặc `geolocator` (Flutter); background location cho tracking.
- Magnetometer/compass cho bearing & fallback khi mất GPS; bộ lọc Kalman/EMA làm mượt vị trí.
- Haptics + TTS/âm báo cho cảnh báo (approaching, off-route).

### 9.5 Dữ liệu & định dạng
- Parser/serializer **GPX & KML/KMZ** (ví dụ `togeojson`, thư viện GPX tương ứng).
- Ảnh thực địa điểm xuất phát: lưu kèm cung (CDN + cache offline), gắn toạ độ + mô tả.

### 9.6 Đồng bộ
- API backend REST/GraphQL cho user data; đồng bộ delta local-first; conflict theo `updatedAt`/version.
- Chỉ đồng bộ **meta** cho Area offline (không đẩy tile/graph lên cloud của user).

---

_Hết file. Tham chiếu: [[00-brief]] (mục 4 & 6)._
