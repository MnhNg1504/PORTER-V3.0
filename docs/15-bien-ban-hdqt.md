# 15 — BIÊN BẢN HỌP HĐQT · Báo cáo CEO

> Trình: **Chủ tịch HĐQT** · Người báo cáo: **CEO** · Ngày: 2026-07-24
> Cơ sở: docs/13 (3 agent — UI/R&D/Trekker) + docs/14 (kiểm toán logic + 2 persona + kế hoạch R&D/UI).
> Mục đích: chốt (1) những gì DOANH NGHIỆP phải thay đổi, (2) những gì CHỦ TỊCH phải đích thân quyết.

---

## A. TÌNH HÌNH DOANH NGHIỆP (1 phút)

Potter là app trekking VN có **lõi kỹ thuật đã tốt và khác biệt thật**: bản đồ/GPX thật, và đặc biệt **hệ xác minh hoàn thành cung 5 bước (CERTIFIED)** — người dùng thử nói "tin nhất trong các app Việt". Đây là con hào công nghệ, phải giữ.

Nhưng doanh nghiệp **chưa bán được hàng**: toàn bộ mô hình tiền (cọc 30%, phí 10%, hoàn cọc, trả tiền người bán) **chưa tồn tại trong hệ thống**, và **cả hai phía thị trường đều rời đi ở bước quyết định**:
- **Người bán** (porter/guide bản địa): bỏ về Zalo ngay cửa — không đăng ký được cấp bán, không đặt giá, không biết có khách, không nhận được tiền.
- **Người mua**: tin sản phẩm nhưng không xuống tiền cho nhóm — thiếu luật cọc/hoàn, không nói chuyện được với người dẫn trước khi trả tiền.

**Kết luận CEO:** Sản phẩm không thiếu công nghệ — thiếu **luật kinh doanh** và **hạ tầng dòng tiền**. Đây là vấn đề của HĐQT, không phải của đội code.

---

## B. NHỮNG ĐIỂM DOANH NGHIỆP PHẢI THAY ĐỔI (CEO chịu trách nhiệm thực thi)

### B1. Sửa ngay — không cần chờ quyết định (tuần này)
Đây là lỗi kỹ thuật rõ ràng, CEO cho làm ngay:
1. **5 bug logic (H5,H6,H8,H9,H10)** — người bán không xem được cung của mình; lỗ farm uy tín; Cấp 1 lách được cung khó; nộp cung không nhập được giá; người bán không được báo khi có khách.
2. **Sửa 2 lỗi PHÁP LÝ trong giao diện**: bỏ câu "đã gửi trạm cứu hộ ✓" (ta không được hứa cứu hộ); làm rõ thuật ngữ tiền ("Kiểu 1/Kiểu 2" → tên người dùng hiểu).

### B2. Thay đổi cấu trúc — cần vốn & thời gian (CEO điều phối, sau khi Chủ tịch chốt phần C)
| # | Phải thay đổi | Vì sao | Hiện trạng |
|---|---|---|---|
| 1 | Dựng **hạ tầng thanh toán + ký quỹ (escrow)** VNPay/MoMo | Mọi dòng tiền đứng trên nó | Chưa có module nào |
| 2 | Biến "mua cung" thành **booking thật** (ngày đi, số người, cọc) | v3 bán theo chuyến/nhóm; hệ thống chỉ có mua-1-người | Sai mô hình |
| 3 | Dựng **cơ chế trả tiền người bán qua Momo** | Không có nó = không có người bán bản địa | Bằng 0 |
| 4 | **Offline map** (kéo từ giai đoạn cuối lên ngay) | Trek VN mất sóng là mặc định — đây là điểm an toàn yếu nhất | Chưa có |
| 5 | Mở **liên hệ người dẫn trước khi đặt cọc** | Rào cản niềm tin số 1 của người mua | Server sẵn, app còn mock |
| 6 | Thiết kế **~15 màn mới** ngoài 21 màn v3 (ví, hoàn cọc, waiver, hộp đơn người bán…) | 2 persona lộ ra khối lượng bị bỏ sót | Chưa vẽ |

> Khối lượng thiết kế tăng ~70% so với bản v3. CEO khuyến nghị **giãn scope theo giai đoạn**: chỉ làm phía MUA trước (ra doanh thu nhanh), phía BÁN làm sau — xem quyết định #7.

---

## C. NHỮNG ĐIỂM CHỦ TỊCH PHẢI ĐÍCH THÂN QUYẾT ĐỊNH

> Đây là các quyết định **cấp HĐQT** — ảnh hưởng doanh thu, pháp lý, hoặc chiến lược. CEO không tự quyết. Mỗi mục có **khuyến nghị của CEO** để Chủ tịch phê/sửa.

### 🔴 Nhóm 1 — DÒNG TIỀN & CHÍNH SÁCH (chặn toàn bộ doanh thu)

