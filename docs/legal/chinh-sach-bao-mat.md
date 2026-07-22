# Chính sách bảo mật (bảo vệ dữ liệu cá nhân) — POTTER

> ⚠️ **BẢN THẢO — cần luật sư rà soát trước khi công bố. Không phải tư vấn pháp lý.**
> Soạn theo **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân. Danh mục dữ liệu dưới đây
> liệt kê theo **hệ thống đã xây thật** (schema server + mã nguồn app tại thời điểm 2026-07-22);
> khi tính năng mới phát hành (thanh toán, KYC, upload ảnh/video) phải cập nhật chính sách TRƯỚC khi bật.

*Phiên bản: 0.1 (bản thảo) — Ngày soạn: 2026-07-22 — Hiệu lực: [chưa công bố]*

---

## 1. Chủ thể ban hành và phạm vi

1.1. Chính sách này mô tả cách **POTTER** ("Nền tảng", "chúng tôi") thu thập, xử lý, lưu trữ và bảo vệ **dữ liệu cá nhân** của người dùng ứng dụng POTTER, theo Nghị định 13/2023/NĐ-CP ("NĐ 13").

1.2. Vai trò theo NĐ 13: POTTER là **Bên Kiểm soát và xử lý dữ liệu cá nhân** đối với dữ liệu người dùng trên Nền tảng. Người bán cung Cấp 2/3 khi nhận thông tin người mua (qua booking, chat) có nghĩa vụ bảo mật riêng của họ.

1.3. Đơn vị vận hành: [tên pháp nhân — chưa công bố]. Liên hệ bảo vệ dữ liệu: mục 12.

## 2. Dữ liệu cá nhân chúng tôi thu thập (danh mục thật theo hệ thống)

### 2.1. Dữ liệu tài khoản (bạn cung cấp khi đăng ký)

| Dữ liệu | Chi tiết |
|---|---|
| Email | Định danh đăng nhập; dùng gửi link xác thực email |
| Tên hiển thị | Hiện trên hồ sơ, bài viết, chat |
| Mật khẩu | **Chỉ lưu dạng băm bcrypt** — hệ thống không lưu và không thể khôi phục mật khẩu gốc |
| Ảnh đại diện (nếu đặt) | URL ảnh hồ sơ |
| Đăng nhập Google/Apple (khi kích hoạt) | Email + tên từ nhà cung cấp; chúng tôi **không** nhận mật khẩu Google/Apple của bạn |

### 2.2. Dữ liệu vị trí (DỮ LIỆU NHẠY CẢM — xem mục 4)

| Dữ liệu | Khi nào thu thập |
|---|---|
| Vị trí GPS hiện tại | Khi bạn mở bản đồ, bắt đầu điều hướng, hoặc mở màn hình SOS — chỉ khi app đang dùng (foreground). Ứng dụng có khai báo quyền vị trí nền (background) phục vụ tính năng ghi track khi màn hình tắt; tính năng này chỉ chạy khi bạn chủ động bấm ghi hành trình |
| Track/hành trình đã ghi | Chuỗi toạ độ + độ cao + thời gian của chuyến đi bạn chủ động ghi lại |
| File GPX bạn tải lên (Cấp 2) | Lưu nguyên bản trên máy chủ để kiểm duyệt; chứa toạ độ tuyến đường bạn đã đi |

**Ứng dụng KHÔNG theo dõi vị trí của bạn khi bạn không dùng tính năng bản đồ/ghi track.** Không có cơ chế nào gửi vị trí định kỳ về máy chủ ngoài các tính năng bạn chủ động dùng.

### 2.3. Dữ liệu giao tiếp và cộng đồng

| Dữ liệu | Chi tiết |
|---|---|
| Tin nhắn chat (1-1 và nhóm) | Nội dung văn bản, người gửi, thời gian, trạng thái đã xem. Tin nhắn "thu hồi" bị ẩn nội dung với người nhận nhưng bản ghi vẫn tồn tại trên máy chủ (phục vụ điều tra vi phạm) |
| Bài viết, bình luận (khi tính năng phát hành) | Nội dung bạn đăng công khai |
| Báo cáo vi phạm | Người báo cáo, đối tượng bị báo cáo, lý do, kết quả xử lý |
| Danh sách chặn | Ai chặn ai (để chặn chat/hiển thị hai chiều) |

### 2.4. Dữ liệu kỹ thuật và an toàn

