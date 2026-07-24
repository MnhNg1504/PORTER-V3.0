> ⚠️ DRAFT — chưa có giá trị pháp lý tới khi luật sư có chứng chỉ rà soát (docs/17 §0).

# Chính sách hoàn tiền & huỷ đơn
# Refund & Cancellation Policy

> Soạn theo Nghị quyết HĐQT docs/16: **QĐ-1** (thang hoàn cọc), **QĐ-5** (bất khả kháng), Bộ luật nghiệp vụ mục C (cọc 30%, escrow, phí chia đôi).
> Diễn giải cho người dùng bằng ngôn ngữ dễ hiểu; con số theo QĐ đã chốt, mốc thời gian/khiếu nại là **đề xuất** cần luật sư xác nhận.

*Phiên bản: 0.1 (bản thảo) — Ngày soạn: 2026-07-24 — Hiệu lực: [chưa công bố]*

---

## 1. Các khái niệm (cho dễ hiểu)

- **Giá gốc (G):** giá người bán đặt cho cung.
- **Khách trả:** `G × 1,05` (đã cộng 5% phí Potter — QĐ-2).
- **Cọc:** **30%** giá trị đơn, giữ trong **escrow** (tài khoản giữ hộ) tới khi chuyến hoàn tất/hết hạn khiếu nại (mục C docs/16). Cọc **không** vào túi Potter khi đang giữ.
- **Escrow:** tiền được **bên giữ hộ (đối tác cổng thanh toán)** giữ, Potter **không tự ôm quỹ**. Đây là ranh giới pháp lý bắt buộc (docs/17 §0).

> **Ghi chú trung thực:** ở phiên bản hiện tại cổng thanh toán/escrow **đang phát triển (sandbox)**. Chính sách này áp dụng khi luồng tiền thật bật (Giai đoạn 2). Trước đó, mọi mô tả hoàn/huỷ chỉ là quy tắc dự kiến.

---

## 2. Khách huỷ — thang hoàn cọc (QĐ-1)

Số ngày tính **trước ngày khởi hành đã đặt (booking date)**:

| Thời điểm khách huỷ | Hoàn cọc | Diễn giải |
|---|---|---|
| **≥ 7 ngày** trước khởi hành | **100%** | Huỷ sớm, hoàn đủ cọc |
| **3 – 7 ngày** trước | **50%** | Hoàn một nửa cọc |
| **< 72 giờ** (dưới 3 ngày) | **0%** | Không hoàn cọc |

**Phần cọc bị mất chia thế nào:** phần cọc khách mất được chia **seller 50% / Potter 50%** (bù công giữ chỗ của người bán và chi phí vận hành). *(Luật sư xác nhận cách chia này có cần nêu minh bạch trong hợp đồng người dùng không.)*

> Ví dụ: đơn G = 1.000.000đ → khách trả 1.050.000đ, cọc 30% ≈ 315.000đ.
> - Huỷ trước 8 ngày: hoàn **315.000đ** (100% cọc).
> - Huỷ trước 5 ngày: hoàn **157.500đ** (50%); phần mất 157.500đ chia đôi seller/Potter.
> - Huỷ trước 2 ngày: hoàn **0đ**.

*(Phí cổng thanh toán ~1,5–2% do Potter gánh giai đoạn đầu — QĐ-3 — không trừ vào tiền hoàn cho khách.)*

---

## 3. Bất khả kháng — GHI ĐÈ thang trên (QĐ-5)

Khi có **cảnh báo thiên tai chính thức** (bão, lũ, sạt lở, cấm đường… từ cơ quan có thẩm quyền) tại **vùng của cung**, người mua được chọn **một** trong hai, **bất kể mốc thời gian** ở mục 2:

1. **Đổi ngày miễn phí** sang lịch khác của cùng cung/người bán; hoặc
2. **Hoàn 100%** (toàn bộ cọc; phần đã thanh toán ngoài cọc nếu có cũng hoàn đủ).

