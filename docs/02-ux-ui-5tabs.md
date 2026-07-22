# POTTER 3.0 — Đặc tả UI/UX 5 Tab

> Agent: UI/UX. Nguồn ngữ cảnh: [[00-brief]].
> Ngôn ngữ đầu ra: Tiếng Việt (thuật ngữ kỹ thuật giữ tiếng Anh khi cần).
> Tham khảo phong cách: **两步路 (2bulu)** cho khung điều hướng + nút "出发/Xuất phát" giữa nổi; **AllTrails / Gaia GPS** cho phần bản đồ & elevation profile.

---

## 0. Nguyên tắc thiết kế chung

### 0.1. Tông cảm xúc
- Tự nhiên, tin cậy, "outdoor" — xanh lá cây rừng, đất nâu, đá xám. Tránh màu neon rực rỡ.
- Ưu tiên **ảnh thực địa** làm anh hùng thị giác (hero). Text tối giản, ưu tiên số liệu (số km, tổng leo, thời gian).
- Thân thiện với ngón cái khi đeo găng / trời nắng chói: touch target lớn, tương phản cao ngoài trời.

### 0.2. Design tokens sơ bộ

#### Bảng màu (Color)
| Token | Hex | Dùng cho |
|---|---|---|
| `color/brand/primary` (Xanh rừng) | `#2E7D32` | Nút chính, nút Xuất phát, active tab |
| `color/brand/primary-dark` | `#1B5E20` | Nhấn (pressed), header gradient |
| `color/brand/primary-light` | `#A5D6A7` | Nền nhấn nhẹ, chip active |
| `color/accent/summit` (Cam đỉnh núi) | `#F57C00` | CTA phụ, "độ hot", cảnh báo nhẹ |
| `color/earth` (Nâu đất) | `#795548` | Icon địa hình, nhãn mùa |
| `color/rock` (Xám đá) | `#607D8B` | Text phụ, đường phân cách |
| `color/danger` | `#D32F2F` | Dốc đứng trên elevation, cảnh báo lệch hướng, cung Khó |
| `color/warning` | `#FBC02D` | Cung Chuẩn, cần chú ý |
| `color/success` | `#43A047` | Cung Dễ, hoàn thành |
| `color/bg/base` | `#FFFFFF` / dark `#121712` | Nền màn |
| `color/bg/surface` | `#F5F7F4` / dark `#1D241C` | Card, sheet |
| `color/text/primary` | `#1B241E` | Tiêu đề |
| `color/text/secondary` | `#5B6B60` | Mô tả, meta |
| `color/map/track-planned` | `#2962FF` | Track dự kiến |
| `color/map/track-recording` | `#F57C00` | Track đang ghi |
| `color/map/track-sample` | `#2E7D32` | Track cung mẫu (đã mua) |

#### Typography
| Token | Giá trị | Dùng |
|---|---|---|
| Font family | Inter / SF Pro (iOS), Roboto (Android). Số liệu: tabular figures | Toàn app |
| `type/display` | 28/34, w700 | Tên cung ở hero |
| `type/h1` | 22/28, w700 | Tiêu đề màn |
| `type/h2` | 18/24, w600 | Tiêu đề section |
| `type/body` | 15/22, w400 | Nội dung |
| `type/meta` | 13/18, w500 | Meta card, chip |
| `type/caption` | 11/14, w500 | Nhãn nhỏ, phụ đề ảnh |
| `type/stat` | 20/24, w700 tabular | Số km / m / giờ |

#### Spacing (grid 4pt)
`space/1=4` · `space/2=8` · `space/3=12` · `space/4=16` · `space/5=20` · `space/6=24` · `space/8=32`
- Padding lề màn: `16`. Khoảng cách giữa card: `12`. Padding trong card: `12–16`.

#### Bo góc & bóng
`radius/sm=8` (chip) · `radius/md=12` (card) · `radius/lg=16` (sheet, ảnh hero) · `radius/pill=999`
`elevation/1` bóng nhẹ card · `elevation/2` bottom nav & FAB Xuất phát.

#### Touch target & kích thước
- **Touch target tối thiểu 44×44pt** (48dp Android). Nút chính cao `52`.
- Icon tab `26`, nút Xuất phát giữa đường kính `64` (nổi cao hơn thanh nav `8–10pt`).
- Bottom nav cao `56` + safe-area inset.

