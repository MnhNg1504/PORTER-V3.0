# POTTER 3.0 — Bản đồ nội dung & Kịch bản demo full tính năng (docs/11)

> Agent NỘI DUNG & UX. Nguồn: [[08-behavior-flows]] (2 vai + 9 component §D) · [[09-map-guidance-rnd]] ·
> [[02-ux-ui-5tabs]] · [[05-synthesis-spec]] (QUYẾT ĐỊNH đã chốt) · [[04-user-tiers-scoring]] (ma trận quyền) ·
> `prototype/app-preview.html` (markup thật, đối chiếu từng id/handler) · [[api-contract]] §0 (endpoint đã code) · `admin/index.html`.
>
> Quy ước: **[CÓ]** = đã tồn tại trong markup `app-preview.html` hiện tại (id + handler chạy được).
> **[THIẾU]** = chưa có trong markup — mục 2 cung cấp nội dung thật để dựng ngay.
> Icon chỉ dùng bộ `prototype/brand/icons.js`: `ic-*` (outline 24/1.6) và `pin-*` (nền tròn semantic):
> `home · routes · chat · guide · compass · camp · warn · check · water · summit · photo · s · f · e`.

---

## 1. SƠ ĐỒ LIÊN KẾT MÀN HÌNH (mọi màn → mọi nút → đích)

### 1.0. Khung chung — Bottom nav (hiện ở mọi tab) [CÓ]

| Nút trên nav | Icon | Đích | Trạng thái |
|---|---|---|---|
| Cộng đồng | `ic-home` | `#s-community` | [CÓ] |
| Cung đường | `ic-routes` | `#s-routes` | [CÓ] |
| FAB Xuất phát (giữa, Lime) | `ic-compass` | `#s-map`; nếu đã mua → mở thêm `#go-sheet` | [CÓ] |
| FAB **giữ lâu** (long-press) | `ic-compass` | menu nhanh: Ghi cung mới (creator) / Điều hướng cung đã mua | **[THIẾU]** — docs/02 §0.3, là điểm vào creator số 2 |
| Tin nhắn | `ic-chat` | `#s-msg` | [CÓ] |
| Hồ sơ | `ic-guide` | `#s-profile` | [CÓ] |

### 1.1. VAI 1 — NGƯỜI DÙNG CUNG (consumer)

```
#s-community ──chip cung──────────────────────────► #detail                [THIẾU liên kết]
     │ "＋ Đăng bài" ─► màn Soạn bài/Check-in                              [THIẾU]
#s-routes ──card Tà Xùa──► #detail ──MUA──► #buy-sheet(waiver) ──► (PREP checklist [THIẾU])
     │ "🔍 Tìm kiếm" ─► màn Tìm kiếm [THIẾU]         │
     │ "＋ Mở cung" (Cấp 2) ─► VAI 2 [THIẾU]          ▼
     └─mini Núi 3D "TOÀN MÀN"──► #mount3d      #startpoint (BƯỚC 1 GPS-snap)
                                                     │ SNAP GPS → ≤50m → #sp-arrive
                                                     ▼ XÁC NHẬN
#s-map (BƯỚC 2) ◄────────────────────────────── startTrek()
  │ DẪN=M1 (repbar HUD + camera bay)   VT=M2   NÚI=M3(#mount3d)   ◎ fit
  │ tới checkpoint ─► #cpmodal (chụp/bỏ qua) ─► đi tiếp
  │ lệch tuyến ─► OffRouteBanner [THIẾU]      SOS ─► #sos-sheet
  ▼ hết track
#finsheet (CERTIFIED) ──► Hồ sơ: cột mốc mới [THIẾU cập nhật] ──► Thẻ chia sẻ [THIẾU]
```

**Bảng chi tiết từng màn — từng nút:**

