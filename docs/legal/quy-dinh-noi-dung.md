# Quy định nội dung & Quy trình xử lý vi phạm — POTTER

> ⚠️ **BẢN THẢO — cần luật sư rà soát trước khi công bố. Không phải tư vấn pháp lý.**
> Quy trình dưới đây bám đúng công cụ **đã xây trong hệ thống** (module moderation: báo cáo →
> hàng đợi admin → resolved/dismissed; chặn người dùng 2 chiều; thu hồi tin nhắn 30 phút)
> và thang trừ điểm uy tín tại docs/04-user-tiers-scoring.md §2.3.

*Phiên bản: 0.1 (bản thảo) — Ngày soạn: 2026-07-22 — Hiệu lực: [chưa công bố]*

---

## 1. Phạm vi áp dụng

Quy định áp dụng cho **mọi nội dung người dùng tạo** trên POTTER:

| Loại nội dung | Trạng thái tính năng |
|---|---|
| Cung đường (GPX + tên + mô tả + ảnh điểm xuất phát) | Đang hoạt động — qua kiểm duyệt bắt buộc trước khi công khai |
| Tin nhắn chat 1-1 và nhóm | Đang hoạt động |
| Hồ sơ (tên hiển thị, ảnh đại diện) | Đang hoạt động |
| Bài viết, bình luận, ảnh/video cộng đồng | Sẽ áp dụng khi tính năng phát hành (hệ thống báo cáo đã hỗ trợ sẵn loại "bài viết") |
| Đánh giá người dẫn cung | Sẽ áp dụng khi tính năng phát hành |

## 2. Nội dung và hành vi bị cấm

### 2.1. Cấm theo pháp luật Việt Nam (gỡ ngay, không cần cảnh báo trước)

1. Nội dung chống Nhà nước CHXHCN Việt Nam; xuyên tạc lịch sử; phá hoại khối đại đoàn kết dân tộc (Điều 8 Luật An ninh mạng);
2. Nội dung khiêu dâm, đặc biệt liên quan trẻ em; buôn người; mại dâm;
3. Kích động bạo lực, khủng bố; hướng dẫn chế tạo/mua bán vũ khí;
4. Mua bán, quảng bá ma tuý và hàng cấm;
5. Cờ bạc, tổ chức đánh bạc;
6. Xúc phạm danh dự, nhân phẩm, vu khống cá nhân/tổ chức;
7. Xâm phạm quyền sở hữu trí tuệ.

### 2.2. Cấm đặc thù nền tảng trekking (rủi ro an toàn — xử lý nghiêm nhất)

1. **Bán tour không phép**: tài khoản Cấp 1/2 tổ chức, quảng bá hoặc bán tour trọn gói/gom đoàn — hoạt động đòi hỏi Cấp 3 có giấy phép lữ hành;
2. **GPX sai lệch cố ý** hoặc mở cung không cảnh báo nguy hiểm đã biết (vực, suối lũ, đoạn sạt lở);
3. **Mở cung vào khu vực cấm/hạn chế**: vành đai biên giới, khu quân sự, phân khu bảo vệ nghiêm ngặt của rừng đặc dụng/vườn quốc gia khi chưa có phép;
4. **Gian lận điểm uy tín**: giả mạo track (spoof GPS), thuê/mượn tài khoản để đạt Cấp 2, đánh giá ảo;
5. **Lừa đảo giao dịch**: bán cung không có thật, nhận tiền không thực hiện support đã cam kết, mạo danh người dẫn cung khác;
6. **Đăng vị trí thời gian thực của người khác** khi không được người đó đồng ý;
7. Quấy rối, đe doạ qua chat; spam quảng cáo; mạo danh POTTER hoặc cơ quan cứu hộ.

### 2.3. Nguyên tắc chung

Nội dung hợp pháp nhưng gây tranh cãi (đánh giá tiêu cực có căn cứ về người dẫn cung, cảnh báo nguy hiểm về một cung) **không** bị coi là vi phạm — nền tảng ưu tiên an toàn và thông tin trung thực.

## 3. Công cụ trong ứng dụng (đã hoạt động)

| Công cụ | Cách dùng | Cơ chế hệ thống |
|---|---|---|
| **Báo cáo (Report)** | Báo cáo một **người dùng, bài viết, cung đường hoặc tin nhắn**, kèm lý do (10–1000 ký tự) | Tạo bản ghi trạng thái `open` vào hàng đợi admin |
| **Chặn (Block)** | Chặn một người dùng; bỏ chặn được | Chặn **hai chiều**: hai bên không nhắn tin được cho nhau (hệ thống từ chối tạo hội thoại/gửi tin) |
| **Thu hồi tin nhắn** | Người gửi thu hồi trong **30 phút** | Nội dung ẩn với người nhận; bản ghi giữ lại phục vụ điều tra khi có báo cáo |
| **Kiểm duyệt GPX** | Bắt buộc với mọi cung do Cấp 2 nộp | Chỉ trạng thái `approved` mới tạo cung công khai; từ chối kèm ghi chú lý do; kết quả báo qua thông báo đẩy |

## 4. Quy trình xử lý vi phạm

### 4.1. Luồng xử lý báo cáo (khớp hệ thống moderation hiện có)

```
Người dùng gửi báo cáo (đối tượng + lý do)
        │
        ▼
Hàng đợi admin — trạng thái OPEN (sắp xếp theo thời gian gửi)
        │
        ▼
Admin xem xét: đối chiếu nội dung, lịch sử vi phạm, bằng chứng (log chat, GPX gốc…)
        │
        ├─► DISMISSED — báo cáo không có căn cứ (ghi chú lý do)
        │
        └─► RESOLVED — vi phạm xác nhận (ghi chú biện pháp đã áp dụng)
                │
                ▼
Áp dụng biện pháp theo thang xử phạt (mục 5) + thông báo cho các bên
```