### 0.2b. RÀNG BUỘC: Bản đồ phải THẬT (không fake)
> Áp dụng cho Tab 3 và MỌI màn có map (mini map ở Tab 1/2/4, màn Điểm XP, điều hướng...).
- Nền bản đồ **luôn là MapLibre GL render tile OSM thật** — không dùng ảnh tĩnh/screenshot giả thay cho map. Mini map trong card cũng là instance map thật (có thể ở chế độ tương tác giới hạn/lite để nhẹ), KHÔNG phải ảnh bịa.
- **Vị trí người dùng = GPS thật** (mũi tên hướng + vòng độ chính xác thật). Không hard-code toạ độ minh hoạ trong sản phẩm.
- **Elevation profile vẽ từ dữ liệu độ cao thật** (DEM/GPX), không phác thảo hình sóng bịa; dốc=đỏ, phẳng=xanh theo grade thật.
- **Track/route dùng dữ liệu GPX thật**; snap-to-trail chạy trên GraphHopper/OSRM trên OSM thật (theo [[00-brief]] mục 2).
- **Trạng thái offline là thật**: chỉ vùng tile + dữ liệu route đã tải mới hiển thị/điều hướng được; ngoài vùng hiển thị caro "Chưa tải", không giả vờ có map.
- Các ASCII wireframe dưới đây chỉ mô tả **bố cục & chỗ đặt control**; khối "(BẢN ĐỒ)" luôn hàm ý canvas MapLibre thật, không phải asset tĩnh.

### 0.3. Bottom Navigation (dùng chung mọi tab)
Thanh 5 tab, **nút giữa (thứ 3) là FAB nổi "Xuất phát"** (ghi track), theo phong cách 2bulu.

```
┌───────────────────────────────────────────────┐
│                                                 │
│                 (NỘI DUNG TAB)                  │
│                                                 │
├───────────────────────────────────────────────┤
│  [🏔]      [🥾]     ( ▶ )     [💬]     [👤]    │
│  Cộng     Cung   XUẤT PHÁT   Tin     Hồ sơ     │
│  đồng     đường  (nổi xanh)  nhắn                │
└───────────────────────────────────────────────┘
```
- Vị trí logic 5 tab: **1 Cộng đồng · 2 Cung đường · 3 Xuất phát/Bản đồ (FAB giữa) · 4 Nhắn tin · 5 Hồ sơ**.
- FAB giữa = lối vào nhanh **Tab 3 Bản đồ + bắt đầu ghi track**. Bấm mở màn Bản đồ ở chế độ sẵn sàng ghi; giữ lâu (long-press) mở menu nhanh: "Ghi track" / "Lập lộ trình" / "Điều hướng cung đã mua".
- Trạng thái đang ghi track: FAB đổi thành nút "Đang ghi ● 00:12:45" nhấp nháy đỏ, hiện ở mọi tab (persistent recording bar phía trên nav).

---

## TAB 1 — MẠNG XÃ HỘI TREKKER

### Mục tiêu
Nơi cộng đồng chia sẻ chuyến đi: feed bài viết/ảnh, check-in cung đường, follow/like/comment. Tạo động lực và "bằng chứng xã hội" (social proof) cho các cung.

### Màn hình con
1. **Feed chính** (Đang theo dõi / Khám phá).
2. **Chi tiết bài viết** (post detail + comment).
3. **Soạn bài / Check-in** (đăng ảnh gắn cung + track).
4. **Trang cá nhân người khác** (mini profile, nút Follow).
5. **Tìm kiếm & Hashtag/địa điểm**.

### Thành phần UI chính
- Top segmented control: `Đang theo dõi | Khám phá`.
- **Post card:** avatar + tên + cấp badge · ảnh/carousel · caption · **chip cung đường gắn kèm** (tên cung + km + tổng leo) · hàng action (♥ like, 💬 comment, ↗ share, 🔖 lưu) · map thumbnail track nếu có check-in.
- Nút nổi "＋" soạn bài (góc phải dưới, tránh đè FAB giữa — đặt lệch phải).
- Chip lọc: `#địa điểm`, `mùa`, `độ khó`.

### Wireframe
```
┌──────────────────────────────────────────┐
│  POTTER        Đang theo dõi | Khám phá 🔍│  header
├──────────────────────────────────────────┤
│ ┌────────────────────────────────────┐   │
│ │ (avatar) Minh Trek  ⛰Lv.2   • 2h   │   │
│ │ ┌────────────────────────────────┐ │   │
│ │ │        ẢNH CHUYẾN ĐI            │ │   │
│ │ │        (carousel 1/4)          │ │   │
│ │ └────────────────────────────────┘ │   │
│ │ "Săn mây Tà Xùa sáng nay 🌄"       │   │
│ │ ┌ cung ─────────────────────────┐  │   │
│ │ │🥾 Tà Xùa – Sống lưng khủng long│  │   │
│ │ │  12.4km · ↑1,120m · Khó        │  │   │
│ │ └────────────────────────────────┘  │   │
│ │  ♥ 214    💬 33    ↗    🔖         │   │
│ └────────────────────────────────────┘   │
│ ┌ (post kế tiếp) ───────────────────┐    │
│ │ ...                                │    │
│ └────────────────────────────────────┘   │
│                                     (＋)  │  FAB soạn bài
├──────────────────────────────────────────┤
│  [🏔]  [🥾]   ( ▶ )   [💬]   [👤]        │
└──────────────────────────────────────────┘
```

### Luồng người dùng chính
**A. Xem & tương tác**
1. Mở tab → mặc định "Đang theo dõi".
2. Cuộn feed → bấm ♥ / mở comment / bấm chip cung để nhảy sang chi tiết cung (Tab 2).
3. Bấm avatar → mini profile → Follow.