| # | Màn (id markup) | Nút / vùng bấm | Đích đến | [CÓ]/[THIẾU] |
|---|---|---|---|---|
| C1 | Tab 1 `#s-community` | scroll feed 3 post (ảnh thật `photos/`) | — | [CÓ] |
| | | `＋ Đăng bài` (header) | màn Soạn bài / Check-in (mục 2.1) | [THIẾU] — hiện là span chết |
| | | ❤️ / 💬 / ↗ trên post | like/comment/share | [THIẾU] — tĩnh |
| | | tag 📍 trên ảnh post | `#detail` cung tương ứng | [THIẾU] liên kết |
| | | avatar người đăng | mini profile | [THIẾU] |
| C2 | Tab 2 `#s-routes` | ô tìm + nút `🔍 Tìm kiếm` | màn Tìm kiếm (mục 2.2) | [THIẾU] — tĩnh |
| | | filter chips (Tất cả/Dễ/Chuẩn/Khó/Có hướng dẫn) | lọc danh sách | [THIẾU] — chưa lọc |
| | | card **Tà Xùa** | `#detail` | [CÓ] `openDetail()` |
| | | 3 card còn lại (Kỳ Quan San, Lảo Thẩn, Hàm Lợn) | chi tiết cung tương ứng | [THIẾU] — không bấm được |
| | | nút `＋ Mở cung` (chỉ Cấp 2+) | VAI 2 — REC_CHECK (mục 2.8) | [THIẾU] — điểm vào creator số 1 |
| C3 | Chi tiết cung `#detail` | ← back | về `#s-routes` | [CÓ] |
| | | stats 4 ô (km/leo/đỉnh/review — **GPX thật**) | — | [CÓ] |
| | | mini Núi 3D `#minimt` (+/−/⟲) | tự chạy % lộ trình | [CÓ] |
| | | `TOÀN MÀN` | `#mount3d` (M3) | [CÓ] `open3D()` |
| | | card Thời tiết (CSS `.wx` có sẵn, markup đã rớt) | — | [THIẾU] — mục 2.3 |
| | | startcard ảnh điểm XP | chỉ hiển thị (đúng brief §4) | [CÓ] |
| | | `MUA CUNG HƯỚNG DẪN — 350.000đ` | `#buy-sheet` | [CÓ] `openBuy()` |
| C4 | Sheet mua `#buy-sheet` | checkbox waiver | bật nút thanh toán | [CÓ] (docs/04 §4.1) |
| | | `XÁC NHẬN & THANH TOÁN` | `PURCHASED=true` → `#startpoint` | [CÓ] `confirmBuy()` |
| | | chọn gói (tự đi GPX / có guide) | — | [THIẾU] — mục 2.4 |
| | | màn PREP (checklist thể chất/đồ + thời tiết + quyền GPS — docs/08 A2) | giữa mua và Bước 1 | [THIẾU] — mục 2.5 |
| C5 | BƯỚC 1 `#startpoint` | ← back | đóng | [CÓ] |
| | | ảnh thực địa + 3 dòng mốc nhận diện (`ic-photo/ic-home/ic-guide`) | — | [CÓ] |
| | | `SNAP GPS — DẪN TỚI ĐIỂM XUẤT PHÁT` | mô phỏng 3,2km→≤50m → `#sp-arrive` | [CÓ] `spSnap()` |
| | | nút `Nhắn guide` | `#chatview` | [THIẾU] — docs/02 màn XP có [Nhắn] |
| | | cảnh báo P1_WRONG (sai cổng/đường) | banner + nút gọi guide | [THIẾU] — mục 2.6 |
| C6 | Sheet tới nơi `#sp-arrive` | `XÁC NHẬN — BẮT ĐẦU ĐI CUNG` | `startTrek()` → Tab 3 + navcard | [CÓ] |
| | | `Chưa phải chỗ này` | đóng sheet, dẫn tiếp | [CÓ] |
| C7 | BƯỚC 2 Tab 3 `#s-map` | `DẪN` (M1) | repbar HUD 4 ô + terrain nghiêng + camera bay | [CÓ] `toggleGuideMode()` |
| | | `VT` (M2) | nền vệ tinh Esri, giữ dẫn | [CÓ] `toggleSat()` |
| | | `NÚI` (M3) | `#mount3d` | [CÓ] `open3D()` |
| | | `◎` | fit track | [CÓ] |
| | | `SOS` (tròn Terra) | `#sos-sheet` | [CÓ] `openSos()` |
| | | navcard khúc rẽ (`✕` dừng) | card rẽ THẬT từ TURNS | [CÓ] |
| | | repbar `✕` | dừng dẫn | [CÓ] |
| | | OffRouteBanner (Ember, lệch >50m) | mũi tên về track | [THIẾU] — mục 2.7a |
| | | toast mốc km (mỗi 2km) | tự tắt | [THIẾU] — mục 2.7b |
| | | nút Tạm dừng (P2_PAUSED) | đóng băng ETA | [THIẾU] — mục 2.7c |
| | | chip "đã xác minh cục bộ — chờ đồng bộ" (docs/09 §3) | — | [THIẾU] — mục 2.7d |
| C8 | Checkpoint `#cpmodal` | `📷 CHỤP ẢNH XÁC MINH` | ghi VERIFIED, đi tiếp | [CÓ] `cpShoot()` |
| | | `Bỏ qua (giảm mức xác minh)` | ghi skip, đi tiếp | [CÓ] `cpSkip()` |
| | | tự thu nhỏ thành icon nổi khi quá 50m (docs/08) | bấm lại mở modal — chụp bù (docs/09 §4) | [THIẾU] — mục 2.7e |
| C9 | SOS `#sos-sheet` | Gọi 112 / Gọi 115 / SMS SOS / Chia sẻ vị trí | (demo: hiển thị, không gọi thật) | [CÓ] — toạ độ GPS thật từ track |
| C10 | Finish `#finsheet` | chip `CERTIFIED · điểm xác minh x.xx` + bảng checkpoint ✓/bỏ qua | verify_score C3 thật | [CÓ] `buildFinish()` |
| | | nút `Xem cột mốc` → Hồ sơ | cột mốc mới sáng lên | [THIẾU] — mục 2.9 |
| | | nút `Chia sẻ thẻ hoàn thành` | thẻ chia sẻ kiểu Strava | [THIẾU] — mục 2.10 |
| C11 | Núi 3D `#mount3d` (M3) | ← đóng · `▶ MÔ PHỎNG LỘ TRÌNH` (HUD 5 ô) · +/−/⟲ · kéo xoay/nghiêng/pinch | — | [CÓ] |
| | | Climbing log (pin-s/camp/check/summit/f + card Nhóm/Guide/Mã hồ sơ/Waiver) | — | [CÓ] — mock đúng schema purchases |
| | | `xem danh sách` (nhóm 6 người) | danh sách thành viên | [THIẾU] — tĩnh |
| C12 | Tab 4 `#s-msg` | conv **A Của** | `#chatview` | [CÓ] `openChat()` |
| | | 2 conv còn lại (Nhóm Putaleng, POTTER Support) | cửa sổ chat | [THIẾU] — không bấm được |
| | | `＋ Nhóm` | tạo nhóm (Cấp 3) | [THIẾU] |
| C13 | Chat `#chatview` | ← đóng · bubbles (đã xem ✓✓, thu hồi, typing) | — | [CÓ] |
| | | ô soạn + `➤` gửi | gửi tin (server ✅ `POST /chat/.../messages`) | [THIẾU] — tĩnh |
| | | thanh ngữ cảnh cung (tên cung + nút "Điểm XP") | `#startpoint` | [THIẾU] — docs/02 Tab 4 |
| C14 | Tab 5 `#s-profile` | cover + uy tín 780/1000 + 4 ô cột mốc + 3 dòng mốc + Premium | — | [CÓ] — tĩnh |
| | | khối "Cung của tôi (đã mở/bán)" — Cấp 2 | danh sách + `＋ Ghi cung mới` → VAI 2 | [THIẾU] — điểm vào creator số 3, mục 2.9 |
| | | bấm 1 dòng cột mốc | chi tiết cột mốc + nút chia sẻ | [THIẾU] — mục 2.10 |