> Bất khả kháng **ghi đè** thang hoàn cọc — kể cả khách huỷ < 72h vẫn được hoàn 100% nếu do cảnh báo thiên tai.
>
> *(Luật sư quyết: định nghĩa "cảnh báo chính thức" — nguồn nào được coi là căn cứ, cần lưu bằng chứng gì; ai xác nhận điều kiện bất khả kháng để tránh lạm dụng.)*

---

## 4. Người bán huỷ / bùng đơn

Nếu **người bán** huỷ hoặc không thực hiện (bùng đơn):

- Người mua được **hoàn 100%** (cả cọc và mọi khoản đã trả);
- Người bán bị **phạt uy tín −50** và **đình chỉ nhận đơn 14 ngày nếu tái phạm** (mục C.5 docs/16).

Người mua không phải chịu bất kỳ khoản khấu trừ nào khi lỗi thuộc người bán.

---

## 5. Sau chuyến đi — xác nhận & khiếu nại

- Sau khi hoàn thành, người mua xác nhận **"kết thúc tốt đẹp"**; tiền được payout cho người bán **T+24h** sau xác nhận, hoặc **tự động T+72h** nếu không có khiếu nại (mục C.4 docs/16).
- **Cửa sổ khiếu nại:** người mua khiếu nại qua kênh hỗ trợ trong **[7 ngày]** kể từ ngày kết thúc dự kiến của cung. Trong thời gian này tiền vẫn giữ ở escrow.
- Potter đóng vai **trung gian hỗ trợ đối chiếu** (log chat, thông tin booking, bằng chứng waiver/track) nhưng **không phải bên phân xử**; quyết định bồi hoàn cuối cùng thuộc thoả thuận hai bên hoặc cơ quan có thẩm quyền, trừ trường hợp **lỗi kỹ thuật của Nền tảng**.

---

## 6. Cách nhận tiền hoàn

- Tiền hoàn về **phương thức thanh toán gốc** (hoặc Momo/tài khoản ngân hàng đã đăng ký) do đối tác cổng thanh toán xử lý;
- Thời gian tiền về tài khoản phụ thuộc ngân hàng/ví (thường vài phút đến vài ngày làm việc);
- Potter không giữ hộ tiền hoàn — lệnh hoàn được đẩy tới bên giữ escrow.

---

## 7. Bảng tóm tắt nhanh (cho màn hình app)

| Tình huống | Người mua nhận lại |
|---|---|
| Huỷ ≥ 7 ngày | 100% cọc |
| Huỷ 3–7 ngày | 50% cọc |
| Huỷ < 72h | 0% |
| Thiên tai (QĐ-5) | 100% hoặc đổi ngày miễn phí |
| Người bán huỷ/bùng | 100% (cọc + mọi khoản đã trả) |
| Lỗi kỹ thuật Nền tảng | 100% + hỗ trợ |

---

## Các điểm luật sư PHẢI quyết (cho file này)

1. **Mốc thời gian huỷ** (≥7 / 3–7 / <72h) và **cách chia phần cọc mất** (seller/Potter 50-50) có cần công khai từng chi tiết trong hợp đồng người dùng, và có vi phạm quy định bảo vệ người tiêu dùng không.
2. **Định nghĩa & bằng chứng "bất khả kháng"** (QĐ-5): nguồn cảnh báo chính thức được chấp nhận, ai xác nhận, chống lạm dụng.
3. **Cửa sổ khiếu nại [7 ngày]** và **auto-payout T+72h** — phù hợp Luật Bảo vệ quyền lợi người tiêu dùng chưa.
4. Vai trò **trung gian không phân xử** của Potter — câu chữ để không bị coi là bên chịu trách nhiệm hợp đồng dịch vụ lữ hành.
5. **Cấu trúc escrow hợp pháp**: Potter giữ tiền hộ có cần **giấy phép trung gian thanh toán** hay dùng **hợp đồng PSP giữ hộ** (docs/17 §0) — quyết định trước Giai đoạn 2.

---

*Tham chiếu: docs/16 (QĐ-1, QĐ-2, QĐ-3, QĐ-5, mục C) · [Điều khoản sử dụng](dieu-khoan-su-dung.md) §4 · Bộ luật Dân sự 2015 (bất khả kháng) · Luật Bảo vệ quyền lợi người tiêu dùng.*
