# POTTER 3.0 — Master Brief (Bản brief gốc)

> File này là NGUỒN NGỮ CẢNH CHUNG cho mọi agent. Đọc kỹ trước khi làm việc.
> Ngôn ngữ đầu ra: **Tiếng Việt** (thuật ngữ kỹ thuật giữ nguyên tiếng Anh khi cần).

## 1. Sản phẩm là gì
App di động dành cho cộng đồng **trekking/hiking**. Giao diện tham khảo app Trung Quốc **两步路 (2bulu)**,
nhưng **điểm mạnh cốt lõi là BẢN ĐỒ** — ngang tầm **AllTrails / Gaia GPS / Astrail**.

Tên dự án nội bộ: **POTTER 3.0**.

## 2. Quyết định đã chốt (KHÔNG bàn lại)
- **Giai đoạn hiện tại:** Tài liệu thiết kế + đặc tả (spec). CHƯA viết code sản phẩm.
- **Map engine:** **MapLibre GL + OpenStreetMap** (mã nguồn mở, tự host tile, kiểm soát chi phí).
  Routing/snap dùng hướng **GraphHopper hoặc OSRM** trên dữ liệu OSM.
- **Tech stack:** CHƯA chốt — agent R&D phân tích & đề xuất (RN vs Flutter), user sẽ chốt sau.

## 3. Kiến trúc 5 Tab
1. **Tab 1 — Mạng xã hội trekker:** feed bài viết, ảnh, check-in cung đường, follow, like, comment (giống tab "在路上" trong ảnh 2bulu).
2. **Tab 2 — Cung đường:** danh mục cung (dễ/chuẩn/khó), thẻ cung có: khoảng cách, tổng leo (m), thời gian, mùa đẹp, độ khó, lượt lưu, nhiệt độ/độ hot. Có "điểm đến hot".
3. **Tab 3 — Bản đồ / Chỉ đường:** lõi map. Snap vào cung mẫu khi user đã MUA cung; user cấp 2+ được MỞ ĐƯỜNG mới (vẽ + snap-to-trail). Offline. Elevation profile.
4. **Tab 4 — Nhắn tin:** chat 1-1 và nhóm, đặc biệt giữa người mua cung và người bán/hướng dẫn (support).
5. **Tab 5 — Hồ sơ / Cột mốc / R&D:** profile, thành tích (cột mốc: số cung, tổng km, tổng leo), khu R&D/nghiên cứu thêm.

## 4. Luồng đặc biệt: Mua cung hướng dẫn
Khi user MUA một cung có hướng dẫn:
- **BƯỚC 1 — Dẫn tới ĐIỂM XUẤT PHÁT:** app track & chỉ đường đưa user từ vị trí hiện tại tới điểm bắt đầu cung.
  **Điểm xuất phát BẮT BUỘC có ẢNH thực địa** (để user nhận diện đúng chỗ).
- **BƯỚC 2 — Đi cung:** snap vào track mẫu của cung, dẫn đường theo GPX, cảnh báo lệch hướng.

## 5. Hệ thống 3 cấp người dùng (mục tiêu: giảm rủi ro pháp lý)
- **Cấp 1 (Mới):** chỉ được dùng/đặt các cung DỄ. Cung khó hơn BẮT BUỘC phải có người hướng dẫn đi kèm.
- **Cấp 2 (Có kinh nghiệm):** cung cấp đủ GPX cho app, được TỰ MỞ cung đường riêng và BÁN cung kèm support.
- **Cấp 3 (Doanh nghiệp/Tổ chức/Tour):** tài khoản tổ chức, chạy tour, quản lý đoàn.
Cần: tiêu chí thăng cấp, thang điểm/uy tín, và khung miễn trừ trách nhiệm (disclaimer) rõ ràng.

## 6. Nền tảng tính năng map (tham khảo Gaia GPS) — yêu cầu đặc tả
- **Lớp bản đồ nền:** địa hình (topo), vệ tinh, đường bộ. **Overlays:** waypoints, tracks, routes, lưới toạ độ. Điều chỉnh **opacity**, xếp chồng lớp.
- **Lập lộ trình thông minh:** snap-to-trail, autocalculated (chọn A→B tự tính), undo từng đoạn, out-and-back, back-to-start. Tính **khoảng cách, độ dốc, tổng leo, elevation profile** (dốc = đỏ, phẳng = xanh). Xem 3D.
- **Offline (tính năng sống còn):** tải bản đồ theo vùng (Area), chọn lớp + độ phân giải High, **tích "Include data to create and navigate routes offline"** để snap/route hoạt động khi mất sóng. Gói offline gắn với Premium.
- **Dữ liệu người dùng:** waypoint icon tuỳ chỉnh + ghi chú + phân loại folder; đồng bộ web↔mobile; xuất/nhập **GPX/KML**.
- **Kinh doanh & cộng đồng:** free vs Premium (mở khoá lớp nâng cao + offline); chia sẻ cung công khai; cộng tác nhóm trên cùng bản đồ.

## 7. Nguyên tắc phối hợp giữa các agent
- Mỗi agent ghi ra đúng **1 file** trong `docs/` theo phân công.
- Tham chiếu chéo bằng `[[tên-file]]` khi cần.
- Không tự ý đổi các quyết định đã chốt ở mục 2. Nếu thấy nên đổi → ghi vào mục "Rủi ro & đề xuất" của file mình, KHÔNG tự đổi.
- Viết ngắn gọn, có bảng, có checklist, đủ để agent Code triển khai sau này.