### 1.2. VAI 2 — NGƯỜI TẠO CUNG (creator, Cấp 2+) — **toàn bộ [THIẾU] trong preview**

**Điểm vào (đề xuất — cần chốt, xem câu hỏi Q1):**
1. **Chính:** Tab 2 nút `＋ Mở cung` (docs/02 đã đặc tả, chỉ hiện với Cấp 2+; Cấp 1 thấy khoá + "Lên Cấp 2 để mở đường").
2. **Nhanh:** giữ lâu FAB giữa → menu "Ghi cung mới" (docs/02 §0.3).
3. **Phụ:** Hồ sơ → khối "Cung của tôi" → `＋ Ghi cung mới`.

```
[＋ Mở cung / FAB giữ lâu / Hồ sơ]
        ▼
REC_CHECK (kiểm tra điều kiện) ──fail──► màn lý do (tier/GPS/pin/dung lượng)
        ▼ pass
RECORDING (RecorderHUD) ⇄ REC_PHOTO (chụp checkpoint giữa đường, camera in-app)
        │ ⏸ REC_PAUSED
        ▼ ⏹
REC_REVIEW (track trên M3 + M2, cắt đầu/cuối) ──► EDIT_CHECKPOINTS (CheckpointEditor)
        ▼
META (tên · mô tả · mùa · độ khó auto · giá) ──► SUBMITTED (POST /gpx/submit ✅)
        ▼                                              │ ảnh qua /media/upload 📋
Màn "Bản nộp của tôi" (GET /gpx/mine ✅ — pending/approved/rejected)
        ▼ admin duyệt (admin/index.html [CÓ] — tab "Duyệt GPX", PATCH /admin/gpx/:id ✅)
PUBLISHED: server TỰ TẠO cung, seller = mình + push kết quả (✅ đã code)
```

| # | Màn creator | Nút chính | Đích | Trạng thái |
|---|---|---|---|---|
| K1 | Menu FAB giữ lâu | Ghi cung mới / Điều hướng cung đã mua | REC_CHECK / go-sheet | [THIẾU] — mục 2.8a |
| K2 | REC_CHECK | `BẮT ĐẦU GHI` (disable tới khi 4 điều kiện xanh) | RECORDING | [THIẾU] — mục 2.8b |
| K3 | RECORDING (RecorderHUD) | `pin-photo` chụp · `⏸` · `⏹` | REC_PHOTO / PAUSED / REVIEW | [THIẾU] — mục 2.8c |
| K4 | REC_PHOTO | `CHỤP` (camera in-app) + chọn loại pin | quay lại RECORDING, +1 checkpoint đề xuất | [THIẾU] — mục 2.8d |
| K5 | REC_REVIEW | kéo cắt đầu/cuối · `TIẾP TỤC` | EDIT_CHECKPOINTS | [THIẾU] — mục 2.8e |
| K6 | EDIT_CHECKPOINTS | sửa/xoá/chú thích pin · `TIẾP TỤC` | META | [THIẾU] — mục 2.8f |
| K7 | META | `NỘP KIỂM DUYỆT` | SUBMITTED | [THIẾU] — mục 2.8g |
| K8 | Bản nộp của tôi | xem trạng thái + ghi chú admin | — | [THIẾU] — mục 2.8h |
| K9 | Admin duyệt (web riêng `admin/index.html`) | Duyệt/Từ chối GPX → tự tạo cung + push | — | **[CÓ]** — ngoài app, dùng cho demo |

---

## 2. NỘI DUNG CHUẨN TỪNG MÀN [THIẾU] (chữ thật, dựng được ngay)

> Mọi số liệu lấy từ dữ liệu THẬT đã nhúng trong preview: mảng `TAXUA` (lon,lat,ele — 17,2 km GPX thật),
> `CUM` (km luỹ kế), `REP.gain` (m leo luỹ kế), `TURNS` (khúc rẽ từ hình học), `TAXUA_DEM` (lưới DEM),
> `REP_PHOTOS` (6 ảnh thật ghim track), ảnh `photos/*.jpg`. **Không bịa số** (docs/08 §5).

### 2.1. Soạn bài / Check-in (Tab 1) — P1, không chặn demo
- **Tiêu đề:** `Check-in cung đường`
- **Chữ:** dòng gợi ý `Chia sẻ khoảnh khắc trên núi…` · chip đính kèm tự động `Tà Xùa – Sống lưng khủng long · 17,2 km · +1.880 m` · nút `ĐĂNG BÀI` (Lime) · phụ `Bài đăng kèm track sẽ hiện nút "Xem cung" cho người khác`
- **Icon:** header `ic-photo`, chip cung `ic-routes`
- **Dữ liệu:** km/leo từ `CUM`/`REP.gain` tại điểm cuối; ảnh chọn từ `photos/`.

