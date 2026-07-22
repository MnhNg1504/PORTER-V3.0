# Điều khoản sử dụng POTTER

> ⚠️ **BẢN THẢO — cần luật sư rà soát trước khi công bố. Không phải tư vấn pháp lý.**
> Tài liệu do đội dự án soạn theo khung docs/04 (hệ 3 cấp + waiver) và docs/05 (quyết định đã chốt).
> Mọi con số (thời hạn, mức phạt, tuổi tối thiểu) là **đề xuất**, luật sư chuẩn hoá trước khi phát hành.

*Phiên bản: 0.1 (bản thảo) — Ngày soạn: 2026-07-22 — Hiệu lực: [chưa công bố]*

---

## 1. Định nghĩa dịch vụ — POTTER là gì và KHÔNG là gì

1.1. **POTTER** (tên dự án nội bộ POTTER 3.0, sau đây gọi là "Nền tảng") là ứng dụng di động và dịch vụ trực tuyến dành cho cộng đồng trekking/hiking, cung cấp:
- Công cụ **bản đồ và điều hướng** (bản đồ nền, dẫn đường theo track GPX, elevation profile, ghi hành trình);
- **Danh mục cung đường** do cộng đồng đóng góp (file GPX đã qua kiểm duyệt);
- **Kênh kết nối** giữa người đi cung và người bán cung/người hướng dẫn (marketplace + chat);
- Tính năng cộng đồng (bài viết, bình luận, hồ sơ, cột mốc thành tích);
- Công cụ hỗ trợ an toàn mang tính **tham khảo**: dự báo thời tiết (nguồn Open-Meteo), màn hình SOS (xem Điều 7).

1.2. **POTTER KHÔNG phải là đơn vị kinh doanh dịch vụ lữ hành** theo Luật Du lịch 2017. Nền tảng:
- **KHÔNG** tổ chức, điều hành hay bán tour/chuyến đi;
- **KHÔNG** tuyển dụng, thuê hay quản lý người hướng dẫn — người bán cung/hướng dẫn (Cấp 2) và tổ chức (Cấp 3) là **các bên độc lập** sử dụng Nền tảng để cung cấp dịch vụ của chính họ;
- **KHÔNG** đảm bảo tính chính xác tuyệt đối của dữ liệu bản đồ, GPX, thời tiết — tất cả chỉ mang tính **tham khảo**, thực địa có thể khác;
- **KHÔNG** cung cấp dịch vụ cứu hộ, cứu nạn (xem Điều 7).

1.3. Sử dụng Nền tảng đồng nghĩa bạn đã đọc, hiểu và đồng ý toàn bộ Điều khoản này, [Chính sách bảo mật](chinh-sach-bao-mat.md) và [Quy định nội dung](quy-dinh-noi-dung.md).

## 2. Tài khoản

2.1. **Đăng ký:** bằng email + mật khẩu, hoặc qua Google/Apple (khi tính năng được kích hoạt). Bạn phải cung cấp thông tin đúng sự thật và **xác thực email** theo hướng dẫn của Nền tảng.

2.2. **Độ tuổi:** người dùng phải từ đủ **16 tuổi** trở lên. Người từ đủ 16 đến dưới 18 tuổi cần sự đồng ý của cha mẹ/người giám hộ khi tham gia giao dịch mua cung. *(Ngưỡng tuổi cần luật sư xác nhận theo Bộ luật Dân sự và Nghị định 13/2023/NĐ-CP.)*

2.3. **Bảo mật tài khoản:** bạn tự chịu trách nhiệm giữ mật khẩu. Nền tảng lưu mật khẩu ở dạng **băm (bcrypt)** — không ai, kể cả quản trị viên, đọc được mật khẩu gốc. Tài khoản bị tạm khoá 15 phút sau 5 lần đăng nhập sai liên tiếp.

2.4. Mỗi người chỉ đăng ký một tài khoản cá nhân. Nghiêm cấm mạo danh người khác hoặc tổ chức khác.

## 3. Hệ thống 3 cấp tài khoản

Nền tảng phân người dùng thành 3 cấp (chi tiết kỹ thuật tại docs/04-user-tiers-scoring.md), với quyền và điều kiện như sau:

