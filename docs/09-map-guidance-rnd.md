# POTTER 3.0 — R&D dẫn đường & checkpoint (docs/09)

> Bước 2 pipeline. Trả lời câu hỏi mở của [[08-behavior-flows]] §D → tham số CHỐT cho UI/UX.

## 1. Tần suất GPS theo pha (tối ưu pin — mục tiêu ≥12h ghi liên tục)
| Pha | Tần suất | Lý do |
|---|---|---|
| P1 tới điểm đầu | 3s | đang di chuyển nhanh (xe), cần hướng mượt |
| P2 đang dẫn (bình thường) | 5s hoặc 10m | chuẩn ngành (Gaia/AllTrails 1–5s; 5s đủ mượt cho đi bộ 3–5km/h, tiết kiệm ~40% pin so 1s) |
| P2 gần checkpoint (<200m) | 1s | cần chính xác lúc validate ≤50m |
| P2 off-route | 1s | giúp thoát lệch nhanh |
| Paused / pin <20% | 30s / 10s | đóng băng ETA, giữ vệt thô |
| Creator ghi cung | 5s HOẶC 10m (adaptive) | cân chi tiết vs pin; lên dốc chậm thì 10m thắng |

## 2. Bán kính 50m trong rừng VN (multipath dưới tán)
- GPS smartphone trống trải: sai số 3–8m; dưới tán rừng rậm nhiệt đới: trung bình 15–30m, xấu nhất 40–60m (multipath + suy hao L1).
- ⇒ 50m là ngưỡng ĐÚNG cho điều kiện thường; giữ quy tắc docs/08 C1: `ngưỡng = max(50, accuracy+30)` trần **80m**; yêu cầu **10 giây liên tục** trong ngưỡng (median 5 mẫu ở nhịp 1s) để loại spike.
- Checkpoint đặt ở nơi thoáng (creator được nhắc khi tạo: "chọn chỗ trống tán cây nếu được").

## 3. Offline-first (cung không sóng toàn tuyến — phổ biến Tây Bắc)
- Gói offline khi mua: track + checkpoint(toạ độ, ảnh mẫu nén 512px) + DEM tile vùng + số khẩn cấp.
- Validate checkpoint chạy **cục bộ** (5 bước C1 đều offline được — DEM có sẵn trong gói); kết quả ký số đơn giản (hash chuỗi sự kiện + thời gian) lưu queue.
- Về sóng → sync queue lên server, server RE-VALIDATE (không tin client) rồi mới cấp CERTIFIED + uy tín. UI phân biệt trạng thái "đã xác minh cục bộ — chờ đồng bộ" (chip vàng) vs "CERTIFIED" (chip lime).

## 4. Chụp bù (miss checkpoint rồi quay lại?)
- CHO PHÉP chụp bù khi user còn trong hành trình (chưa FINISHED) và quay lại đúng bán kính — thực tế trekking hay vượt điểm nghỉ rồi quay lại.
- KHÔNG cho chụp bù sau khi FINISHED (chống quay lại hôm khác chụp gộp) — bước 3 C1 (liên tục thời gian) tự chặn.
- Checkpoint "bỏ qua" hiển thị xám trong FinishSummary, kèm nút "vì sao?" giải thích ảnh hưởng verify_score.

## 5. Benchmark guidance card (COROS / AllTrails / Gaia / Komoot)
| App | Điểm học | Áp vào POTTER |
|---|---|---|
| COROS | stats 4 ô to trên nền trời, đọc 1 liếc khi mệt | GuidanceHUD 4 ô: còn lại · độ cao · m leo còn · ETA (số to ≥22px, tabular) |
| Komoot | câu lệnh rẽ ngắn + khoảng cách lớn | card rẽ: chữ hành động 17px đậm, khoảng cách 22px |
| AllTrails | vệt "đã đi" đổi màu rõ | line Lime đã đi / xám mờ chưa đi (cả M1 lẫn mesh M3) |
| Gaia | vòng chính xác GPS quanh chấm vị trí | vẽ vòng accuracy mờ quanh chấm — trung thực độ tin |
- KHÔNG bịa pace/nhịp tim (không có cảm biến); ô thứ 4 là ETA Naismith ghi rõ "ước".

## 6. Brief cho UI (bước 3) — đối chiếu ảnh mẫu "Route covered"
Bám ảnh mẫu từng chi tiết + brand:
1. Header card: tab "Route covered | New view" (Young Display) + hàng icon `ic-*` bên phải.
2. Núi mesh contour: nét ~2 lớp hiện tại đạt; nền #0e1712.
3. **Pin = icon brand** (`pin-camp` Mist ×2, `pin-warn` Ember ×2, `pin-check` Lime, `pin-s/f/e` Cream, `pin-summit`), thân pin = cột mảnh xuống chân + chấm base — như ảnh mẫu.
4. **Vòng la bàn có VẠCH TICK** dày quanh chu vi + chữ W/N/S/E ở 4 hướng (đúng ảnh).
5. Route nét đứt trắng; đoạn ĐÃ ĐI (chế độ hướng dẫn) đổi Lime.
6. **Climbing log** dưới núi (đúng bố cục ảnh mẫu): timeline trái (icon pin nhỏ + vạch dọc) — mỗi mục: tiêu đề + thời gian; khối phải: lưới key-value (Group + avatar, Guide, Mã hồ sơ POTTER thay License, Status Approved ✓ = waiver đã ký). Dữ liệu từ đơn mua thật (mock preview theo đúng schema purchases/users).
7. **Guidance COROS ngay trong Núi 3D**: bar 4 ô nổi trên canvas khi bật "đi thử" — tiến trình sáng dần trên mesh.
8. Icon style toàn màn: outline 24/1.6 (guidelines); KHÔNG emoji ở màn này.

## 7. Quyết định 3 chế độ map (thực thi bước 4)
- `M1 DẪN ĐƯỜNG` (mặc định khi đi): topo + terrain 3D nghiêng + GuidanceHUD + checkpoint modal. (Đổi tên từ "replay" — logic giữ, ngữ nghĩa đổi: mô phỏng = demo preview của guidance.)
- `M2 VỆ TINH`: giữ nút; dùng chung HUD.
- `M3 NÚI 3D`: màn Mount3D mới theo brief mục 6.
- GỠ: nền "Sạch", nút ▶ replay riêng (guidance thay thế), nút 🗺.