### 2.2. Màn Tìm kiếm (Tab 2)
- **Tiêu đề:** `Tìm cung đường`
- **Chữ:** placeholder `Tìm cung, đỉnh, khu vực…` · nhóm gợi ý `GẦN ĐÂY TÌM NHIỀU`: `Tà Xùa · Lảo Thẩn · Putaleng · Kỳ Quan San` · nhóm `THEO VÙNG`: `Sơn La · Lào Cai · Lai Châu · Yên Bái` · empty-state: `Chưa có cung khớp "abc" — thử tên đỉnh hoặc vùng`
- **Icon:** `ic-routes` đầu mỗi kết quả, `ic-summit` cho đỉnh
- **Dữ liệu:** lọc client trên 4 cung của `#s-routes` (server thật chờ 📋 `GET /routes?q=`); tên gợi ý = 15 file GPX thật trong `prototype/gpx/`.

### 2.3. Card Thời tiết trong Chi tiết cung (CSS `.wx` đã có sẵn — chỉ thiếu markup)
- **Chữ:** `18°` + `⛅` · hàng 5 ngày `T6 22°/14° · T7 19°/12° · CN 17°/11°…` · dải an toàn (3 mức có sẵn class): xanh `Điều kiện tốt cho chuyến đi` / vàng `.warn` `Mưa nhẹ chiều — mang áo mưa` / đỏ `.danger` `Mưa lớn + gió mạnh — KHUYẾN CÁO HOÃN` (docs/08 PREP)
- **Dữ liệu:** preview mock 3 trạng thái, app thật nối `weather.ts`.

### 2.4. Chọn gói trong sheet mua (`#buy-sheet` bổ sung 1 hàng)
- **Chữ:** 2 lựa chọn radio: `Tự đi — GPX dẫn đường · 150.000đ` / `Có guide — GPX + A Của ★4.9 dẫn đoàn · 350.000đ` · dòng khoá với Cấp 1: `⚠ Cung Khó — tài khoản Cấp 1 chỉ mua được gói có guide` (docs/04 ma trận)
- **Icon:** `ic-routes` (tự đi) · `ic-guide` (có guide)

### 2.5. Màn PREP — checklist trước khi đi (giữa thanh toán và Bước 1, docs/08 A2)
- **Tiêu đề:** `Chuẩn bị trước khi đi`
- **Chữ (checkbox):** `☐ Đủ sức khoẻ, không bệnh lý cấm gắng sức` · `☐ Đủ nước & đồ ăn cho ~8 giờ` · `☐ Giày bám + đèn + áo mưa + sạc dự phòng` · `☐ Đã tải gói offline (track + ảnh checkpoint + DEM)` · `☐ Đã báo lịch trình cho người thân`
- **Khối thời tiết:** tái dùng card 2.3.
- **Khối quyền:** `POTTER cần: Vị trí (dẫn đường) · Camera (chụp checkpoint) · Thông báo` + nút `CHO PHÉP & TIẾP TỤC` (Lime); GPS bị từ chối → `Không có GPS thì không dẫn được — mở Cài đặt`
- **Icon:** `ic-check` từng dòng đạt · `ic-warn` thời tiết xấu · `ic-water` dòng nước
- **Dữ liệu:** danh sách checklist đúng docs/04 §4.3.

### 2.6. Banner P1_WRONG (Bước 1 — đi sai cổng/đường)
- **Chữ:** `Có vẻ bạn đi sai đường vào bản — khoảng cách đang TĂNG 5 phút liền.` + nút `Nhắn guide A Của` (mở `#chatview`) + nút phụ `Tôi biết đường, bỏ qua`
- **Icon:** `pin-warn` (Ember) trái banner
- **Vị trí:** slot TOP-BANNER (mục 4), màu nền `--terra-bg`.

### 2.7. Cụm bổ sung BƯỚC 2 (trên `#s-map`)
**a) OffRouteBanner (P2_OFFROUTE)**
- **Chữ:** `LỆCH TUYẾN 62 m — quay lại theo mũi tên` · phụ `GPS đo 1s/lần · gợi ý bật Vệ tinh để đối chiếu` · nút nhỏ `VT`
- **Icon:** `pin-warn` + mũi tên chỉ về `nearestIndex`
- **Dữ liệu:** khoảng cách thật `checkOffRoute` (hysteresis vào 50m/ra 30m — lib có sẵn); demo: nhánh giả lập rời track 3 điểm rồi quay lại.

**b) Toast mốc km tự động (mỗi 2 km)**
- **Chữ:** `✓ Mốc 4 km — 2:10 giờ · +610 m leo` (tự tắt 2,5s, không chặn touch)
- **Icon:** `pin-check` thu nhỏ 16px
- **Dữ liệu:** bắn khi `CUM[i]` vượt bội số 2.000; giờ = công thức Naismith có sẵn `mins=(CUM/4000)*60+(gain/600)*60`.

**c) Nút Tạm dừng (P2_PAUSED)**
- **Chữ:** thêm nút `⏸ Nghỉ` cạnh repbar; khi nghỉ: chip `Đang nghỉ — ETA đóng băng · GPS tiết kiệm pin (30s/lần)` + nút `▶ Tiếp tục`
- **Icon:** `ic-camp` trên chip (nghỉ trại).

**d) Chip trạng thái đồng bộ (docs/09 §3)**
- **Chữ:** vàng `● Đã xác minh cục bộ — chờ sóng để đồng bộ` → lime `● CERTIFIED — server đã xác nhận`
- **Vị trí:** trong `#finsheet`, ngay dưới chip CERTIFIED.