| Cấp | Tên | Được phép | Điều kiện đạt |
|---|---|---|---|
| **Cấp 1** | Mới (Newbie) | Đi cung **DỄ** một mình; đi cung khó hơn **chỉ khi có người hướng dẫn Cấp 2/3 trong booking**; dùng cộng đồng, chat, waypoint cá nhân | Đăng ký + xác thực email |
| **Cấp 2** | Có kinh nghiệm (Verified Leader) | Thêm: tự **mở cung** (upload GPX, qua kiểm duyệt), **bán cung kèm support**, dẫn Cấp 1, đi mọi độ khó một mình (vẫn ký waiver) | Đủ điểm uy tín (thang 0–1000) + xác minh danh tính (KYC) + đóng góp GPX được duyệt + chấp nhận "Điều khoản người dẫn cung" |
| **Cấp 3** | Doanh nghiệp/Tổ chức (Operator) | Thêm: tài khoản tổ chức, quản lý đoàn, chạy tour nhiều ngày, xuất hoá đơn VAT | **Pháp nhân + Giấy phép kinh doanh dịch vụ lữ hành** (Luật Du lịch 2017) + hợp đồng hợp tác với POTTER |

3.1. **Chặn trong ứng dụng:** Nền tảng chặn kỹ thuật (không cho đặt, không dẫn đường, không tải offline) khi Cấp 1 cố đi cung có độ khó từ CHUẨN (Moderate) trở lên mà không có người hướng dẫn. Việc chặn này là biện pháp hỗ trợ an toàn, **không** thay thế trách nhiệm tự đánh giá của người dùng (Điều 6).

3.2. **Thăng/giáng cấp:** thăng Cấp 2 qua duyệt (điểm uy tín + KYC); thăng Cấp 3 luôn xét hồ sơ pháp lý thủ công. Nền tảng có quyền giáng cấp/thu hồi quyền khi vi phạm hoặc khi Cấp 3 mất/hết hạn giấy phép lữ hành (thang xử lý tại [Quy định nội dung](quy-dinh-noi-dung.md)).

3.3. **Ranh giới Cấp 2:** hoạt động "bán cung kèm support" của Cấp 2 là **chia sẻ kinh nghiệm/hướng dẫn có thu phí giữa cá nhân**, không phải kinh doanh dịch vụ lữ hành. Cấp 2 **không được** tổ chức tour trọn gói, gom đoàn đông, bán dịch vụ vận chuyển/lưu trú kèm theo — các hoạt động đó yêu cầu Cấp 3 có giấy phép. Cấp 2 tự chịu trách nhiệm về nghĩa vụ thuế thu nhập cá nhân với khoản thu của mình. *(Ranh giới này cần luật sư xác nhận từng câu chữ — rủi ro pháp lý cao nhất của mô hình.)*

## 4. Giao dịch mua cung — vai trò các bên

4.1. Khi người mua mua một cung có hướng dẫn/support trên Nền tảng, quan hệ ba bên như sau:

| Bên | Vai trò | Chịu trách nhiệm về |
|---|---|---|
| **POTTER (Nền tảng)** | Trung gian kỹ thuật: hiển thị cung, xử lý đặt mua, giữ kênh chat, kiểm duyệt cơ bản GPX | Công cụ hoạt động đúng; kiểm duyệt hình thức (GPX hợp lệ, không vào vùng cấm rõ ràng); bảo mật dữ liệu |
| **Người bán (Cấp 2/3)** | Bên cung cấp dịch vụ: nội dung cung, ảnh điểm xuất phát, dẫn đường/support đã cam kết | Tính chính xác của GPX và cảnh báo mình đăng; chất lượng hướng dẫn/support; nghĩa vụ thuế; (Cấp 3) toàn bộ nghĩa vụ theo luật lữ hành |
| **Người mua** | Bên sử dụng dịch vụ | Tự đánh giá năng lực bản thân; tuân thủ cảnh báo, checklist an toàn; chuẩn bị thể chất/thiết bị |

4.2. **Hợp đồng dịch vụ hình thành trực tiếp giữa người mua và người bán.** POTTER không phải là một bên của hợp đồng đó, chỉ thu phí trung gian (hoa hồng marketplace) theo biểu phí công bố.

4.3. **Thanh toán:** trạng thái giao dịch trên hệ thống gồm chờ thanh toán / đã thanh toán / hoàn tiền / huỷ. *(Ghi chú trung thực: cổng thanh toán trực tuyến chưa được kích hoạt ở phiên bản hiện tại; khi tích hợp, điều khoản thanh toán — đối tác cổng thanh toán, thời điểm ghi nhận, quy trình hoàn tiền — sẽ được bổ sung và người dùng được thông báo.)*

4.4. **Hoàn tiền & tranh chấp giao dịch:** người mua khiếu nại qua kênh hỗ trợ trong vòng [7 ngày] kể từ ngày kết thúc dự kiến của cung. POTTER đóng vai trò hỗ trợ đối chiếu (log chat, thông tin booking) nhưng quyết định bồi hoàn cuối cùng thuộc thoả thuận giữa hai bên hoặc cơ quan có thẩm quyền, trừ trường hợp lỗi kỹ thuật của Nền tảng.