- **Thời hạn xử lý mục tiêu:** [72 giờ] với báo cáo thường; **[24 giờ]** với báo cáo an toàn khẩn (GPX nguy hiểm, lừa đảo đang diễn ra) — có thể **tạm ẩn nội dung** ngay trong khi chờ xem xét;
- Mọi quyết định đều có **ghi chú xử lý** lưu trong hệ thống (trường resolutionNote) để phục vụ khiếu nại;
- Người báo cáo sai sự thật **có hệ thống, ác ý** cũng bị xem là vi phạm (mục 5).

### 4.2. Kiểm duyệt cung trước khi công khai

Cung do Cấp 2 nộp chỉ được bán/công khai sau khi admin duyệt: kiểm tra GPX hợp lệ, tên/mô tả phù hợp, không vào khu vực cấm rõ ràng. Việc duyệt là **kiểm duyệt hình thức** — không phải bảo chứng an toàn thực địa (xem Điều khoản sử dụng §6.4).

## 5. Thang xử phạt

Áp dụng **tăng nặng theo mức độ và số lần tái phạm**; vi phạm mục 2.1 hoặc lừa đảo/an toàn nghiêm trọng có thể áp mức cao nhất ngay lần đầu.

| Mức | Biện pháp | Áp dụng khi |
|---|---|---|
| 1 | **Nhắc nhở** + yêu cầu tự sửa/gỡ | Vi phạm nhẹ lần đầu (spam nhẹ, tên hiển thị không phù hợp) |
| 2 | **Gỡ nội dung** vi phạm | Nội dung vi phạm rõ nhưng chưa gây hậu quả |
| 3 | **Trừ điểm uy tín** (thang docs/04 §2.3) | Xem bảng dưới |
| 4 | **Đóng băng quyền** (cấm bán cung, cấm mở cung, cấm chat) có thời hạn | Vi phạm liên quan trực tiếp quyền đó |
| 5 | **Giáng cấp** (Cấp 2 → Cấp 1; thu hồi Cấp 3) | Tái phạm sau đóng băng; mất điều kiện cấp (hết hạn giấy phép lữ hành) |
| 6 | **Khoá tài khoản tạm thời** [7–90 ngày] | Vi phạm nghiêm trọng hoặc tái phạm nhiều lần |
| 7 | **Khoá vĩnh viễn** + báo cơ quan chức năng khi có dấu hiệu tội phạm | Lừa đảo, bán tour không phép tái phạm, nội dung mục 2.1 |

**Mức trừ điểm uy tín (đồng bộ docs/04 §2.3):**

| Vi phạm | Chế tài điểm |
|---|---|
| Track giả/gian lận (spoof GPS) | **−200** + cảnh cáo; tái phạm → khoá tài khoản |
| Mở cung sai lệch/nguy hiểm không cảnh báo | Gỡ cung + **−100**; tái phạm → giáng cấp |
| Đánh giá trung bình tụt dưới 3.0 (≥10 lượt) | Đóng băng quyền bán cung tới khi cải thiện |
| Khiếu nại có căn cứ từ người đi cùng | Điều tra; xác nhận đúng → giáng cấp/khoá |
| Bán tour không phép (mạo Cấp 3) | **Khoá tài khoản** + báo cáo cơ quan chức năng khi cần |
| Báo cáo sai sự thật ác ý, có hệ thống | −50/lần xác nhận; tái phạm → đóng băng quyền báo cáo |

Điểm uy tín tụt dưới ngưỡng duy trì (350 với Cấp 2) trong 2 kỳ đánh giá liên tiếp → tự động giáng về Cấp 1 (docs/04 §2.3).

## 6. Khiếu nại quyết định xử lý

1. **Kênh:** gửi khiếu nại qua [email hỗ trợ] trong vòng **[7 ngày]** kể từ khi nhận thông báo xử lý, nêu rõ mã vụ việc/nội dung bị xử lý và căn cứ phản đối;
2. **Người xử lý khiếu nại** phải **khác** người ra quyết định ban đầu (khi đội ngũ đủ nhân sự; giai đoạn đầu do quản trị viên cấp cao nhất xử lý);
3. **Thời hạn trả lời:** [7 ngày làm việc]; kết quả: giữ nguyên / giảm mức / huỷ quyết định + khôi phục nội dung và hoàn điểm uy tín;
4. Quyết định sau khiếu nại là **quyết định cuối cùng** của nền tảng; người dùng vẫn bảo lưu quyền khiếu nại/khởi kiện theo pháp luật;
5. Trong thời gian chờ khiếu nại, biện pháp đã áp không tự động tạm dừng (trừ khi admin quyết định khác).

## 7. Nghĩa vụ lưu trữ và phối hợp

- Bằng chứng vụ việc (báo cáo, ghi chú xử lý, nội dung liên quan kể cả tin nhắn đã thu hồi) được lưu theo thời hạn tại [Chính sách bảo mật](chinh-sach-bao-mat.md) §7;
- Nền tảng phối hợp cung cấp thông tin cho cơ quan nhà nước có thẩm quyền theo yêu cầu hợp lệ bằng văn bản;
- Với hành vi có dấu hiệu tội phạm (lừa đảo chiếm đoạt tài sản, tổ chức đưa người vào khu vực cấm), nền tảng chủ động trình báo.

---

*Tham chiếu: docs/04-user-tiers-scoring.md §2.3 (thang trừ điểm), §4.4 (khu vực nhạy cảm) · mã nguồn module moderation (`server/src/moderation/`, `server/src/admin/`) · Luật An ninh mạng 2018 · Nghị định 13/2023/NĐ-CP.*