**e) Checkpoint thu nhỏ + chụp bù (docs/08 P2_CHECKPOINT + docs/09 §4)**
- **Hành vi:** quá 50m chưa xử lý → modal thu thành icon tròn nổi `pin-check` (slot LEFT-CHIP, mục 4); bấm lại mở modal khi còn TRONG hành trình và quay lại đúng bán kính.
- **Chữ khi mở lại:** `Chụp bù checkpoint 3 — bạn đang cách 38 m` · sau FINISHED thì khoá: `Hành trình đã kết thúc — không chụp bù được (chống gian lận)`.

### 2.8. CHUỖI MÀN CREATOR (VAI 2) — dữ liệu thật tái dùng track Tà Xùa (hoặc GPX thứ 2, xem Q5)

**a) Menu FAB giữ lâu**
- **Chữ:** `Ghi cung mới` (kèm nhãn `Cấp 2` — user hiện tại Nao Chi là Cấp 2 nên mở được) · `Điều hướng cung đã mua` · `Ghi track tự do`
- **Icon:** `ic-routes` · `ic-compass` · `ic-photo`

**b) REC_CHECK — "Kiểm tra trước khi ghi"**
- **Tiêu đề:** `Ghi cung mới — kiểm tra thiết bị`
- **4 dòng điều kiện (docs/08 B1):**
  - `✓ Tài khoản Cấp 2 — được mở & bán cung` (server enforce `@MinTier(2)` ✅)
  - `✓ GPS chính xác 8 m (yêu cầu < 20 m)`
  - `✓ Pin 84% (yêu cầu > 30%)`
  - `✓ Dung lượng trống 1,2 GB`
- **Nhắc bắt buộc:** khung Lime `📷 Ảnh ĐIỂM XUẤT PHÁT là bắt buộc — app sẽ nhắc chụp ngay khi bắt đầu ghi` (docs/00 §4)
- **Nút:** `BẮT ĐẦU GHI` (Lime, disable tới khi 4 dòng xanh) · fail → dòng đỏ ghi rõ lý do, ví dụ `✗ GPS 34 m — ra chỗ thoáng rồi thử lại`
- **Icon:** `ic-check` đạt · `ic-warn` fail · `pin-photo` khung nhắc ảnh

**c) RECORDING — RecorderHUD**
- **Bố cục:** HUD 4 ô kiểu repbar (tái dùng CSS `#repbar`): `KM 3,42` · `M LEO 512` · `ĐIỂM 683` · `THỜI GIAN 1:47`
- **Chữ phụ:** `Ghi mỗi 5 giây hoặc 10 m (tự chọn cái tới trước)` (docs/09 §1) · cảnh báo khi >15 km/h 5 phút: `Có vẻ đang đi xe — đoạn này sẽ bị đánh dấu` (flag segment)
- **3 nút đáy:** `📷 CHECKPOINT` (to, Lime, `pin-photo`) · `⏸` · `⏹ KẾT THÚC`
- **Nhắc mở màn:** toast `Chụp ảnh điểm xuất phát trước khi đi — bắt buộc` → mở luôn REC_PHOTO lần 1
- **Dữ liệu demo:** tua nhanh dọc `TAXUA`, số = `CUM`/`REP.gain` thật, đếm điểm = index.

**d) REC_PHOTO — chụp checkpoint giữa đường**
- **Tiêu đề:** `Checkpoint đề xuất #2`
- **Chữ:** khung camera in-app (không cho chọn gallery — docs/08 C2) · dòng toạ độ live `21.2036, 104.4310 · 1.612 m · 12:10` · gợi ý `Chọn chỗ trống tán cây để GPS chính xác` (docs/09 §2) · ô chú thích `Ngã ba rẽ trái lên sống lưng — dễ đi lạc`
- **Chọn loại pin (5 nút):** `pin-check` Xác minh · `pin-camp` Trại · `pin-water` Nước · `pin-warn` Cảnh báo · `pin-summit` Đỉnh
- **Nút:** `CHỤP & GHIM` (Lime) · `Huỷ`
- **Dữ liệu:** toạ độ + độ cao lấy từ điểm track hiện tại của mảng `TAXUA`.

**e) REC_REVIEW — xem lại track**
- **Tiêu đề:** `Xem lại cung vừa ghi`
- **Bố cục:** canvas M3 núi 3D (tái dùng `#mount3d` scene) + nút `VT` đối chiếu vệ tinh · thanh kéo 2 đầu `Cắt đầu/cuối thừa` (đoạn cắt hiện xám)
- **Chữ kiểm tra:** `✓ 17,2 km (tối thiểu 2 km)` · `✓ 3.812 điểm (tối thiểu 200)` · `✓ 6 checkpoint đề xuất — khuyến nghị ≥ 1 mỗi 2 km`
- **Nút:** `TIẾP TỤC — ĐẶT CHECKPOINT`
- **Icon:** `pin-s`/`pin-f` 2 đầu track, `ic-check` các dòng đạt.

**f) EDIT_CHECKPOINTS — CheckpointEditor**
- **Tiêu đề:** `Checkpoint của cung (6)`
- **Danh sách mỗi dòng:** icon pin + tên + km + 2 nút `Sửa`/`Xoá`; ví dụ nội dung thật:
  - `pin-s` `Điểm xuất phát — cổng đầu bản · km 0` (kèm khoá `Không xoá được — ảnh bắt buộc ✓`)
  - `pin-camp` `Trại 1 rừng trúc · km 5,4`
  - `pin-warn` `Vách đá trơn — bám dây · km 8,1`
  - `pin-check` `Sống lưng khủng long · km 10,6`
  - `pin-water` `Khe nước cuối · km 13,2`
  - `pin-summit` `Đỉnh Tà Xùa 2.865 m · km 15,8`