4.5. **Hoá đơn:** chỉ người bán Cấp 3 xuất hoá đơn VAT cho người mua. Nền tảng xuất hoá đơn cho phần phí trung gian của mình theo luật hiện hành.

## 5. Nội dung người dùng và sở hữu trí tuệ

5.1. Bạn giữ quyền sở hữu nội dung mình tạo (track GPX, ảnh, bài viết, đánh giá). Khi đăng lên Nền tảng, bạn cấp cho POTTER quyền không độc quyền, miễn phí bản quyền, phạm vi toàn cầu để lưu trữ, hiển thị, phân phối nội dung đó **trong phạm vi vận hành dịch vụ** (ví dụ: hiển thị cung đã duyệt cho người mua).

5.2. GPX do Cấp 2 nộp phải qua **kiểm duyệt** trước khi công khai/bán. Nền tảng lưu file GPX gốc để phục vụ kiểm duyệt lại và giải quyết tranh chấp.

5.3. Nội dung vi phạm bị xử lý theo [Quy định nội dung](quy-dinh-noi-dung.md).

## 6. Hoạt động mạo hiểm — miễn trừ trách nhiệm & waiver

6.1. **Trekking/hiking là hoạt động có rủi ro cao**: chấn thương, lạc đường, thời tiết xấu, địa hình nguy hiểm, thú rừng, và trong trường hợp xấu nhất là tử vong. Bạn tham gia hoàn toàn **tự nguyện** và **tự chịu trách nhiệm** về quyết định của mình.

6.2. **Waiver điện tử bắt buộc:** trước khi bắt đầu điều hướng bất kỳ cung có độ khó từ CHUẨN (Moderate) trở lên — áp dụng cho **mọi cấp tài khoản** — bạn phải xác nhận văn bản miễn trừ trách nhiệm điện tử, trong đó bạn:
- Xác nhận tự nguyện tham gia hoạt động có rủi ro cao;
- Xác nhận đủ điều kiện thể chất và trang thiết bị theo checklist của cung;
- Chấp nhận rằng POTTER **chỉ cung cấp công cụ bản đồ và thông tin tham khảo**, không đảm bảo an toàn;
- Đồng ý, trong giới hạn pháp luật Việt Nam cho phép, **miễn trừ trách nhiệm cho POTTER** đối với thiệt hại phát sinh từ quyết định tự nguyện của bạn.

6.3. Nền tảng lưu **bằng chứng đồng thuận** của mỗi lần ký waiver (tài khoản, cung, độ khó, thời điểm, phiên bản điều khoản, thông tin thiết bị/IP) — xem [Chính sách bảo mật](chinh-sach-bao-mat.md). Không có bản ghi waiver hợp lệ, ứng dụng không cho bắt đầu điều hướng cung khó.

6.4. **Dữ liệu tham khảo:** bản đồ nền, DEM/độ cao, track GPX, số liệu khoảng cách/tổng leo, dự báo thời tiết và đánh giá an toàn thời tiết trong ứng dụng đều có thể **sai lệch so với thực địa**. Bạn phải tự kiểm chứng và luôn ưu tiên quan sát thực tế.

6.5. Nền tảng không chịu trách nhiệm về: quyết định đi cung của người dùng; hành vi của người hướng dẫn/tổ chức (bên độc lập); tai nạn, thiệt hại người và tài sản ngoài thực địa; việc mất GPS/mất sóng/hết pin thiết bị.

## 7. SOS — chỉ là công cụ liên lạc

7.1. Màn hình SOS trong ứng dụng thực hiện đúng và **chỉ** những việc sau, trực tiếp từ điện thoại của bạn, **không đi qua máy chủ POTTER**:
- Hiển thị toạ độ GPS hiện tại (để bạn đọc qua điện thoại cho tổng đài cứu hộ);
- Mở cuộc **gọi** tới số khẩn cấp công cộng: 112 (cứu nạn cứu hộ), 115 (cấp cứu y tế), 113 (công an);
- Soạn sẵn **SMS** chứa toạ độ gửi tới liên hệ khẩn cấp bạn đã khai trong hồ sơ;
- Chia sẻ vị trí thông thường qua các ứng dụng khác trên máy.

7.2. Bạn hiểu và đồng ý rằng:
- POTTER **KHÔNG** vận hành tổng đài, **KHÔNG** theo dõi vị trí của bạn theo thời gian thực, **KHÔNG** nhận được tín hiệu SOS của bạn và **KHÔNG cam kết bất kỳ hoạt động cứu hộ nào**;
- Gọi điện/SMS phụ thuộc **sóng di động** tại chỗ và hoạt động của nhà mạng — nhiều khu vực núi không có sóng;
- Trách nhiệm chuẩn bị phương án an toàn (báo lịch trình cho người thân, thiết bị liên lạc vệ tinh nếu cần) thuộc về bạn.

