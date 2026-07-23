# POTTER 3.0 — Logic hành vi 2 vai người dùng (docs/08)

> Đặc tả state machine triển khai được. Nguồn quyết định: [[00-brief]] §4, [[04-user-tiers-scoring]],
> [[05-synthesis-spec]] (map = HƯỚNG DẪN ĐI, không phải record; 3 chế độ map; checkpoint 2 loại;
> ảnh checkpoint = xác minh ≤50m; climbing log từ đơn mua thật).
> Icon: bộ `prototype/brand/icons.js` (outline 24px stroke 1.6 — Porter Brand Guidelines "Bảng icon UI").

## 0. Ba chế độ map (đã chốt 2026-07-22)
| # | Chế độ | Nền | Dùng khi |
|---|---|---|---|
| M1 | **Hướng dẫn 3D** (mặc định) | Topo terrain nghiêng kiểu COROS, camera bay theo hướng đi, stats dẫn đường | Đang đi Phase 1/2 |
| M2 | **Vệ tinh** | Ảnh vệ tinh + track | Đối chiếu thực địa (ngã ba lạ, tìm mái nhà/khe suối) |
| M3 | **Núi 3D** (Core Map) | Mesh contour Lime/Pine xoay 360° + pin + Climbing log | Xem tổng quan cung, khoe cột mốc, chọn cung |
Bỏ: nền "Sạch", chế độ replay-record. Chuyển chế độ = 1 nút, giữ nguyên vị trí/tiến trình.

---

## A. VAI 1 — NGƯỜI DÙNG CUNG ĐƯỜNG (consumer)

### A1. Máy trạng thái tổng
```
BROWSE → PURCHASED → PREP → P1_TO_START → P1_NEAR → P2_GUIDING ⇄ P2_CHECKPOINT
                                              ↓            ↓ (lệch tuyến) P2_OFFROUTE
                                          P1_WRONG      P2_PAUSED / P2_SOS
                                                            ↓
                                                        FINISHED → CERTIFIED
```

### A2. Bảng trạng thái chi tiết
| State | Điều kiện VÀO | UI (chế độ map) | Sự kiện GPS/logic | Điều kiện RA / lỗi |
|---|---|---|---|---|
| **BROWSE** | mở Tab 2/3 | M3 núi 3D xem trước cung (track mờ, pin checkpoint hiện số lượng, KHÔNG hiện toạ độ chi tiết khi chưa mua) | — | mua → PURCHASED (waiver bắt buộc cung ≥Chuẩn, docs/04) |
| **PURCHASED** | thanh toán ok | xác nhận + tải offline pack (track + checkpoint + DEM vùng) | — | bấm "Xuất phát" (FAB) → PREP |
| **PREP** | — | checklist thể chất/đồ (docs/04) + thời tiết (weather.ts, danger → khuyến cáo hoãn) | xin quyền GPS/camera/notification | đồng ý → P1_TO_START; GPS denied → hướng dẫn bật, chặn tiếp |
| **P1_TO_START** | có vị trí | M1: mũi tên + khoảng cách/hướng tới ĐIỂM XUẤT PHÁT, ảnh thực địa thu nhỏ góc màn | tính d(pos, start) mỗi 3s; di chuyển >20km/h → gợi ý "đang đi xe — tắt dẫn bộ" | d<200m → P1_NEAR; GPS mất >60s → banner + giữ hướng cuối |
| **P1_NEAR** | d<200m | phóng to ảnh điểm xuất phát để đối chiếu + mốc nhận diện + tên guide chờ | d<50m liên tục 10s = XÁC NHẬN TỚI (chống GPS nhảy) | auto → P2_GUIDING (rung + thông báo); user có thể bấm tay "Đã tới" nếu GPS lệch (ghi log tự-xác-nhận) |
| **P1_WRONG** | d tăng dần 5 phút hoặc hướng ngược | cảnh báo "có vẻ sai cổng/đường" + nút gọi guide (chat) | — | quay lại giảm d → P1_TO_START |
| **P2_GUIDING** | từ P1 hoặc resume | M1 mặc định: card khúc rẽ (nav.ts generateTurns), còn lại/ETA/độ cao; nút đổi M2/M3 | positionAt + checkOffRoute (hysteresis VÀO 50m/RA 30m — lib có sẵn); mốc km tự động mỗi 2km → toast nhẹ | tới checkpoint (d<50m) → P2_CHECKPOINT; off → P2_OFFROUTE; đứng yên >10' → gợi ý P2_PAUSED |
| **P2_CHECKPOINT** | d(checkpoint)<50m | modal pin-check ✋: ảnh mẫu của người tạo cung + nút CHỤP ẢNH (pin-photo) | chụp → gắn toạ độ live + độ cao + timestamp → validate C1 (xem mục C) → lưu | đạt → đánh dấu ✓ + toast "+điểm"; TỪ CHỐI chụp → checkpoint ghi "bỏ qua" (không chặn đi tiếp, chỉ giảm mức xác minh); quá 50m mà chưa xử lý → tự thu nhỏ thành icon nổi, bấm lại được |
| **P2_OFFROUTE** | off=true | banner Ember + mũi tên về điểm gần nhất (nearestIndex) + khoảng cách lệch; M2 vệ tinh gợi ý bật | GPS 1s/lần (tăng tần suất) | d<30m → P2_GUIDING; lệch >500m hoặc >30' → gợi ý SOS/gọi guide |
| **P2_PAUSED** | user bấm nghỉ / auto | đóng băng ETA, GPS hạ tần suất 30s (tiết kiệm pin) | — | bấm tiếp tục → P2_GUIDING |
| **P2_SOS** | nút SOS | SosSheet (docs/05 §5 — GPS thật, SMS/gọi, không server) | — | đóng → về trạng thái trước |
| **FINISHED** | d(end)<50m hoặc user kết thúc | tổng kết: km/leo/thời gian thật + bảng checkpoint ✓/bỏ qua | tính điểm xác minh (mục C3) | → CERTIFIED nếu đạt ngưỡng |
| **CERTIFIED** | verify_score ≥0.7 | huy hiệu topography + cột mốc + cộng uy tín (docs/04) + thẻ chia sẻ kiểu Strava (guidelines) | server ghi completion | — |