**B. Check-in sau chuyến đi**
1. Bấm "＋" → chọn "Check-in cung đường".
2. Chọn track vừa ghi (từ Tab 3) hoặc cung đã đi → app tự đính km/tổng leo/thời gian.
3. Thêm ảnh + caption + tag địa điểm → Đăng.
4. Bài xuất hiện ở feed + cập nhật cột mốc (Tab 5).

### Trạng thái đặc biệt
- **Empty (chưa follow ai):** hình minh hoạ núi + "Chưa có gì trên đường của bạn" + nút "Khám phá cung hot" và "Tìm người đi cùng".
- **Loading:** skeleton 2–3 post card (khối ảnh xám + 2 dòng text shimmer).
- **Offline:** banner vàng trên đầu "Đang offline — hiển thị nội dung đã tải". Nút like/comment xếp hàng, gửi khi có mạng.
- **Theo cấp user:**
  - Cấp 1: bài về cung Khó hiện nhãn nhắc "Cung này cần người hướng dẫn" khi bấm vào chip cung.
  - Cấp 2/3: có thêm nút "Đăng cung này lên chợ" trên bài check-in của chính mình.

---

## TAB 2 — CUNG ĐƯỜNG

### Mục tiêu
Danh mục & khám phá cung. Là nơi **mua cung hướng dẫn**. Thẻ cung hiển thị đủ chỉ số. Cấp 2+ mở cung mới.

### Màn hình con
1. **Danh sách cung** (list + bộ lọc + "Điểm đến hot").
2. **Chi tiết cung** (route detail).
3. **Màn Mua cung / Chọn gói hướng dẫn**.
4. **Màn "Dẫn tới ĐIỂM XUẤT PHÁT"** (có ảnh thực địa) — trọng tâm.
5. **Mở cung mới** (chỉ cấp 2+).

### Thành phần UI — Thẻ cung (Route Card) BẮT BUỘC hiển thị
Nhãn độ khó (**Dễ / Chuẩn / Khó**), khoảng cách (km), **tổng leo (m)**, thời gian, mùa đẹp, lượt lưu, **độ hot**.

```
┌ Route Card ───────────────────────────────┐
│ ┌────────────────────────────────────────┐ │
│ │        ẢNH CUNG (hero)          🔥Hot  │ │
│ │                              [Khó] chip │ │  chip màu theo độ khó
│ └────────────────────────────────────────┘ │
│ Tà Xùa – Sống lưng khủng long              │
│ 📍 Sơn La                                   │
│ ┌────┬────────┬────────┬────────┐          │
│ │12.4│ ↑1,120m│ ~8h    │ 🍂 Thu │  stats   │
│ │ km │ tổng leo│ thời g │  mùa   │          │
│ └────┴────────┴────────┴────────┘          │
│ 🔖 1,204 lưu     🔥 Độ hot ████░ 82        │
│ ⚠ Cấp 1: cần người hướng dẫn (nếu Lv.1)    │
└────────────────────────────────────────────┘
```
- **Chip độ khó màu:** Dễ = xanh `success`, Chuẩn = vàng `warning`, Khó = đỏ `danger`.
- **Độ hot:** thanh + số (0–100), tính từ lượt xem/lưu/check-in gần đây.

### Wireframe — Danh sách cung
```
┌──────────────────────────────────────────┐
│ Cung đường            🔍   ⚙ Bộ lọc       │
│ [Tất cả][Dễ][Chuẩn][Khó]  [Mùa ▾][Vùng ▾]│  filter chips
├──────────────────────────────────────────┤
│  🔥 ĐIỂM ĐẾN HOT  (carousel ngang)        │
│  ┌─────┐ ┌─────┐ ┌─────┐                  │
│  │ảnh  │ │ảnh  │ │ảnh  │  →                │
│  │TàXùa│ │Bạch │ │Lảo  │                   │
│  └─────┘ └─────┘ └─────┘                   │
├──────────────────────────────────────────┤
│  Route Card 1 (như trên)                  │
│  Route Card 2                             │
│  Route Card 3 ...                         │
│                                    (＋ Mở  │  chỉ Lv.2+
│                                     cung)  │
├──────────────────────────────────────────┤
│  [🏔]  [🥾]   ( ▶ )   [💬]   [👤]        │
└──────────────────────────────────────────┘
```