- **Nút:** `＋ Thêm checkpoint trên bản đồ` · `TIẾP TỤC`
- **Dữ liệu:** km từ `CUM` tại index pin (bộ index PINS có sẵn: 0/55/105/150/200/238/pk/cuối).

**g) META — thông tin bán**
- **Tiêu đề:** `Thông tin cung`
- **Trường:** `Tên cung: Tà Xùa – đường bản Chống Tra` · `Mô tả (≥100 ký tự)…` · `Mùa đẹp: Thu ▾` · `Độ khó (tự tính): KHÓ — 17,2 km · +1.880 m — admin sẽ duyệt lại` (auto `classifyDifficulty`) · `Giá bán: 350.000đ` · `Gói support: Chat trong 48h quanh ngày đi`
- **Nút:** `NỘP KIỂM DUYỆT` (Lime)
- **Chữ pháp lý:** `Cung sẽ được admin POTTER duyệt trước khi công khai. Bạn chịu trách nhiệm về độ chính xác GPX & cảnh báo đã đăng (Điều khoản người dẫn cung).` (docs/04 §4.2)

**h) SUBMITTED — "Bản nộp của tôi"**
- **Tiêu đề:** `Bản nộp GPX của tôi`
- **3 trạng thái dòng (đúng `GET /gpx/mine` ✅):**
  - `● Chờ duyệt` (vàng) `Tà Xùa – đường bản Chống Tra · nộp 12:31 hôm nay`
  - `✓ Đã duyệt — cung đã tạo` (lime) `Lảo Thẩn – Nóc nhà Y Tý · slug lao-than` + nút `Xem cung`
  - `✗ Từ chối` (terra) `Ghi chú admin: track đứt đoạn km 3–4, ghi lại đoạn này`
- **Chữ đáy:** `Duyệt xong bạn sẽ nhận thông báo đẩy.` (push ✅ đã code)
- **Icon:** `ic-routes` mỗi dòng · trạng thái dùng `ic-check`/`ic-warn`.

### 2.9. Hồ sơ — khối "Cung của tôi" + cập nhật cột mốc sau CERTIFIED
- **Khối bán (Cấp 2):** tiêu đề `CUNG CỦA TÔI (2)` · dòng: `Lảo Thẩn – Nóc nhà Y Tý · 400.000đ · 12 lượt mua` / `Tà Xùa – đường bản Chống Tra · ● chờ duyệt` · nút `＋ Ghi cung mới` → REC_CHECK
- **Cột mốc mới sau demo:** thêm dòng đầu danh sách, nền Lime nhạt: `🆕 pin-summit **Tà Xùa CERTIFIED** — 17,2 km · +1.880 m · điểm xác minh 0,93 · hôm nay` — đồng thời 4 ô cột mốc nhảy `14→15 cung`, `168→185 km`, `9.400→11.280 m leo`
- **Dữ liệu:** cộng dồn từ `CUM`/`REP.gain` cuối track + verify_score từ `buildFinish()`.

### 2.10. Thẻ chia sẻ CERTIFIED (kiểu Strava — guidelines brand)
- **Bố cục thẻ 4:5:** nền `#0e1712` · góc trên logo POTTER + chip Lime `CERTIFIED` · giữa: mesh Núi 3D thu nhỏ (chụp từ canvas `#m3-canvas`) với track Lime · dưới: `TÀ XÙA – SỐNG LƯNG KHỦNG LONG` (YoungDisplay) + 3 số: `17,2 km · +1.880 m · 10:14 giờ` + `Nao Chi · Cấp 2 · 24.11`
- **Nút:** `Chia sẻ ảnh` · `Đăng lên Cộng đồng` (mở màn 2.1 với thẻ đính kèm)
- **Icon:** `pin-summit` cạnh tên đỉnh, `ic-check` trong chip.

---

## 3. KỊCH BẢN DEMO 5 PHÚT (thứ tự khoe tự nhiên cho nhà đầu tư)

> Nguyên tắc kể chuyện: **xem → thèm → mua → đi → được chứng nhận → khoe → chính mình tạo cung bán lại** — khép kín vòng marketplace 2 chiều.