| Dữ liệu | Chi tiết |
|---|---|
| Device token thông báo đẩy | Mã "ExponentPushToken[...]" + loại máy (Android/iOS) — chỉ dùng gửi thông báo |
| Liên hệ khẩn cấp | Tên + số điện thoại người thân **do bạn tự khai** (dữ liệu của người thứ ba — bạn có trách nhiệm được người đó đồng ý). Hiện lưu **trên máy của bạn**; khi tính năng đồng bộ hồ sơ phát hành sẽ lưu trên máy chủ và chính sách này được cập nhật |
| Bản ghi waiver (khi phát hành đầy đủ) | Tài khoản, cung, độ khó, thời điểm ký, phiên bản điều khoản, thông tin thiết bị/IP — làm bằng chứng đồng thuận |
| Log bảo mật | Số lần đăng nhập sai, thời điểm khoá tạm; log lỗi hệ thống |
| Giao dịch mua cung | Cung đã mua, giá (VND), trạng thái. **Chưa có** cổng thanh toán — chúng tôi hiện **không** thu thập số thẻ/tài khoản ngân hàng; khi tích hợp, dữ liệu thanh toán sẽ do đối tác cổng thanh toán xử lý và được công bố bổ sung |
| Điểm uy tín, cấp tài khoản | Điểm 0–1000, cấp 1/2/3, lịch sử sự kiện điểm |

### 2.5. Dữ liệu chúng tôi KHÔNG thu thập (ở phiên bản hiện tại)

- Số thẻ ngân hàng, tài khoản thanh toán (chưa có cổng thanh toán);
- Danh bạ điện thoại, ảnh trong máy (app không xin quyền này);
- Giấy tờ tuỳ thân (luồng KYC lên Cấp 2 **chưa** phát hành — khi phát hành sẽ cập nhật chính sách và xin đồng ý riêng);
- Dữ liệu sinh trắc học.

## 3. Mục đích và cơ sở xử lý

| Nhóm dữ liệu | Mục đích | Cơ sở xử lý (NĐ 13) |
|---|---|---|
| Tài khoản (email, tên, hash mật khẩu) | Tạo/xác thực tài khoản, đăng nhập, khôi phục | Thực hiện hợp đồng (cung cấp dịch vụ) + sự đồng ý |
| Vị trí GPS, track | Hiển thị bạn trên bản đồ, dẫn đường, ghi hành trình, thống kê cột mốc (km, tổng leo) | **Sự đồng ý riêng** cho dữ liệu nhạy cảm (mục 4) |
| GPX tải lên | Kiểm duyệt và công khai cung do bạn mở/bán | Sự đồng ý + thực hiện hợp đồng (marketplace) |
| Tin nhắn | Vận hành tính năng chat mua–bán/hỗ trợ | Thực hiện hợp đồng |
| Báo cáo, chặn, waiver, log bảo mật | An toàn cộng đồng, xử lý vi phạm, bằng chứng đồng thuận, chống gian lận | Nghĩa vụ pháp lý + lợi ích hợp pháp (bảo vệ người dùng và nền tảng) |
| Device token | Gửi thông báo đẩy (kết quả duyệt GPX, tin nhắn mới) | Sự đồng ý (bạn cấp quyền thông báo, thu hồi được) |
| Giao dịch | Ghi nhận mua cung, đối soát, giải quyết tranh chấp | Thực hiện hợp đồng + nghĩa vụ pháp lý (kế toán/thuế) |

Chúng tôi **không** dùng dữ liệu cá nhân cho quảng cáo của bên thứ ba và **không bán** dữ liệu cá nhân dưới bất kỳ hình thức nào.

## 4. Dữ liệu vị trí là dữ liệu nhạy cảm

Theo Điều 2 NĐ 13, **dữ liệu vị trí của cá nhân được xác định qua dịch vụ định vị là dữ liệu cá nhân nhạy cảm**. Do đó:

- Ứng dụng chỉ truy cập GPS sau khi bạn cấp quyền qua hộp thoại hệ điều hành, **và** hiển thị thông báo về việc xử lý dữ liệu nhạy cảm khi bạn bật lần đầu tính năng vị trí (đồng ý riêng, tách khỏi đồng ý chung);
- Bạn tắt quyền vị trí bất kỳ lúc nào trong cài đặt hệ điều hành — bản đồ vẫn xem được, chỉ mất định vị/dẫn đường/ghi track;
- Track đã ghi thuộc quyền kiểm soát của bạn: xoá được từng hành trình; track chỉ công khai khi bạn chủ động chia sẻ/nộp làm cung;
- Vị trí trong màn SOS được đọc trực tiếp trên máy và gửi qua SMS/cuộc gọi **từ máy của bạn** — không đi qua máy chủ POTTER (mục 6).

## 5. Chia sẻ dữ liệu cho bên thứ ba (danh sách thật)

Nền tảng chỉ chia sẻ dữ liệu ở mức tối thiểu để vận hành các tính năng sau:

| Bên nhận | Dữ liệu họ nhận | Khi nào | Ghi chú |
|---|---|---|---|
| **Open-Meteo** (open-meteo.com) — dự báo thời tiết | **Chỉ toạ độ điểm xuất phát cung** (làm tròn 5 chữ số thập phân) + độ cao. **Không** kèm tên, email hay định danh tài khoản; không dùng API key | Chỉ khi bạn mở màn hình có thẻ thời tiết của một cung | Toạ độ gửi đi là **toạ độ của cung đường** (dữ liệu công khai), không phải vị trí đứng của bạn |
| **Expo Push Service** (exp.host — Expo, Mỹ) | Device token + tiêu đề/nội dung thông báo (ví dụ "Cung của bạn đã được duyệt") | Khi máy chủ gửi thông báo đẩy | Expo chuyển tiếp tới Google FCM/Apple APNs theo hạ tầng push chuẩn |
| **Máy chủ bản đồ**: OpenFreeMap (tiles.openfreemap.org), OpenTopoMap, Esri World Imagery (lớp vệ tinh), AWS S3 (dữ liệu độ cao terrarium) | Yêu cầu tải ô bản đồ (tile request): địa chỉ IP của máy bạn + toạ độ khu vực bản đồ đang xem (suy ra được vùng bạn quan tâm) | Mỗi khi bạn xem bản đồ trực tuyến | Đây là cách mọi ứng dụng bản đồ hoạt động; kế hoạch dài hạn là tự host tile để giảm phụ thuộc (docs/05 §3) |
| **Người bán cung** (Cấp 2/3) | Tên hiển thị + nội dung chat của bạn khi bạn đặt/nhắn tin với họ | Khi bạn chủ động giao dịch/chat | Người bán là bên độc lập, có nghĩa vụ bảo mật riêng |
| **Cơ quan nhà nước có thẩm quyền** | Theo phạm vi yêu cầu hợp lệ bằng văn bản | Khi luật yêu cầu | Có lập biên bản/lưu hồ sơ yêu cầu |

**Chuyển dữ liệu ra nước ngoài:** các dịch vụ Open-Meteo, Expo, Esri, AWS và một số máy chủ tile đặt ngoài Việt Nam. *(Luật sư cần đánh giá nghĩa vụ lập Hồ sơ đánh giá tác động chuyển dữ liệu cá nhân ra nước ngoài theo Điều 25 NĐ 13 trước khi phát hành chính thức.)*

## 6. SOS và chia sẻ vị trí — không qua máy chủ

Khi bạn dùng màn hình SOS:
- Toạ độ GPS được đọc **tại chỗ trên máy** và hiển thị cho bạn;
- Cuộc gọi 112/115/113 và SMS tới liên hệ khẩn cấp được thực hiện bởi **ứng dụng gọi điện/nhắn tin của điện thoại**, qua nhà mạng của bạn — **máy chủ POTTER không nhận, không lưu, không theo dõi** tín hiệu SOS;
- Nội dung SMS chứa toạ độ của bạn và đường dẫn bản đồ (maps.google.com) — người nhận mở đường dẫn đó theo chính sách riêng tư của Google;
- Tính năng "Chia sẻ vị trí" dùng cơ chế chia sẻ của hệ điều hành — dữ liệu đi tới ứng dụng bạn chọn (Zalo, Messenger…), theo chính sách của ứng dụng đó.

## 7. Thời hạn lưu trữ (đề xuất — luật sư chốt)

| Dữ liệu | Thời hạn |
|---|---|
| Tài khoản, hồ sơ | Đến khi bạn xoá tài khoản |
| Track/hành trình cá nhân | Đến khi bạn xoá từng track hoặc xoá tài khoản |
| GPX đã nộp làm cung công khai | Theo vòng đời cung; khi xoá tài khoản, cung đã bán giữ lại bản ghi tối thiểu phục vụ người đã mua (ẩn danh hoá người bán nếu yêu cầu xoá) |
| Tin nhắn chat | [24 tháng] kể từ ngày gửi hoặc đến khi xoá tài khoản (bản ghi phục vụ tranh chấp giữ theo vụ việc) |
| Bản ghi waiver | [5 năm] sau khi ký — bằng chứng đồng thuận cho khiếu nại/tranh tụng |
| Báo cáo vi phạm & kết quả xử lý | [5 năm] |
| Log giao dịch mua cung | Theo thời hạn chứng từ kế toán ([10 năm] — Luật Kế toán) |
| Device token | Đến khi bạn đăng xuất/gỡ app; token chết được hệ thống tự xoá |
| Log bảo mật (đăng nhập sai…) | [12 tháng] |
| Bản backup cơ sở dữ liệu | Tối đa 14 bản gần nhất (cơ chế backup hiện tại), tự ghi đè |

## 8. Quyền của chủ thể dữ liệu (Điều 9 NĐ 13)