### Wireframe — Chi tiết cung
```
┌──────────────────────────────────────────┐
│  ← [ẢNH HERO cung]            🔖  ↗       │
│                                [Khó] 🔥82 │
├──────────────────────────────────────────┤
│ Tà Xùa – Sống lưng khủng long             │
│ 12.4km · ↑1,120m · ~8h · 🍂 Thu đẹp nhất  │
├──────────────────────────────────────────┤
│  [Mini map + track mẫu]                   │
│  [Elevation profile ▁▃▆█▆▃ dốc=đỏ]        │
├──────────────────────────────────────────┤
│  Mô tả · Điểm nước · Điểm cắm trại         │
│  Đánh giá cộng đồng (★4.7 · 88 review)    │
│  Ảnh cộng đồng (grid)                     │
├──────────────────────────────────────────┤
│  Lv.1 → ⚠ "Cung khó cần người hướng dẫn"  │
│  ┌──────────────────────────────────────┐ │
│  │   MUA CUNG HƯỚNG DẪN — 350.000đ      │ │  CTA chính (sticky)
│  └──────────────────────────────────────┘ │
│  [ Lưu offline ]     [ Xem track ]        │
└──────────────────────────────────────────┘
```

### Wireframe — Màn "DẪN TỚI ĐIỂM XUẤT PHÁT" (trọng tâm)
> Sau khi mua cung có hướng dẫn: BƯỚC 1 dẫn user từ vị trí hiện tại tới điểm bắt đầu. **Điểm xuất phát BẮT BUỘC có ẢNH thực địa** để nhận diện đúng chỗ.

```
┌──────────────────────────────────────────┐
│ ← Tới điểm xuất phát        Bước 1/2      │
├──────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐│
│ │      ẢNH THỰC ĐỊA ĐIỂM XUẤT PHÁT       ││  ← ảnh lớn, rõ mốc
│ │   "Cổng gỗ đầu bản, có biển Tà Xùa"    ││    (nhận diện)
│ │                                 [xem 🔍]││  bấm phóng to
│ └────────────────────────────────────────┘│
│  📍 Điểm xuất phát: Bản Tà Xùa            │
│  Cách bạn 8.2 km · lái xe ~22 phút        │
│  Toạ độ 21.234, 104.567   [Sao chép]      │
├──────────────────────────────────────────┤
│  [ Mini map: vị trí bạn → điểm XP ]       │
├──────────────────────────────────────────┤
│  Ghi chú tới nơi:                         │
│  • Gửi xe tại nhà anh Sơn (cuối đường bê  │
│    tông). • Sóng yếu từ đây → tải offline │
│  👤 Người hướng dẫn: A Của  ⭐4.9  [Nhắn] │  → Tab 4
├──────────────────────────────────────────┤
│ ┌──────────────┐ ┌───────────────────────┐│
│ │ Chỉ đường tới│ │  TÔI ĐÃ TỚI NƠI →      ││
│ │ (Google/app) │ │  Bắt đầu đi cung       ││  → chuyển BƯỚC 2 (Tab 3)
│ └──────────────┘ └───────────────────────┘│
└──────────────────────────────────────────┘
```
Chi tiết thiết kế màn này:
- **Ảnh thực địa là khối lớn nhất** (hero ~40% màn), có caption mô tả mốc nhận diện + nút phóng to; nếu có nhiều ảnh (ngã rẽ, chỗ gửi xe) → carousel đánh số.
- Hàng meta: khoảng cách tới điểm XP, thời gian di chuyển, toạ độ + nút sao chép.
- Mini map "bạn → điểm XP" (đường xe/đường mòn tiếp cận).
- Khối "Ghi chú tới nơi" + liên hệ nhanh người hướng dẫn (mở Tab 4).
- 2 nút đáy: "Chỉ đường tới" (bàn giao cho app bản đồ tiếp cận) và **"Tôi đã tới nơi → Bắt đầu đi cung"** (chuyển sang BƯỚC 2: điều hướng snap-to-trail ở Tab 3).
- Trạng thái "đã tới" tự nhận diện khi user vào bán kính ~100m điểm XP → nút Bước 2 sáng lên.

### Luồng người dùng chính — Mua cung hướng dẫn
1. Tab 2 → chọn cung → Chi tiết cung.
2. Bấm **Mua cung hướng dẫn** → chọn gói (tự đi có GPX / có người dẫn) → xác nhận thanh toán.
3. Sau mua → mở **Màn "Dẫn tới điểm xuất phát"** (BƯỚC 1, có ảnh thực địa).
4. Bấm "Chỉ đường tới" để tới điểm XP; tới nơi → "Bắt đầu đi cung".
5. Chuyển **BƯỚC 2** (Tab 3): snap track mẫu, dẫn đường theo GPX, cảnh báo lệch hướng.

### Luồng — Mở cung mới (Cấp 2+)
1. Bấm "＋ Mở cung" → đặt tên, chọn vùng, độ khó, mùa.
2. Nạp GPX (từ track đã ghi hoặc import) → app tính km/tổng leo/elevation.
3. Thêm **ảnh điểm xuất phát (bắt buộc)** + mô tả + gói bán/support.
4. Gửi kiểm duyệt → publish lên chợ cung.