| Bước | Thời gian | Thao tác (trên preview) | Màn | Điểm nhấn nói với nhà đầu tư | Trạng thái |
|---|---|---|---|---|---|
| 1 | 0:00–0:20 | Mở app, cuộn feed | Tab 1 Cộng đồng | Ảnh thật cộng đồng trek VN; badge Cấp 1/2 gắn mọi user — hệ uy tín là xương sống | [CÓ] |
| 2 | 0:20–0:45 | Sang Tab 2, chỉ vào chip Khó + dòng cảnh báo | Tab 2 Cung đường | Thẻ cung đủ chỉ số **từ GPX thật**; "Cấp 1 cần guide" = an toàn + pháp lý enforce trong app | [CÓ] |
| 3 | 0:45–1:15 | Bấm thẻ Tà Xùa | `#detail` | 17,2 km · +1.880 m · đỉnh 2.871 m tính từ file GPX thật, không bịa; mini Núi 3D tự chạy % lộ trình | [CÓ] |
| 4 | 1:15–1:50 | `TOÀN MÀN` → kéo xoay 360°, bấm `▶ MÔ PHỎNG LỘ TRÌNH`, cuộn xuống Climbing log | `#mount3d` (M3) | **Màn ăn tiền nhất**: mesh DEM thật + bình độ brand + pin icon riêng; Climbing log lấy từ đơn mua thật (nhóm/guide/waiver) | [CÓ] |
| 5 | 1:50–2:10 | ← về, bấm MUA, tick waiver, thanh toán | `#buy-sheet` | Waiver điện tử bắt buộc trước cung Khó — lớp phòng vệ pháp lý của nền tảng | [CÓ] |
| 6 | 2:10–2:30 | Màn Bước 1: chỉ ảnh thực địa, bấm `SNAP GPS` | `#startpoint` | Khác biệt lớn nhất với Google Maps: **ảnh thực địa điểm xuất phát** + tự xác nhận khi ≤50 m | [CÓ] |
| 7 | 2:30–3:05 | `XÁC NHẬN` → Bước 2; bật `DẪN`; giữa chừng bấm `VT` rồi về | `#s-map` M1/M2 | Camera bay theo track kiểu COROS, HUD 4 ô số thật; 1 nút đổi vệ tinh mà không mất hành trình | [CÓ] |
| 8 | 3:05–3:25 | Modal checkpoint bật — `CHỤP ẢNH XÁC MINH`; lần sau `Bỏ qua` 1 cái | `#cpmodal` | Ảnh + GPS ≤50 m = bằng chứng đã đi thật — chống gian lận 5 lớp validate | [CÓ] |
| 9 | 3:25–3:35 | Bấm SOS xem sheet rồi đóng (không gọi) | `#sos-sheet` | SOS chạy bằng SMS/gọi — không cần server, chỉ cần sóng thoại | [CÓ] |
| 10 | 3:35–3:55 | Để chạy tới hết track → sheet tổng kết | `#finsheet` | Điểm xác minh tính thật → **CERTIFIED** — hoàn thành có chứng nhận, không tự khai | [CÓ] |
| 11 | 3:55–4:10 | Mở Hồ sơ: cột mốc mới + bấm `Chia sẻ thẻ` | Tab 5 + thẻ 2.10 | Cột mốc = tài sản danh tiếng của user → giữ chân + viral | [THIẾU] 2.9 + 2.10 |
| 12 | 4:10–4:45 | Giữ lâu FAB → `Ghi cung mới` → REC_CHECK → RecorderHUD (tua nhanh) → chụp 1 checkpoint → review → `NỘP KIỂM DUYỆT` | chuỗi 2.8 | **Vòng 2 chiều của marketplace**: người đi giỏi trở thành người bán — nguồn cung nội dung tự tăng | [THIẾU] toàn bộ |
| 13 | 4:45–5:00 | Mở tab trình duyệt `admin/index.html` → Duyệt GPX → `Duyệt` → quay lại app: thông báo + cung mới trên Tab 2 | Admin web | Kiểm duyệt là chốt chất lượng + pháp lý; duyệt xong server **tự tạo cung + push** (đã code thật, 41 test) | [CÓ] admin · [THIẾU] màn push trong preview |

**Đường tắt dự phòng khi demo (đề xuất dựng kèm):** phím `D` = nhảy tới 90% track (vào thẳng finish) · phím `C` = bật ngay 1 checkpoint · phím `O` = giả lập off-route 10 giây. Tránh chờ mô phỏng chạy khi nhà đầu tư hỏi xen.

---

## 4. QUY TẮC CHỐNG ĐÈ LẤN — hệ z-index & slot vị trí chuẩn

> Hiện trạng markup: z-index rải rác 5→20 không theo hệ (hd 5 · maptools/mapstats/sos 6 · repbar/navcard 7 · repx 8 · detail 9 · ovl 11 · mount3d 12 · backdrop 14 · sheet 15 · cpmodal 16 · nav 20). Đề xuất chuẩn hoá thành **8 lớp token** — mọi phần tử nổi mới PHẢI gán vào 1 lớp + 1 slot, không tự đặt số lẻ.

### 4.1. Bảng lớp (z-index token)

| Lớp (token) | z | Phần tử thuộc lớp | Quy tắc |
|---|---|---|---|
| `--z-map: 0` | 0 | canvas MapLibre / three.js | Không phần tử nào khác ở lớp này |
| `--z-float: 10` | 10 | maptools (DẪN/VT/NÚI/◎) · mapstats · nút SOS · chip checkpoint thu nhỏ · chip đồng bộ | Điều khiển thường trực trên map; không che nhau nhờ slot 4.2 |
| `--z-hud: 20` | 20 | repbar (M1) · navcard (khúc rẽ) · m3guide (HUD Núi 3D) · OffRouteBanner · banner P1_WRONG · RecorderHUD | HUD dẫn đường; **repbar và navcard loại trừ nhau** (bật DẪN thì tắt navcard — code hiện đã làm, nay thành luật) |
| `--z-overlay: 30` | 30 | `#detail` · `#startpoint` · `#chatview` · `#mount3d` · chuỗi màn creator · màn tìm kiếm | Màn phủ toàn phần; mở overlay mới phải đóng overlay cùng lớp (trừ mount3d đè detail — cho phép đúng 1 tầng chồng) |
| `--z-backdrop: 40` | 40 | sos-back · buy-back · go-back · sp-arrive-back | Nền mờ `rgba(18,19,21,.55)`; bấm = đóng sheet đi kèm |
| `--z-sheet: 50` | 50 | buy-sheet · go-sheet · sp-arrive · finsheet · sos-sheet · sheet chọn loại pin | Trượt từ đáy, `max-height 78%`; **chỉ 1 sheet mở tại 1 thời điểm** — mở mới phải đóng cũ |
| `--z-modal: 60` | 60 | cpmodal · khung camera REC_PHOTO | Modal giữa màn; **không đóng bằng backdrop** (phải chọn Chụp/Bỏ qua hoặc tự thu nhỏ về `--z-float`); khi mở thì tạm dừng mô phỏng (đã có) |
| `--z-toast: 70` | 70 | toast mốc km · toast "+điểm" · toast nhắc chụp ảnh XP | `pointer-events:none`, tự tắt 2,5 s, tối đa 1 toast |