**Pin & sự kiện phụ:** hết pin <20% → tự hạ GPS 10s/lần + tắt M1 3D về 2D nhẹ; mất GPS dưới tán rừng → dead-reckoning theo hướng+tốc độ cuối, banner "GPS yếu", KHÔNG tính checkpoint trong lúc mất GPS.

### A3. Sự kiện × chế độ map
| Sự kiện | M1 Hướng dẫn 3D | M2 Vệ tinh | M3 Núi 3D |
|---|---|---|---|
| Khúc rẽ | card to + camera xoay | card nhỏ | ẩn (không dẫn hướng) |
| Checkpoint tới gần | pin ✋ phóng to + modal | pin trên ảnh | pin sáng nhấp nháy trên mesh |
| Lệch tuyến | banner + line đỏ về track | banner | banner + chấm đỏ rời track |
| Tiến trình | line Lime vẽ dần | line Lime | đoạn mesh đổi màu đã-đi |

---

## B. VAI 2 — NGƯỜI TẠO CUNG (creator, Cấp 2+)

### B1. Máy trạng thái
```
IDLE → REC_CHECK → RECORDING ⇄ REC_PHOTO
                       ↓ REC_PAUSED
                   REC_REVIEW → EDIT_CHECKPOINTS → META → SUBMITTED → (admin duyệt) PUBLISHED
```
| State | Nội dung | Ràng buộc |
|---|---|---|
| **REC_CHECK** | kiểm tra: tier ≥2 (server enforce @MinTier), GPS accuracy <20m, pin >30%, dung lượng | fail → chỉ rõ lý do |
| **RECORDING** | ghi điểm: mỗi 5s HOẶC mỗi 10m (cái nào tới trước); background location; hiện km/leo/số điểm live | tốc độ >15km/h liên tục 5' → cảnh báo "có vẻ đang đi xe — đoạn này sẽ bị đánh dấu" (flag segment) |
| **REC_PHOTO** | nút chụp ảnh GIỮA ĐƯỜNG (pin-photo): ảnh gắn (lat,lon,ele,t) của điểm track hiện tại → thành **checkpoint đề xuất** | ảnh ĐIỂM XUẤT PHÁT bắt buộc (docs/00 §4) — nhắc ngay khi bắt đầu ghi |
| **REC_PAUSED** | tạm dừng (nghỉ trại) — đoạn pause không nối thẳng | — |
| **REC_REVIEW** | xem lại track trên M3 núi 3D + M2 vệ tinh, cắt đầu/cuối thừa | track tối thiểu: ≥2km & ≥200 điểm |
| **EDIT_CHECKPOINTS** | sửa/xoá/thêm chú thích checkpoint; gắn loại pin: ✋check / 🏕camp / 💧water / 📡warn / ⚑summit | khuyến nghị ≥1 checkpoint/2km; điểm xuất phát khoá không xoá |
| **META** | tên, mô tả, mùa, độ khó đề xuất (auto classifyDifficulty — admin duyệt lại), giá bán | — |
| **SUBMITTED** | POST /gpx/submit (đã có) + ảnh checkpoint qua /media/upload | admin duyệt = tạo cung, seller = mình (flow server đã chạy) |