### Trạng thái đặc biệt
- **Empty (lọc không ra kết quả):** "Chưa có cung khớp bộ lọc" + nút "Xoá lọc" + gợi ý cung hot.
- **Loading:** skeleton route card (khối ảnh + 4 ô stat shimmer).
- **Offline:** chỉ hiện cung đã tải offline; cung chưa tải hiện mờ + icon ⤓ "cần mạng để tải".
- **Theo cấp user:**
  - **Cấp 1:** cung Chuẩn/Khó hiện nhãn **"cần người hướng dẫn"**; nút mua chỉ cho phép gói "có người dẫn"; không thấy nút "Mở cung".
  - **Cấp 2:** thấy nút **"Mở cung mới"** + có thể bán cung kèm support.
  - **Cấp 3:** thêm quản lý nhiều cung/tour, gán hướng dẫn viên cho đoàn.

---

## TAB 3 — BẢN ĐỒ / CHỈ ĐƯỜNG (lõi map)

### Mục tiêu
Trái tim sản phẩm. Bản đồ MapLibre GL + OSM. Ghi track, lập lộ trình snap-to-trail, điều hướng cung đã mua (BƯỚC 2), elevation profile, offline. Tham khảo Gaia GPS.

### Màn hình con
1. **Bản đồ toàn màn** (mặc định).
2. **Ghi track** (recording).
3. **Lập lộ trình** (route planner, cấp 2+ mở đường mới).
4. **Điều hướng cung** (navigation theo GPX — BƯỚC 2 của mua cung).
5. **Quản lý lớp bản đồ** (layers sheet).
6. **Tải offline theo vùng** (offline area).
7. **Elevation profile / xem 3D**.

### Thành phần UI chính
- Map canvas toàn màn. Nút phải: `⧉ Lớp bản đồ`, `⌖ Định vị tôi`, `＋/−` zoom, `🧭 la bàn`.
- **Recording bar** khi ghi: thời gian · km · ↑tổng leo · tốc độ · nút ⏸ / ⏹.
- **Layers sheet:** nền (Topo / Vệ tinh / Đường bộ) + overlays (Waypoints, Tracks, Routes, Lưới toạ độ) + **slider opacity** từng lớp.
- **Elevation profile** panel kéo lên từ đáy (dốc = đỏ, phẳng = xanh) + nút "Xem 3D".
- Bảng công cụ planner: `Snap-to-trail` toggle, `Undo đoạn`, `Out-and-back`, `Back-to-start`.

### Wireframe — Bản đồ + đang ghi track
```
┌──────────────────────────────────────────┐
│                              ⧉ Lớp        │
│                              🧭            │
│            (BẢN ĐỒ TOPO/OSM)              │
│         ●───track đang ghi (cam)          │
│                              ⌖ Định vị    │
│                              ＋           │
│                              −            │
├──────────────────────────────────────────┤
│ ● Đang ghi 00:12:45                       │  recording bar
│ 3.2 km · ↑210 m · 4.1 km/h    [⏸] [⏹]    │
│ ▁▃▅█▆▃  (elevation mini, kéo lên xem đủ) │
├──────────────────────────────────────────┤
│  [🏔]  [🥾]   ( ● ghi )  [💬]   [👤]     │
└──────────────────────────────────────────┘
```

### Wireframe — Layers sheet (kéo lên)
```
┌──────── Lớp bản đồ ───────────────────────┐
│ Nền:  (Topo) ( Vệ tinh ) ( Đường bộ )     │
│ ───────────────────────────────────────── │
│ Overlays                     opacity       │
│ ☑ Waypoints        ▮▮▮▮▮▮▯▯  75%          │
│ ☑ Tracks           ▮▮▮▮▮▮▮▮ 100%          │
│ ☐ Routes           ▮▮▮▮▯▯▯▯  50%          │
│ ☐ Lưới toạ độ      ▮▮▯▯▯▯▯▯  25%          │
│ ───────────────────────────────────────── │
│ [ ⤓ Tải vùng này offline ]                │
└────────────────────────────────────────────┘
```

### Wireframe — Điều hướng cung (BƯỚC 2, cung đã mua)
```
┌──────────────────────────────────────────┐
│ ← Tà Xùa – Sống lưng KL      🔊  ⧉        │
│         (map + track mẫu xanh)            │
│         ▲ bạn (mũi tên hướng)            │
│   ⚠ LỆCH HƯỚNG 40m — quay lại track      │  cảnh báo
│                              ⌖           │
├──────────────────────────────────────────┤
│ Còn 6.1 km · ↑ còn 620 m · ~4h20         │
│ Điểm tiếp: "Yên ngựa" 800m                │
│ ▁▃▅██▆▅▃ elevation (vị trí bạn ●)         │
│ [ ⏸ Tạm dừng ]        [ Nhắn hướng dẫn ] │  → Tab 4
└──────────────────────────────────────────┘
```

### Luồng người dùng chính
**A. Ghi track tự do**
1. Bấm FAB giữa "Xuất phát" → map mở chế độ sẵn sàng.
2. Bấm ● Ghi → recording bar chạy → đi.
3. ⏸ tạm dừng / ⏹ kết thúc → lưu (tên, ảnh, phân loại) → gợi ý check-in (Tab 1) hoặc mở cung (Tab 2, nếu Lv.2+).