| # | Quyết định | Các phương án | CEO khuyến nghị |
|---|---|---|---|
| **QĐ-1** | **Thang hoàn cọc khi khách hủy** | (a) chặt: <72h mất 100% · (b) vừa: ≥7 ngày 100%, 3–7 ngày 50%, <72h 0% · (c) lỏng: luôn hoàn 90% | **(b)** — chuẩn ngành, bảo vệ 2 chiều |
| **QĐ-2** | **Phí Potter 10% ai chịu** | (a) trừ vào tiền người bán · (b) cộng vào giá khách · (c) chia đôi | **(a)** + hiển thị minh bạch "khách trả 350k → anh nhận 315k" |
| **QĐ-3** | **Phí cổng thanh toán (~1.5–2%) ai chịu** | người bán / khách / Potter gánh | Potter gánh giai đoạn đầu để giảm ma sát, xem lại khi có lượng |
| **QĐ-4** | **Cấp 1 có được mua cung "Chuẩn" không kèm người dẫn?** | (a) cấm, bắt buộc có guide · (b) cho phép tự đi | **(a)** — đóng lỗ pháp lý, đúng triết lý an toàn của ta |
| **QĐ-5** | **Bất khả kháng (bão)** | có cảnh báo thiên tai chính thức → đổi ngày miễn phí / hoàn 100% ? | **Có** — đây là nỗi lo lớn nhất của cả 2 phía |

### 🟠 Nhóm 2 — CHIẾN LƯỢC THỊ TRƯỜNG

| # | Quyết định | Vì sao là việc của Chủ tịch | CEO khuyến nghị |
|---|---|---|---|
| **QĐ-6** | **Mức KYC cho người bán bản địa** (porter H'Mông ít dùng smartphone) | Đánh đổi: chặt = an toàn pháp lý nhưng mất nguồn cung; lỏng = nhiều người bán nhưng rủi ro | KYC nhẹ (CCCD + 1 người xác nhận), cho tạo hồ sơ hộ — nếu không có nguồn cung thì không có chợ |
| **QĐ-7** | **Thứ tự ra thị trường: phía MUA trước hay cả 2 phía cùng lúc** | Quyết định scope, vốn, thời gian ra mắt | **Phía mua trước** (cung do ta/đối tác seed) → có doanh thu sớm → mới mở phía bán |
| **QĐ-8** | **Có làm Chợ bán/thuê đồ (gear) không** | R&D cảnh báo: KHÔNG phải lợi thế phòng thủ (WeTrek/shop đã làm) | Hoãn — chỉ pilot 1–2 hub sau khi thắng lõi trekking |
| **QĐ-9** | **Giá sàn/trần cung** để chống người bán phá giá nhau | Ảnh hưởng sức khỏe marketplace | Đặt giá sàn mềm; chưa cần trần |

### 🟡 Nhóm 3 — NGUỒN LỰC (Chủ tịch cấp vốn/người)

| # | Quyết định | Ghi chú |
|---|---|---|
| **QĐ-10** | **Ngân sách vận hành đội "war room" AI** | Đã chạm trần chi tiêu tháng khi phân tích sâu — cần Chủ tịch nâng hạn mức nếu muốn tiếp tục dùng nhiều agent song song |
| **QĐ-11** | **Nhân sự**: cần tuyển/hợp đồng ai cho payments + backend chợ? | Roadmap 14 tuần giả định có đủ người |
| **QĐ-12** | **Pháp lý**: thuê tư vấn cho waiver, escrow, bảo hiểm tai nạn kèm booking? | Ta đang chạm khu vực nhạy cảm (an toàn tính mạng + giữ tiền hộ) |

---

## D. LỘ TRÌNH CEO ĐỀ XUẤT (sau khi Chủ tịch chốt phần C)

| Giai đoạn | Thời gian | Mục tiêu | Điều kiện khởi động |
|---|---|---|---|
| **0. Vá & chốt luật** | Tuần 1–2 | 5 bug xong; luật QĐ-1→5 thành văn bản (docs/16) | Chủ tịch quyết Nhóm 1 |
| **1. Dòng tiền phía mua** | Tuần 3–6 | Thanh toán + cọc + hoàn chạy sandbox; booking có ngày/nhóm; chat mở | QĐ-6,7 + vốn |
| **2. Ra mắt phía mua** | Tuần 7–8 | Bán cung có người dẫn (nguồn cung seed) — **doanh thu đầu tiên** | GĐ1 xong |
| **3. Mở phía bán** | Tuần 9–14 | Trả tiền Momo, hồ sơ cấp bán, đánh giá, chợ porter | Thắng GĐ2 rõ bằng số |

**Ngưỡng ra quyết định tiếp:** không mở phía bán (GĐ3) cho tới khi GĐ2 chứng minh có người mua thật trả tiền thật.

---

## E. ĐỀ NGHỊ CHỐT HÔM NAY

Thưa Chủ tịch, để CEO khởi động, tôi cần Chủ tịch cho ý kiến **tối thiểu Nhóm 1 (QĐ-1→5)** và **QĐ-7 (thứ tự thị trường)**. Các mục còn lại có thể quyết ở phiên sau. CEO đề nghị **phê duyệt gói khuyến nghị mặc định** ở trên, hoặc chỉ ra mục nào Chủ tịch muốn đổi.

---

*Biên bản do CEO soạn từ docs/13 + docs/14. Các con số/luật là ĐỀ XUẤT chờ HĐQT phê duyệt, chưa phải chính sách chính thức.*