Bottom nav giữ z:20 trong stacking context riêng (ngoài `main`) — luôn thấy được, TRỪ 2 trường hợp phủ kín: khung camera (modal 60) và thẻ chia sẻ.

### 4.2. Bảng slot vị trí (khung máy 390×800, statusbar 38 · nav 74)

| Slot | Toạ độ chuẩn | Phần tử được dùng slot | Luật tranh chấp |
|---|---|---|---|
| TOP-HUD | `top:0`, full-width, cao ≤120 | repbar · RecorderHUD | 1 phần tử/lúc; gradient nền để đọc trên map |
| TOP-CARD | `top:46; left:12; right:12` | navcard | Ẩn khi TOP-HUD đang bật |
| TOP-BANNER | ngay dưới TOP-HUD (`top:120`) hoặc `top:46` nếu không có HUD | OffRouteBanner · P1_WRONG · banner "GPS yếu" | 1 banner/lúc, ưu tiên: SOS-liên-quan > off-route > GPS yếu > khác |
| RIGHT-RAIL | `right:12; top:56`, xếp dọc gap 7 | maptools 4 nút | Tối đa 5 nút; thêm nút = thay, không nối dài |
| RIGHT-ACTION | `right:12; bottom:92` (trên mapstats) | nút SOS | **Bất khả xâm phạm** — không phần tử nào được đặt/che slot này ở mọi trạng thái |
| LEFT-CHIP | `left:12; bottom:92` | checkpoint thu nhỏ · chip "Đang nghỉ" · chip đồng bộ | Xếp dọc tối đa 2 chip, chip mới đẩy chip cũ lên |
| BOTTOM-STATS | `left:12; right:12; bottom:12` | mapstats (4 ô) | Ẩn khi có sheet mở |
| BOTTOM-SHEET | `left:0; right:0; bottom:0`, bo 26 trên | mọi sheet lớp 50 | Trượt lên trên nav (trong `main`), kéo xuống/backdrop để đóng |
| CENTER | giữa màn, rộng 270 | cpmodal · camera | Phía sau phủ backdrop lớp 40 |
| TOAST-SLOT | giữa ngang, `bottom:100` (trên mapstats) | toast lớp 70 | Không nhận touch |

### 4.3. Ba luật hành vi chống chồng (bắt buộc khi dựng màn mới)
1. **Một luồng một HUD:** trạng thái nào của máy trạng thái docs/08 cũng chỉ có đúng 1 phần tử lớp `--z-hud` hiển thị (bảng A2 quy định UI theo state — lấy đó làm nguồn).
2. **Modal chặn mô phỏng:** mọi phần tử lớp `--z-modal` mở ra phải pause timer dẫn/ghi (repTick, g3Tick, recorder) và resume khi đóng — `openCp()` đã làm mẫu.
3. **Không phủ SOS, không phủ nav:** trừ camera toàn màn, mọi lớp ≤60 phải chừa RIGHT-ACTION và bottom nav.

---

## 5. NĂM QUYẾT ĐỊNH CẦN HỎI USER

| # | Câu hỏi | Lựa chọn đề xuất |
|---|---|---|
| Q1 | **Điểm vào creator chính thức** ở đâu? | (a) chỉ nút `＋ Mở cung` Tab 2; (b) chỉ FAB giữ lâu; **(c) cả hai + lối phụ trong Hồ sơ "Cung của tôi" — khuyến nghị** (đúng docs/02 và dễ khoe trong demo bước 12) |
| Q2 | Sheet mua có thêm **chọn gói** (Tự đi 150k / Có guide 350k — mục 2.4) không, hay demo giữ 1 gói cố định 350k như markup hiện tại? | Thêm chọn gói — khoe được luôn luật "Cấp 1 chỉ mua gói có guide" (docs/04); tốn ~1 hàng UI |
| Q3 | Màn **PREP checklist + thời tiết** (mục 2.5, đúng docs/08) có đưa vào demo 5' không (tốn ~20 giây), hay dựng nhưng gắn nút `Bỏ qua (demo)`? | Dựng + nút bỏ qua — nhà đầu tư quan tâm pháp lý sẽ được chỉ vào, còn demo nhanh thì lướt |
| Q4 | **Thẻ chia sẻ CERTIFIED** (mục 2.10): xuất ảnh PNG thật từ canvas Núi 3D (đẹp, thêm ~nửa ngày dựng) hay chỉ màn hình tĩnh mô phỏng thẻ? | PNG thật từ `#m3-canvas` — đây là khoảnh khắc viral, đáng đầu tư |
| Q5 | Demo creator (bước 12) ghi **cung nào**? Tái dùng track Tà Xùa (nhanh, nhưng trùng cung consumer vừa đi) hay nhúng thêm GPX thứ 2 (đề xuất **Lảo Thẩn** — có sẵn `prototype/gpx/Lảo Thẩn.gpx`, chạy `gen-track.mjs` để nhúng)? | Lảo Thẩn — tách bạch "cung tôi mua" vs "cung tôi tạo", khớp luôn dòng "Đã duyệt — Lảo Thẩn" ở màn 2.8h và khối "Cung của tôi" 2.9 |

---

*Hết. Tham chiếu ngược: khi dựng các màn mục 2, giữ đúng token màu/typography của `app-preview.html` (Lime `#C9E265` CTA · terra/gold/sage theo ngữ nghĩa · nhãn `.k` 10px UPPERCASE · số `.v` tabular · YoungDisplay cho tiêu đề) và icon chỉ từ `brand/icons.js`.*