**B. Lập lộ trình (planner)**
1. Chọn "Lập lộ trình" → chạm điểm A → điểm B → app **auto-snap-to-trail** & tính khoảng cách/độ dốc/tổng leo.
2. Thêm điểm, `Undo` từng đoạn, chọn `Out-and-back` / `Back-to-start`.
3. Xem elevation profile / 3D → Lưu route → (Lv.2+) đăng thành cung.

**C. Điều hướng cung đã mua** — như BƯỚC 2 ở Tab 2.

**D. Tải offline**
1. Layers → "Tải vùng này offline" → khoanh vùng (Area).
2. Chọn lớp + độ phân giải **High** + tích **"Bao gồm dữ liệu để tạo & điều hướng route offline"** (snap/route chạy khi mất sóng).
3. Tải (progress) → dùng offline. (Gói offline gắn Premium.)

### Trạng thái đặc biệt
- **Empty (chưa có track/route):** map trống + gợi ý bong bóng "Bấm ▶ để ghi track đầu tiên".
- **Loading:** tile shimmer + "Đang tải bản đồ…"; spinner định vị GPS "Đang tìm tín hiệu…".
- **Offline:** badge "OFFLINE" góc trên; vùng đã tải hiện bình thường, ngoài vùng hiện caro xám "Chưa tải". Nếu chưa tích dữ liệu route offline → planner khoá kèm gợi ý.
- **GPS yếu:** vòng độ chính xác lớn + cảnh báo "Tín hiệu yếu".
- **Theo cấp user:**
  - **Cấp 1:** dùng map/ghi track/điều hướng cung đã mua; **planner "Mở đường mới" bị khoá** (hiện khoá + "Lên Cấp 2 để mở đường").
  - **Cấp 2:** đầy đủ planner + snap + export GPX.
  - **Cấp 3:** thêm cộng tác nhóm trên cùng bản đồ, theo dõi vị trí thành viên đoàn (nếu bật chia sẻ).

---

## TAB 4 — NHẮN TIN

### Mục tiêu
Chat 1-1 và nhóm; đặc biệt kênh **support giữa người mua cung ↔ người bán/hướng dẫn**. Kết nối chặt với luồng mua cung & điều hướng.

### Màn hình con
1. **Danh sách hội thoại** (tab con: Tất cả / Hướng dẫn / Nhóm).
2. **Cửa sổ chat** (1-1 hoặc nhóm).
3. **Thông tin hội thoại** (thành viên, cung liên quan, chia sẻ vị trí).

### Thành phần UI chính
- List item: avatar · tên · tin cuối · thời gian · badge chưa đọc · nhãn "Hướng dẫn viên" nếu là kênh support.
- **Thanh ngữ cảnh cung** trên cùng cửa sổ chat: tên cung đang hỗ trợ + nút "Xem cung" / "Điểm XP".
- Ô soạn: text, ảnh, **chia sẻ vị trí trực tiếp**, gửi **track/waypoint/GPX**, nút thoại (tuỳ chọn).
- Message bubble hỗ trợ card đặc biệt: **card cung**, **card vị trí (mini map)**, **card điểm xuất phát (ảnh thực địa)**.

### Wireframe — Danh sách + Cửa sổ chat
```
┌─────────── Danh sách ─────────┐   ┌────────── Chat 1-1 ─────────────┐
│ Tin nhắn      [Tất cả|HD|Nhóm]│   │ ← A Của ⭐4.9  Hướng dẫn viên   │
├───────────────────────────────┤   ├─────────────────────────────────┤
│ (av) A Của         09:12  ●2  │   │ ┌ cung ─────────────────────┐   │
│  "Tới cổng bản thì nhắn anh"  │   │ │🥾 Tà Xùa · Điểm XP ↗       │   │  ngữ cảnh cung
│ ─────────────────────────────  │   │ └───────────────────────────┘   │
│ (av) Nhóm Tà Xùa T7  Hôm qua  │   │            "Chào em, mai 5h nhé" │
│  "Điểm danh 5h sáng nhé cả nhà"│  │ ┌ 📍 vị trí (mini map) ─────┐   │
│ ─────────────────────────────  │   │ │ Anh đang ở cổng bản       │   │
│ (av) CSKH POTTER   3 ngày     │   │ └───────────────────────────┘   │
│                                │   │ [＋][📷][📍][GPX]  soạn… [➤]    │
└───────────────────────────────┘   └─────────────────────────────────┘
```

### Luồng người dùng chính
1. Mua cung có người dẫn → tự tạo kênh chat với hướng dẫn viên (nhãn "Hướng dẫn viên", ghim cung liên quan).
2. Từ màn Điểm XP hoặc màn Điều hướng → bấm "Nhắn hướng dẫn" → mở đúng hội thoại.
3. Trong chat: chia sẻ vị trí trực tiếp / gửi waypoint khi lạc → hướng dẫn viên định vị.
4. Nhóm đoàn (Cấp 3 tạo): điểm danh, thông báo, chia sẻ vị trí đoàn.