Bạn có các quyền sau, thực hiện qua kênh liên hệ mục 12:

1. **Quyền được biết** về hoạt động xử lý (chính sách này);
2. **Quyền đồng ý / không đồng ý**;
3. **Quyền truy cập** — yêu cầu bản sao dữ liệu cá nhân của mình;
4. **Quyền rút lại sự đồng ý** — ví dụ tắt quyền vị trí, tắt thông báo đẩy; việc rút không ảnh hưởng tính hợp pháp của xử lý trước đó;
5. **Quyền xoá dữ liệu** — xoá track, xoá tài khoản (một số bản ghi được giữ theo mục 7 và nghĩa vụ pháp lý);
6. **Quyền hạn chế xử lý**;
7. **Quyền cung cấp dữ liệu** (xuất dữ liệu — app hỗ trợ xuất track ra file GPX chuẩn);
8. **Quyền phản đối xử lý**;
9. **Quyền khiếu nại, tố cáo, khởi kiện**;
10. **Quyền yêu cầu bồi thường thiệt hại** theo luật;
11. **Quyền tự bảo vệ**.

Chúng tôi phản hồi yêu cầu trong thời hạn **72 giờ** đối với các yêu cầu NĐ 13 quy định thời hạn này, và tối đa [15 ngày] cho các yêu cầu phức tạp (có thông báo tiến độ).

## 9. Biện pháp bảo vệ dữ liệu (đang áp dụng trong hệ thống)

- Mật khẩu băm **bcrypt**; trường mật khẩu/refresh token bị loại khỏi mọi truy vấn mặc định (select: false);
- Xác thực **JWT** vòng đời ngắn (15 phút) + refresh token băm lưu DB, thu hồi khi đăng xuất;
- Khoá tài khoản 15 phút sau 5 lần đăng nhập sai; giới hạn tần suất gọi API (rate limit);
- Kiểm tra dữ liệu đầu vào (validation) chống injection/XSS;
- Xác thực email bằng token một mục đích, hạn 24 giờ;
- Phân quyền admin/user và phân cấp 1/2/3 ở tầng API;
- Backup cơ sở dữ liệu định kỳ (giữ 14 bản);
- HTTPS bắt buộc khi triển khai production. *(Trạng thái thật: hệ thống chưa deploy public — HTTPS/hạ tầng thuộc checklist triển khai, xem docs/07-handover.md.)*

Khi xảy ra vi phạm dữ liệu cá nhân, chúng tôi thông báo Bộ Công an (Cục A05) trong **72 giờ** theo Điều 23 NĐ 13 và thông báo người dùng bị ảnh hưởng.

## 10. Dữ liệu trẻ em

- Nền tảng dành cho người từ đủ **16 tuổi**; chúng tôi không chủ đích thu thập dữ liệu trẻ em;
- Theo Điều 20 NĐ 13, xử lý dữ liệu trẻ em (dưới 16 tuổi) phải có sự đồng ý của trẻ (từ đủ 7 tuổi) **và** của cha mẹ/người giám hộ. Nếu phát hiện tài khoản của trẻ em không có sự đồng ý hợp lệ, chúng tôi sẽ xoá dữ liệu theo quy định;
- Cha mẹ/người giám hộ phát hiện con em dùng app có thể yêu cầu xử lý qua kênh mục 12.

## 11. Thay đổi chính sách

Thay đổi được thông báo trong ứng dụng trước khi hiệu lực; với thay đổi về phạm vi thu thập hoặc bên nhận dữ liệu mới, chúng tôi xin **đồng ý lại**. Phiên bản và ngày hiệu lực ghi ở đầu tài liệu.

## 12. Liên hệ — Bộ phận bảo vệ dữ liệu (DPO)

- Nhân sự phụ trách bảo vệ dữ liệu cá nhân: [họ tên — chưa chỉ định; NĐ 13 yêu cầu chỉ định bộ phận/nhân sự khi xử lý dữ liệu nhạy cảm]
- Email: [privacy@potter.vn — placeholder, domain chưa đăng ký]
- Địa chỉ: [trụ sở pháp nhân — chưa công bố]
- Cơ quan quản lý: Cục An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao (A05) — Bộ Công an.

---

*Việc cần làm trước khi công bố (ghi chú nội bộ, xoá khi phát hành): (1) luật sư rà toàn văn theo NĐ 13; (2) lập Hồ sơ đánh giá tác động xử lý dữ liệu cá nhân (Điều 24) và hồ sơ chuyển dữ liệu ra nước ngoài (Điều 25) nộp A05; (3) chỉ định bộ phận bảo vệ dữ liệu nhạy cảm; (4) bổ sung mục thanh toán/KYC khi tính năng bật.*
