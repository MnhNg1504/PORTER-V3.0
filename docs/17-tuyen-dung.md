# 17 — Đội hình AI Agent cho Giai đoạn 1 (QĐ-11, QĐ-12)

> Nghị quyết HĐQT 2026-07-24: Chủ tịch chốt **chỉ dùng AI Agent** (không tuyển người) cho phần
> kỹ thuật payments/backend (QĐ-11) và soạn thảo pháp lý (QĐ-12).
> Tài liệu này định nghĩa **các vai Agent** + đầu ra, và **ranh giới AI không thay được người/pháp nhân**.

---

## §0. Ranh giới THẲNG THẮN (CEO báo cáo Chủ tịch)

Agent làm được rất nhiều, nhưng **có 4 việc luật không cho AI đứng tên** — Agent chỉ *chuẩn bị*, người/pháp nhân thật *ký*:

| Việc | Agent làm được | Vẫn cần người/pháp nhân thật |
|---|---|---|
| Tài khoản merchant VNPay/MoMo | Viết code tích hợp, tài liệu on-board | **Ký hợp đồng merchant** (cần pháp nhân + người đại diện) |
| Giữ tiền hộ (escrow) | Thiết kế luồng, ledger, đối soát | **Giấy phép trung gian thanh toán** hoặc hợp đồng PSP giữ hộ |
| Pháp lý (waiver, ToS, PDPD) | Soạn bản thảo, checklist tuân thủ | **Luật sư có chứng chỉ rà & chịu trách nhiệm** trước khi production |
| Bảo hiểm tai nạn | Soạn điều khoản, tích hợp API | **Hợp đồng với công ty bảo hiểm** |

→ Kết luận: **Agent dựng toàn bộ CODE + BẢN THẢO của Giai đoạn 1**; nhưng **cổng ra tiền thật (Giai đoạn 2)** vẫn phải chờ Chủ tịch cho một pháp nhân + một chữ ký luật sư. Agent không vượt được rào này, và không nên giả vờ vượt.

---

## §1. QĐ-11 — Đội Agent Kỹ thuật (dựng code, có thể chạy ngay)

| Agent | Nhiệm vụ | Đầu ra Giai đoạn 1 |
|---|---|---|
| **Agent Payments-Backend** | Module `payments` + `payouts` + `orders` (NestJS/PostGIS) | Vá H1–H4: Order state machine (pending TTL→deposited→confirmed→completed→refunded), escrow ledger, cọc 30% + hoàn theo QĐ-1, phí chia đôi QĐ-2 — chạy **sandbox** |
| **Agent Mobile-RN** | Màn luồng tiền phía mua + restyle v3 | Chọn ngày/nhóm, waiver ký số, màn cọc, hủy/hoàn hiển thị thang QĐ-1, trạng thái đơn; theme dark v3 (docs/13 §1.5) |
| **Agent Integration** | Code tích hợp PSP (VNPay/MoMo) + đối soát | Adapter thanh toán idempotent + webhook + reconciliation — test bằng sandbox key (chưa cần merchant thật) |
| **Agent QA-Verify** | Rà đối kháng + test | Test escrow/refund/race; giữ nguyên tắc "map thật"; verdict trước mỗi merge |

## §2. QĐ-12 — Agent Soạn thảo Pháp lý (bản thảo, người thật rà sau)

| Agent | Nhiệm vụ | Đầu ra |
|---|---|---|
| **Agent Legal-Drafter** | Soạn bản thảo để luật sư rà | Mẫu **waiver** ký số; **Điều khoản sử dụng**; **chính sách hoàn/hủy** (QĐ-1/5); checklist **PDPD Nghị định 13/2023** cho GPS/ảnh/CCCD; ghi chú cấu trúc escrow hợp pháp (PSP giữ hộ, Potter không tự ôm quỹ) |

> ⚠️ Mọi bản thảo pháp lý gắn nhãn **"DRAFT — chưa có giá trị pháp lý tới khi luật sư rà"**. Đây là ranh giới §0.

---

## §3. Cách vận hành đội Agent

- CEO điều phối; mỗi workstream = một workflow agent chạy nền, có **Agent QA-Verify** rà đối kháng trước khi commit.
- Ngân sách token: dùng credit war room đã mở lại (QĐ-10).
- **Cổng chặn giữ nguyên:** không mở tiền thật (GĐ2) tới khi có (a) pháp nhân + hợp đồng PSP, (b) luật sư rà bản thảo §2. Agent code sẵn để "cắm là chạy" ngay khi 2 thứ đó có.

## §4. Việc DUY NHẤT còn cần Chủ tịch (không Agent nào thay được)
1. Cho biết **pháp nhân** đứng tên merchant/PSP (công ty nào ký hợp đồng VNPay/MoMo).
2. Chỉ định **một luật sư/hãng luật** rà bản thảo §2 trước khi production (một lần, không cần retainer ngay).
3. Xác nhận **để Agent bắt đầu dựng code Giai đoạn 1** ngay bây giờ (sandbox, chưa đụng tiền thật).

*Tóm tắt: Chủ tịch chọn "chỉ dùng AI Agent" → CEO dựng được toàn bộ code + bản thảo GĐ1 bằng agent. Chỉ còn 2 chữ ký thật (pháp nhân PSP + luật sư rà) là bắt buộc ở cổng ra tiền thật — luật không cho AI ký thay.*