### Trạng thái đặc biệt
- **Empty:** "Chưa có hội thoại" + gợi ý "Mua cung để kết nối hướng dẫn viên".
- **Loading:** skeleton list item.
- **Offline:** tin soạn khi offline hiện đồng hồ "chờ gửi", tự gửi khi có mạng; banner "Offline — tin sẽ gửi khi có mạng".
- **Theo cấp user:**
  - Cấp 1: chat 1-1 với hướng dẫn viên & CSKH; không tạo nhóm bán.
  - Cấp 2: kênh support với khách mua cung của mình.
  - Cấp 3: tạo & quản lý nhóm đoàn, broadcast thông báo, gán nhiều hướng dẫn viên.

---

## TAB 5 — HỒ SƠ / CỘT MỐC / R&D

### Mục tiêu
Profile cá nhân, thành tích (cột mốc: số cung, tổng km, tổng leo), quản lý dữ liệu, cấp độ & thăng cấp, và khu R&D/nghiên cứu.

### Màn hình con
1. **Hồ sơ chính** (header + cột mốc + tab con).
2. **Cột mốc / Thành tích** (thống kê + huy hiệu).
3. **Cung của tôi / Đã mua / Đã lưu offline**.
4. **Track & Waypoint của tôi** (folder, export/import GPX/KML).
5. **Cấp độ & thăng cấp** (tiêu chí, uy tín, disclaimer).
6. **R&D / Nghiên cứu** (thử nghiệm, phản hồi, tài liệu).
7. **Cài đặt** (tài khoản, Premium, đồng bộ web↔mobile, offline, riêng tư).

### Thành phần UI chính
- **Header hồ sơ:** ảnh bìa (ảnh núi) + avatar + tên + **badge cấp (Lv.1/2/3)** + thanh tiến độ thăng cấp.
- **Hàng cột mốc (stat row):** Số cung · Tổng km · Tổng leo (m) · Số ngày đi.
- Lưới huy hiệu (badge grid): "100km đầu tiên", "Đỉnh >2000m", "Săn mây"…
- Danh sách quản lý: Cung đã mua / đã lưu / track / waypoint (folder + icon tuỳ chỉnh + ghi chú).
- Nút **Nâng cấp Premium** (mở khoá lớp nâng cao + offline).
- Khu **R&D:** card thử nghiệm/khảo sát + nút gửi phản hồi.

### Wireframe — Hồ sơ chính
```
┌──────────────────────────────────────────┐
│ ┌──────────── ẢNH BÌA NÚI ─────────────┐ │
│ │      (avatar)                     ⚙   │ │
│ └───────────────────────────────────────┘ │
│  Nao Chi   ⛰ Cấp 2 – Có kinh nghiệm       │
│  Uy tín ██████░░ 78 → Cấp 3               │
├──────────────────────────────────────────┤
│  CỘT MỐC                                  │
│ ┌────┬────────┬─────────┬────────┐        │
│ │ 14 │ 168 km │ ↑9,400m │ 21 ngày│        │
│ │cung│tổng km │tổng leo │ đi     │        │
│ └────┴────────┴─────────┴────────┘        │
│  🏅 Huy hiệu:  [100km][>2000m][Săn mây]…  │
├──────────────────────────────────────────┤
│  [ Cung của tôi ] [ Đã mua ] [ Track ]    │  tab con
│  ...list...                               │
├──────────────────────────────────────────┤
│  🔬 R&D / Nghiên cứu                       │
│  • Thử nghiệm lớp bản đồ 3D (beta)        │
│  • Gửi phản hồi cải thiện                 │
├──────────────────────────────────────────┤
│  ⭐ Nâng cấp Premium  ·  Đồng bộ  ·  Offline│
├──────────────────────────────────────────┤
│  [🏔]  [🥾]   ( ▶ )   [💬]   [👤]        │
└──────────────────────────────────────────┘
```

### Wireframe — Cấp độ & thăng cấp
```
┌──────── Cấp độ của bạn ───────────────────┐
│ Hiện tại: Cấp 2 – Có kinh nghiệm          │
│ ─ Tiêu chí lên Cấp 3 (Tổ chức/Tour) ─     │
│ ☑ ≥ 10 cung hoàn thành      (14/10)       │
│ ☑ ≥ 100 km tích luỹ         (168/100)     │
│ ☐ Xác minh tổ chức/giấy phép tour         │
│ ☐ Uy tín ≥ 90               (78/90)       │
│ ───────────────────────────────────────── │
│ ⚠ Khung miễn trừ trách nhiệm (disclaimer) │
│   Đọc & đồng ý điều khoản an toàn khi bán  │
│   cung / dẫn đoàn.            [Xem] [☑]    │
│ [   Nộp hồ sơ thăng cấp   ]               │
└────────────────────────────────────────────┘
```

