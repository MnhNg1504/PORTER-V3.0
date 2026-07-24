# 16 — CHÍNH SÁCH CHÍNH THỨC (Nghị quyết HĐQT)

> Nguồn: phiên họp HĐQT ngày 2026-07-24 (biên bản docs/15). Chủ tịch HĐQT phê duyệt.
> Đây là **chính sách ràng buộc** cho R&D/Kỹ thuật/Sản phẩm. Thay đổi phải qua HĐQT.

## A. Các quyết định đã CHỐT

| Mã | Nội dung | **Quyết định** |
|---|---|---|
| **QĐ-1** | Thang hoàn cọc khi khách hủy | **≥7 ngày: 100% · 3–7 ngày: 50% · <72h: 0%** (phần cọc mất: seller 50% / Potter 50%) |
| **QĐ-2** | Phí Potter 10% ai chịu | **Chia đôi**: 5% cộng vào giá khách + 5% trừ payout người bán |
| **QĐ-3** | Phí cổng thanh toán (~1.5–2%) | **Potter gánh giai đoạn đầu** để giảm ma sát; xem lại khi có lượng |
| **QĐ-4** | Cấp 1 × độ khó cung | **(a)** Cấp 1: cung Chuẩn BẮT BUỘC đặt guide; cung Khó **cấm hẳn kể cả free**. Server chặn thật |
| **QĐ-5** | Bất khả kháng (bão) | **Có**: cảnh báo thiên tai chính thức tại vùng cung → đổi ngày miễn phí hoặc hoàn 100% |
| **QĐ-6** | KYC người bán bản địa | **Nhẹ**: CCCD + 1 người xác nhận; cho tạo hồ sơ hộ (porter ít dùng smartphone) |
| **QĐ-7** | Thứ tự ra thị trường | **Phía MUA trước** (cung do ta/đối tác seed) → doanh thu sớm → mới mở phía bán |
| **QĐ-8** | Chợ bán/thuê gear | **Hoãn**; chỉ pilot 1–2 hub sau khi thắng lõi trekking |
| **QĐ-9** | Giá sàn/trần cung | **Giá sàn mềm; chưa cần trần** |
| **QĐ-10** | Ngân sách war room AI | **Đã nâng lại credit** |

## B. Nhân sự & thuê ngoài (ĐÃ DUYỆT — chi tiết docs/17)

| Mã | Nội dung | **Quyết định** |
|---|---|---|
| **QĐ-11** | Nhân sự cho payments + backend chợ | **Duyệt tuyển** — hồ sơ tuyển: docs/17 §1 (1 Senior Backend + 1 Mobile RN + 1 contractor Payments) |
| **QĐ-12** | Thuê tư vấn pháp lý (waiver, escrow, bảo hiểm, dữ liệu cá nhân) | **Duyệt thuê** — phạm vi & mô hình: docs/17 §2 (ưu tiên chốt cấu trúc escrow hợp pháp TRƯỚC Giai đoạn 1) |

> Lưu ý CEO: tôi (CEO-AI) không ký hợp đồng lao động với người thật. docs/17 là **hồ sơ tuyển dụng** để Chủ tịch/HR tuyển; trong lúc chờ, đội agent lấp tạm để không chặn Giai đoạn 1.

## C. Bộ LUẬT nghiệp vụ suy ra (áp dụng khi dựng payments — Giai đoạn 1)

1. **Giá hiển thị**: người bán đặt giá gốc G. Khách trả `G × 1.05`. Người bán nhận `G × 0.95`. Potter giữ `G × 0.10` (đã gồm gánh phí cổng ở GĐ đầu). Hiển thị cho người bán: "khách trả X → anh nhận Y".
2. **Cọc**: 30% giá trị đơn, giữ trong escrow tới khi chuyến hoàn tất/hết hạn khiếu nại.
3. **Hoàn cọc**: theo QĐ-1. Bão (QĐ-5) ghi đè → hoàn 100% bất kể mốc thời gian.
4. **Payout**: Momo/bank, T+24h sau khi khách xác nhận "kết thúc tốt đẹp", auto T+72h nếu không khiếu nại.
5. **Seller bùng/hủy**: hoàn khách 100% + phạt uy tín −50 + đình chỉ nhận đơn 14 ngày nếu tái phạm.
6. **Cấp 1**: chỉ tự đi cung Dễ; Chuẩn cần guide; Khó cấm (đã enforce — mục D).
7. **Chống đạo GPX**: track nộp overlap ≥80% cung đã publish → từ chối tự động + yêu cầu ≥3 ảnh checkpoint EXIF-GPS khớp track.

## D. Đã THỰC THI ngay — Giai đoạn 0 (vá 5 bug logic, docs/14)

> Commit cùng nhánh. Typecheck sạch, 69/69 test pass (thêm `common/__tests__/access.test.ts`).

| Bug | Sửa | File |
|---|---|---|
| **H8** | Enforce cấp THẬT ở mọi cửa (mua, tải track, đi cung) — kể cả cung miễn phí — theo QĐ-4. Helper dùng chung `tierAccess`/`assertTierAccess` | `common/access.ts` (mới); áp ở `purchases.service`, `routes.service.fullTrack`, `completions.assertAccess` |
| **H5** | Người bán xem được track cung của CHÍNH MÌNH (trước đây bị 403) | `routes.service.fullTrack` (thêm `isSeller`) |
| **H6** | `finish()` chốt trạng thái ATOMIC (`UPDATE … WHERE status='active'`) — chặn double-submit cộng uy tín 2 lần | `completions.service.finish` |
| **H9** | Người mở cung ĐỊNH GIÁ ngay khi nộp GPX; admin duyệt → route lấy đúng giá | `gpx-submission.entity`, `gpx.service.submit`, `gpx.controller` DTO, `admin.service`, migration `1753260000000-GpxSubmissionPrice` |
| **H10** | `buy()` gửi thông báo cho người bán khi có khách mua | `purchases.service.buy` + `PurchasesModule` nạp `NotificationsModule` |

**Chưa xử ở GĐ0 (đúng phạm vi — thuộc GĐ1 payments):** H1 deadlock pending, H2/H3/H4 (cọc/booking/payout — cần module `payments`), H7 (chống gian lận sâu: server tự tính km-mark, device attestation).

## E. Lộ trình đã chốt

| GĐ | Tuần | Mục tiêu | Điều kiện |
|---|---|---|---|
| **0** | 1–2 | ✅ vá 5 bug + chính sách này | xong |
| **1** | 3–6 | payments + escrow + cọc/hoàn (QĐ-1,2,5) chạy sandbox; booking ngày/nhóm; chat mở trước cọc | chốt QĐ-11/12 |
| **2** | 7–8 | Bán cung có guide (nguồn seed) — **doanh thu đầu tiên** | GĐ1 xong |
| **3** | 9–14 | payout Momo, hồ sơ Cấp 2 (QĐ-6), review, chợ porter | thắng GĐ2 bằng số |

**Cổng ra quyết định:** không mở phía bán (GĐ3) tới khi GĐ2 chứng minh có người mua trả tiền thật.