---

## C. XÁC MINH ẢNH-GPX (dùng chung)

### C1. Validate 1 ảnh checkpoint (chạy CỤC BỘ khi chụp, verify lại server-side)
```
input: photo{lat,lon,ele,t_capture}, route_polyline, checkpoint{lat,lon}
1. d_cp = haversine(photo, checkpoint)         → PASS nếu ≤ 50m (GPS drift: nếu accuracy>30m thì ngưỡng = accuracy+30m, trần 80m)
2. d_route = min distance photo→polyline       → PASS nếu ≤ 50m (dùng thuật toán checkOffRoute, lib có sẵn app/src/lib/nav.ts)
3. Δt với checkpoint trước: tốc độ suy ra ≤ 6km/h leo núi (chống teleport/đi xe)
4. ele khớp DEM tại điểm đó ±150m (chống spoof toạ độ ngồi nhà)
5. Toạ độ lấy từ GPS LIVE lúc chụp trong app (không tin EXIF ảnh import)
→ verdict: VERIFIED | SUSPECT(lý do) | FAILED
```
### C2. Chống gian lận
- Spoof GPS: so tốc độ di chuyển + cao độ DEM (bước 3-4); Android check `isFromMockProvider`; iOS sourceInformation.
- Chụp màn hình/ảnh cũ: chỉ nhận ảnh chụp từ camera in-app (không cho chọn gallery ở luồng checkpoint).
- Đi hộ/đeo hộ máy: ngoài phạm vi kỹ thuật GĐ này — ghi nhận rủi ro, mức CERTIFIED chỉ là "rất có thể đã đi".

### C3. Điểm xác minh 1 lần hoàn thành
```
verify_score = 0.6·(checkpoint VERIFIED / tổng checkpoint creator)
             + 0.2·(mốc km auto đạt / tổng mốc)
             + 0.2·(liên tục thời gian hợp lý: không khoảng trống >4h giữa 2 điểm liên tiếp)
≥ 0.7 → CERTIFIED (cột mốc + uy tín docs/04) · 0.4–0.7 → "hoàn thành chưa xác minh đủ" · <0.4 → chỉ lưu nhật ký
```

---

## D. BÀN GIAO
**Cho R&D (docs/09):** chốt tần suất GPS tối ưu pin theo pha; bán kính 50m có phù hợp rừng rậm VN (nghiên cứu multipath); cơ chế offline-first khi cả cung không sóng (validate cục bộ, sync sau); UX từ chối chụp ảnh — có cho phép "chụp bù" khi quay lại?; benchmark COROS/AllTrails về guidance card.

**Cho UI (màn cần thiết kế):** `GuidanceHUD` (card rẽ + stats M1) · `CheckpointModal` (ảnh mẫu + nút chụp, pin ✋) · `StartPointCompare` (ảnh to đối chiếu P1_NEAR) · `OffRouteBanner` · `FinishSummary` (bảng checkpoint + huy hiệu topography) · `Mount3D` (y hệt ảnh mẫu: pin icons.js + vòng la bàn tick + Climbing log dữ liệu đơn mua thật) · `RecorderHUD` + `CheckpointEditor` (creator) · `MapModeSwitch` (3 nút M1/M2/M3).

**5 điểm cốt lõi:** (1) map là HƯỚNG DẪN — mọi state phục vụ đi tới đích an toàn, không phải xem lại; (2) chuyển pha tự động bằng GPS (200m/50m/10s) nhưng luôn có nút tay + ghi log; (3) checkpoint ảnh = bằng chứng ≤50m, validate 5 bước cục bộ + server; (4) creator chụp ảnh giữa đường chính là người "trồng" checkpoint cho consumer; (5) không bịa dữ liệu — thiếu GPS thì nói thiếu, điểm xác minh phản ánh đúng độ tin cậy.