### Luồng người dùng chính
1. Mở tab → xem cột mốc & cấp.
2. Vào "Track" → chọn track → export GPX/KML hoặc chỉnh waypoint (icon, ghi chú, folder).
3. Vào "Cấp độ" → xem tiêu chí → nộp hồ sơ thăng cấp (kèm đồng ý disclaimer).
4. R&D → tham gia beta / gửi phản hồi.
5. Cài đặt → bật đồng bộ web↔mobile, quản lý gói Premium & offline.

### Trạng thái đặc biệt
- **Empty (mới tạo tài khoản):** cột mốc 0 + "Ghi track đầu tiên để mở cột mốc" (CTA về FAB Xuất phát).
- **Loading:** skeleton header + stat shimmer.
- **Offline:** hiển thị dữ liệu đã đồng bộ; export GPX từ track offline vẫn chạy; thao tác đồng bộ xếp hàng.
- **Theo cấp user:**
  - **Cấp 1:** cột mốc + huy hiệu cơ bản; khu "Cấp độ" nêu tiêu chí lên Cấp 2 (đủ GPX/kinh nghiệm); chưa có "Cung của tôi (bán)".
  - **Cấp 2:** có "Cung của tôi" (đã mở/bán) + doanh thu cơ bản + tiêu chí lên Cấp 3.
  - **Cấp 3:** bảng quản lý tổ chức/tour, danh sách đoàn, hướng dẫn viên, báo cáo.

---

## Bàn giao cho agent Code

Danh sách màn hình cần build + độ ưu tiên (P0 = lõi/MVP, P1 = quan trọng, P2 = sau).

| # | Màn hình | Tab | Ưu tiên | Ghi chú phụ thuộc |
|---|---|---|---|---|
| 1 | Bottom Navigation + FAB "Xuất phát" nổi giữa + recording bar | Chung | **P0** | Khung điều hướng; trạng thái ghi persistent |
| 2 | Design tokens (màu, type, spacing, touch target) | Chung | **P0** | Nền tảng mọi màn |
| 3 | Bản đồ toàn màn (MapLibre + OSM) + Layers sheet + opacity | Tab 3 | **P0** | Lõi sản phẩm |
| 4 | Ghi track + lưu (recording) | Tab 3 | **P0** | GPS, tổng leo, elevation mini |
| 5 | Danh sách cung + Route Card (đủ chỉ số) + bộ lọc + Điểm đến hot | Tab 2 | **P0** | Chip độ khó/độ hot |
| 6 | Chi tiết cung + elevation profile + CTA mua | Tab 2 | **P0** | — |
| 7 | Màn "Dẫn tới ĐIỂM XUẤT PHÁT" (ảnh thực địa) | Tab 2/3 | **P0** | Trọng tâm; nối Tab 4 & Bước 2 |
| 8 | Điều hướng cung (BƯỚC 2, snap-to-trail, cảnh báo lệch) | Tab 3 | **P0** | Sau khi mua cung |
| 9 | Feed mạng xã hội + Post card + tương tác | Tab 1 | P1 | Chip cung gắn kèm |
| 10 | Soạn bài / Check-in (gắn track + ảnh) | Tab 1 | P1 | Phụ thuộc ghi track |
| 11 | Nhắn tin: list + cửa sổ chat + card cung/vị trí | Tab 4 | P1 | Kênh support hướng dẫn |
| 12 | Hồ sơ + Cột mốc + huy hiệu | Tab 5 | P1 | — |
| 13 | Lập lộ trình (planner: snap, undo, out-and-back, 3D) | Tab 3 | P1 | Cấp 2+ |
| 14 | Tải offline theo vùng (Area, High, dữ liệu route offline) | Tab 3 | P1 | Premium |
| 15 | Mua cung / chọn gói + thanh toán | Tab 2 | P1 | Cổng thanh toán |
| 16 | Mở cung mới (Cấp 2+) | Tab 2 | P2 | Ảnh điểm XP bắt buộc |
| 17 | Cấp độ & thăng cấp + disclaimer | Tab 5 | P2 | Khung pháp lý |
| 18 | Track & Waypoint manager + export/import GPX/KML | Tab 5 | P2 | Folder, icon tuỳ chỉnh |
| 19 | R&D / Nghiên cứu + phản hồi | Tab 5 | P2 | — |
| 20 | Cài đặt + đồng bộ web↔mobile + Premium | Tab 5 | P2 | — |

**Nguyên tắc dựng theo cấp user:** mọi màn cần đọc `userLevel (1/2/3)` để bật/khoá thành phần (nhãn "cần người hướng dẫn", nút "Mở cung mới", planner mở đường mới, quản lý đoàn Cấp 3).

> Rủi ro & đề xuất: (1) Ảnh thực địa điểm XP cần chuẩn dữ liệu bắt buộc khi tạo cung — đề nghị agent dữ liệu/Code enforce ở schema. (2) Snap-to-trail offline phụ thuộc gói dữ liệu route offline — cần thống nhất với R&D map engine. Không tự đổi quyết định đã chốt ở [[00-brief]] mục 2.