## 8. Hành vi bị cấm

Danh mục nội dung cấm và hành vi cấm quy định tại [Quy định nội dung](quy-dinh-noi-dung.md), trong đó nghiêm trọng nhất: bán tour khi không có giấy phép (mạo Cấp 3), đăng GPX sai lệch cố ý gây nguy hiểm, mở cung vào khu vực cấm (biên giới, rừng đặc dụng cần giấy phép), gian lận điểm uy tín (giả mạo track GPS).

## 9. Chấm dứt tài khoản

9.1. **Bạn chấm dứt:** có thể yêu cầu xoá tài khoản bất kỳ lúc nào (quyền xoá dữ liệu — xem Chính sách bảo mật). Nghĩa vụ phát sinh trước khi xoá (giao dịch đang mở, tranh chấp đang xử lý) vẫn phải hoàn tất.

9.2. **Nền tảng chấm dứt/tạm khoá** khi: vi phạm Điều khoản này hoặc Quy định nội dung theo thang xử phạt; có yêu cầu của cơ quan nhà nước có thẩm quyền; tài khoản bị lạm dụng gây rủi ro an ninh.

9.3. Hệ quả với người bán Cấp 2/3 bị khoá: cung đang bán bị gỡ khỏi danh mục; booking chưa thực hiện được hoàn tiền cho người mua theo mục 4.4; nghĩa vụ với các booking đã thực hiện không tự động chấm dứt.

9.4. Một số dữ liệu được giữ lại sau khi xoá tài khoản trong thời hạn luật định hoặc để làm bằng chứng (bản ghi waiver, log giao dịch, báo cáo vi phạm) — chi tiết tại Chính sách bảo mật.

## 10. Giới hạn trách nhiệm

10.1. Trong giới hạn tối đa pháp luật Việt Nam cho phép, tổng trách nhiệm bồi thường của POTTER với một người dùng, cho mọi khiếu nại cộng dồn, không vượt quá **tổng phí dịch vụ người đó đã trả cho POTTER trong 12 tháng gần nhất** (không bao gồm phần đã trả cho người bán).

10.2. Giới hạn này không áp dụng cho các trách nhiệm không được phép loại trừ theo luật (ví dụ thiệt hại do lỗi cố ý của Nền tảng).

10.3. Bạn đồng ý bồi hoàn cho POTTER các thiệt hại phát sinh từ việc bạn vi phạm Điều khoản này hoặc vi phạm pháp luật khi dùng Nền tảng.

## 11. Thay đổi điều khoản

Nền tảng có thể sửa đổi Điều khoản; bản sửa đổi được thông báo trong ứng dụng tối thiểu [15 ngày] trước khi hiệu lực (trừ thay đổi theo yêu cầu pháp luật có hiệu lực ngay). Tiếp tục sử dụng sau ngày hiệu lực đồng nghĩa chấp nhận. Với thay đổi về waiver/miễn trừ, ứng dụng yêu cầu ký lại waiver phiên bản mới.

## 12. Luật áp dụng & giải quyết tranh chấp

12.1. Điều khoản này được điều chỉnh bởi **pháp luật Việt Nam**.

12.2. Tranh chấp giữa người dùng và POTTER được giải quyết theo trình tự: (a) thương lượng qua kênh hỗ trợ trong 30 ngày; (b) hoà giải; (c) nếu không thành, đưa ra **Toà án có thẩm quyền tại Việt Nam** nơi POTTER đặt trụ sở. *(Phương án trọng tài thương mại — cần luật sư tư vấn lựa chọn.)*

12.3. Tranh chấp giữa người mua và người bán: POTTER hỗ trợ cung cấp dữ liệu liên quan theo yêu cầu hợp lệ, nhưng không phải là bên phân xử.

## 13. Liên hệ

- Đơn vị vận hành: [tên pháp nhân — chưa thành lập/chưa công bố]
- Email hỗ trợ: [support@potter.vn — placeholder, domain chưa đăng ký]
- Bộ phận bảo vệ dữ liệu: xem [Chính sách bảo mật](chinh-sach-bao-mat.md)

---

*Tham chiếu nội bộ: docs/00-brief.md §5 · docs/04-user-tiers-scoring.md (toàn bộ) · docs/05-synthesis-spec.md §5 (SOS, quyết định đã chốt) · Luật Du lịch 2017 · Nghị định 13/2023/NĐ-CP.*
