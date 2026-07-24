# 14 — Vòng 2: Kiểm toán LOGIC + nhập vai Người MỞ cung / Người MUA cung + Kế hoạch R&D · UI

> Ngày: 2026-07-24 · Kế thừa `docs/13-bao-cao-3-agent.md` (vòng 1). Vòng này đào vào **logic thật trong code**
> (`server/src/*`, `app/src/lib/*`), đối chiếu state machine `docs/08` + hệ cấp `docs/04` + thiết kế v3.
> Mọi nhận định đều trích **file/hàm cụ thể** — kiểm chứng được.

---

## PHẦN 1 — KIỂM TOÁN LOGIC HIỆN CÓ

### 1.1 Chấm theo module

| Module | Trạng thái | Đánh giá |
|---|---|---|
| `completions.logic.ts` (xác minh 5 bước) | ✅ **Vững nhất codebase** | Hàm thuần có test: mock-provider → failed; ngưỡng 50m nới theo accuracy trần 80m (`checkpointThresholdM`); cách tuyến > ngưỡng → failed; tốc độ >6km/h → suspect (đúng — không failed vì GPS drift); lệch cao ±150m → suspect. Điểm = 0.6 checkpoint + 0.2 mốc km + 0.2 liên tục (gap ≤4h); CERTIFIED ≥ 0.7; +25 uy tín. Đúng docs/08 C1+C3. |
| `completions.service.ts` | ✅ vững, 2 lỗ nhỏ | Server RE-VALIDATE không tin client; chặn nộp evidence sau FINISHED ("không chụp bù"); `start()` idempotent resume; `addCheckpoint` ép cả seller đặt checkpoint ≤80m từ tuyến. Lỗ: xem 1.2-H6, H7. |
| `purchases.service.ts` | 🔴 **sẽ gãy khi có tiền thật** | Chỉ 44 dòng. Đúng cho MVP 0đ, nhưng toàn bộ mô hình tiền v3 (cọc 30%, phí 10%, hoàn, payout) chưa có chỗ đứng trong schema. Xem H1–H4. |
| `routes.service.ts` | 🟡 có bug | `fullTrack` không cho seller xem track cung của chính mình (H5); enforcement Cấp 1 không nhất quán (H8). |
| `gpx.service.ts` + `admin.reviewGpx` | ✅ vòng khép kín | `@MinTier(2)` guard thật ở controller; parse+stats cùng logic với app; approved → tự tạo `TrekRoute` với `seller` = người nộp + notification 2 chiều. Thiếu: giá bán (H9), chống đạo track (H10). |
| `moderation.service.ts` | 🟡 mới nửa vời | Có report/block/unblock nhưng **không có luồng GIẢI QUYẾT report** (không trạng thái xử lý, không hệ quả). Chưa có module review/rating nào. |
| `users.service.ts` | 🟡 | `addReputation` clamp 0–1000 đúng docs/04, nhưng **thăng cấp hoàn toàn thủ công** — comment ghi "tự động đề xuất thăng cấp ở GĐ sau". Không có flow xin lên Cấp 2. |
| `app/src/lib/nav.ts` + `gpx.ts` | ✅ | Hysteresis off-route VÀO 50m/RA 30m khớp docs/08 P2_OFFROUTE; positionAt/generateTurns từ hình học thật. |

### 1.2 10 lỗ hổng logic cụ thể (H1–H10)

| # | Lỗ hổng | Bằng chứng | Hậu quả |
|---|---|---|---|
| **H1** | **Deadlock mua cung có giá**: `buy()` set `status: priceVnd==='0' ? 'paid' : 'pending'` — nhưng **không tồn tại code path nào chuyển pending→paid**, không timeout hủy pending. Kèm `@Unique(['buyer','route'])` → lần mua sau ném `ConflictException "Bạn đã mua cung này"` dù chưa trả xu nào. | `purchases.service.ts` `buy()`; `purchase.entity.ts` | Ngày bật giá thật: người mua kẹt vĩnh viễn ở pending, không mua lại được, không đi được (assertAccess đòi `status:'paid'`). |
| **H2** | `PurchaseStatus` có `'refunded'|'cancelled'` trong type nhưng **không một dòng code nào set 2 trạng thái này** — hoàn/hủy là trạng thái mồ côi. | `purchase.entity.ts` | Không thể hoàn cọc/hủy đơn dù chỉ để test. |
| **H3** | Purchase **không có ngày đi, không có số người, không có cọc**: chỉ `priceVnd + status`. Mua cung = mua quyền xem track vĩnh viễn, không phải booking. Nhưng v3 bán "Kiểu 1 tour riêng / Kiểu 2 porter **theo ngày**, cọc 30%". | `purchase.entity.ts` | Toàn bộ luồng bán của v3 không mô hình hóa được trên schema hiện tại. |
| **H4** | **Không có payout/ledger**: tiền về seller không tồn tại ở bất kỳ entity nào. Phí 10% cũng không. | toàn `server/src` | Anh Páo bán được cung nhưng không có cơ chế nhận tiền. |
| **H5** | `fullTrack()` comment ghi "CHỈ khi: miễn phí, đã mua, **là seller**, hoặc admin" nhưng code chỉ check `isFree || isAdmin || paid` — **quên check seller** → seller bị `ForbiddenException` với track cung CỦA CHÍNH MÌNH khi cung có giá. | `routes.service.ts` `fullTrack()` | Anh Páo không mở xem được cung mình bán. Bug 1 dòng, sửa ngay được. |
| **H6** | **Race condition ở `finish()`**: check `status !== 'active'` rồi mới `update` — không lock/transaction. 2 request song song cùng qua check → double `addReputation` (+25×2) và ghi đè kết quả. | `completions.service.ts` `finish()` | Farm uy tín bằng double-submit; cần optimistic lock hoặc `UPDATE ... WHERE status='active'` atomic. |
| **H7** | **Điểm xác minh tin dữ liệu client tự khai**: `kmMarksHit` (chiếm 0.2 điểm) là số client gửi lên, server chỉ `min()` với total; `capturedAt` và `isMockProvider` cũng client khai. Ai gọi API trực tiếp có thể khai man 20% điểm + qua mặt mock-check. | `finish(user, completionId, kmMarksHit)`; `submitEvidence(dto)` | CERTIFIED ăn gian được một phần. Cần: mốc km server tự tính từ evidence, device attestation (Play Integrity/DeviceCheck), EXIF ảnh. |
| **H8** | **Enforcement Cấp 1 không nhất quán**: docs/04 nói "Cấp 1 chỉ đi cung Dễ"; `buy()` chỉ chặn `difficulty === 'hard'` (mua cung Chuẩn thoải mái); `fullTrack` trả cờ `requiresGuide = tier1 && difficulty !== 'easy'` nhưng đó chỉ là **cờ để app chặn** — gọi API trực tiếp vẫn lấy track; cung **miễn phí khó** thì `assertAccess` cho qua luôn (return sớm khi priceVnd==='0') → Cấp 1 `start()` được cung Khó free, server không chặn. | `purchases.buy()`, `routes.fullTrack()`, `completions.assertAccess()` | "Server chặn thật" (README §1) hiện chỉ đúng ở bước MUA cung khó có giá. Lỗ pháp lý theo chính docs/04. |
| **H9** | **Nộp GPX không có giá bán**: docs/08 B1 state META có "giá bán" nhưng `GpxSubmission` không có trường price, `submit()` chỉ nhận `routeName + rawGpx` → admin duyệt xong route ra giá gì? (mặc định 0đ). | `gpx-submission.entity.ts`, `gpx.service.submit()` | Creator không định giá được sản phẩm của mình — đứt mạch marketplace. |
| **H10** | **`buy()` không báo cho seller**: không gọi `notifications.sendToUser(seller)` khi có người mua. | `purchases.service.ts` | Anh Páo không hề biết có khách — trong khi bán support/dẫn đoàn thì biết-có-khách là nghiệp vụ sống còn. |

### 1.3 Mâu thuẫn code ↔ docs ↔ thiết kế v3

1. **SOS**: v3 ghi "Đã gửi vị trí cho đoàn & trạm cứu hộ ✓" — trái docs/05 §5 (SMS/gọi 112/115 trực tiếp, không qua server, không hứa cứu hộ). (Đã nêu vòng 1 — nhắc lại vì đây là mâu thuẫn pháp lý.)
2. **Tiến độ đoàn (v3)**: không có entity đoàn/group nào ở server. Purchase là cá nhân — "đoàn 4 người" không tồn tại trong dữ liệu.
3. **Chợ + porter marketplace (v3)**: không có module backend nào (products, porters, bookings) — v3 vẽ trước, server chưa có gì.
4. **docs/08 B1 REC_*** (ghi track trong app để mở cung): app RN chưa có màn ghi track nào; hiện chỉ nộp file GPX qua API.
5. **api-contract.md ghi ✅ gần hết** — đúng theo nghĩa "endpoint tồn tại", nhưng H1–H10 cho thấy ✅ ≠ đủ logic nghiệp vụ để vận hành có tiền thật.

---

## PHẦN 2 — NHẬP VAI NGƯỜI MỞ CUNG: anh Giàng A Páo
*(34 tuổi, H'Mông, Y Tý; 8 năm dẫn Lảo Thẩn; có track GPX tự ghi; dùng Zalo + Momo, không tài khoản ngân hàng; sợ bị nền tảng ăn chặn, sợ khách bùng)*

| # | Bước | Anh Páo kỳ vọng | Hệ thống HIỆN LÀM (nguồn) | Khoảng trống |
|---|---|---|---|---|
| 1 | Đăng ký, lên Cấp 2 | "Tôi dẫn 8 năm, cho tôi bán luôn" | Đăng ký vào Cấp 1. Thăng cấp = **admin set tay** (users.service: "tự động đề xuất ở GĐ sau"); không có màn xin thăng cấp, không KYC | 🔴 **Chặn ngay cửa**: không có flow nộp hồ sơ Cấp 2 (CCCD + xác nhận địa phương). Anh Páo bỏ về Zalo tại đây |
| 2 | Nộp GPX Lảo Thẩn | Up track từ điện thoại, vài ngày có kết quả | `POST /gpx/submit` `@MinTier(2)` guard thật; parse + stats; vào hàng đợi; admin duyệt → tự tạo route seller=anh + notification 2 chiều (`admin.reviewGpx`) | 🟡 Vòng duyệt chạy được nhưng: không SLA, không có trường **giá bán** (H9), không ai kiểm tra track có bị **đạo từ Wikiloc** không (H10 vòng 1) |
| 3 | Định giá + gói support | "350k/khách, dẫn tận đỉnh" | Không nhập giá được khi nộp (H9). v3 vẽ "Kiểu 1/Kiểu 2 · phí Potter 10%" nhưng thuật ngữ nội bộ, không rõ ai chịu 10% | 🔴 Không định giá được; ngôn ngữ giá phải viết lại theo mắt người bán: "Khách trả 350k → anh nhận 315k" |
| 4 | Có khách mua | Điện thoại kêu "có khách!" | `buy()` **không gửi thông báo cho seller** (H10). Không ngày đi, không số người (H3) → không biết chuẩn bị đoàn cỡ nào | 🔴 Nghiệp vụ sống còn của người dẫn — hiện bằng 0 |
| 5 | Khách bùng / hoãn | "Cọc phải về tay tôi một phần" | Không có cọc, không luật hủy (H2, H3) | 🔴 Đúng nỗi sợ lớn nhất — chưa có gì bảo vệ anh |
| 6 | Dẫn đoàn | Thấy khách nào tụt lại | v3 có Tiến độ đoàn nhưng backend không có entity đoàn (mâu thuẫn #2); vòng 1 đã chê leaderboard cổ vũ tách tốp | 🟡 Cần "chế độ trưởng đoàn": cảnh báo tụt >500m, danh sách check-in checkpoint |
| 7 | Nhận tiền | Về Momo trong 1–2 ngày | **Không tồn tại payout** (H4). Anh không có tài khoản ngân hàng | 🔴 Không có Momo disbursement = không có anh Páo trên nền tảng |
| 8 | Bị 1 sao oan | Có chỗ kêu | Chưa có hệ review; `moderation.report` nhận report nhưng không ai xử (mục 1.1) | 🔴 Thiếu cả 2 chiều: review xác minh từ booking thật + kênh phản hồi của seller |

**Luật hệ thống PHẢI có mà chưa có (theo anh Páo):** hồ sơ Cấp 2 cho porter bản địa (KYC nhẹ, người khác tạo hộ được); giá hiển thị "anh nhận X sau phí"; thông báo đơn mới đa kênh (push + SMS vì sóng yếu); luật cọc khi khách bùng (đề xuất: khách bùng <72h → seller nhận 50% cọc); payout Momo T+24h sau chuyến; quyền phản hồi review trước khi hiện công khai.

**Phán quyết anh Páo:** *"App vẽ đẹp nhưng hôm nay tôi không đăng ký nổi Cấp 2, không đặt được giá, khách mua tôi không biết, tiền không về Momo. Tôi quay lại Zalo — khi nào 4 cái đó xong thì gọi tôi, vì cái vụ khách bùng có cọc giữ hộ thì tôi thích thật."*

---

## PHẦN 3 — NHẬP VAI NGƯỜI MUA CUNG: Minh
*(31 tuổi, dev ở SG, Cấp 1; mua cung Lảo Thẩn có hướng dẫn cho nhóm 3 người dịp 2/9; 1,5tr/người; từng bị bùng tour nên đọc kỹ điều khoản)*

| # | Bước | Minh kỳ vọng | Hệ thống HIỆN LÀM (nguồn) | Khoảng trống |
|---|---|---|---|---|
| 1 | Chọn cung | Xem đủ để quyết, chưa lộ track | `BROWSE` đúng docs/08: track mờ, không toạ độ khi chưa mua; Cấp 1 bị chặn mua cung Khó (`buy()` ForbiddenException) | 🟡 Nhưng mua cung **Chuẩn** không cần guide vẫn được (H8) — docs/04 nói Cấp 1 chỉ đi cung Dễ. Phải chốt luật: Chuẩn = cần guide hay không? |
| 2 | Mua cho nhóm 3 | 1 đơn, 3 người, chia tiền | 1 purchase = 1 buyer (H3); mỗi người tự mua, không group booking, không ngày đi | 🔴 Đặt cho nhóm — kịch bản phổ biến nhất VN — không mô hình hóa được |
| 3 | Trả cọc 30% | Cọc 450k×3, giữ hộ (escrow), điều khoản rõ | `buy()` → `pending` vĩnh viễn (H1); không cọc, không escrow, không waiver trong code (docs/04 đòi waiver cung ≥Chuẩn — không có bảng nào lưu) | 🔴 Ngày có tiền thật là gãy ngay tại đây |
| 4 | Sau mua | GPX + offline pack + liên hệ guide | `fullTrack` trả track khi paid ✅; offline pack GĐ5 ❌; chat với seller: server Socket.IO xong, app còn mock | 🔴 Vòng 1 đã nói: không liên hệ được guide trước/sau khi trả tiền là rào cản niềm tin số 1 |
| 5 | Đổi ngày / bão | Luật rõ ràng như vé máy bay | Không tồn tại (H2) | 🔴 Minh từng bị bùng tour — không có luật hoàn = không xuống tiền quá 500k |
| 6 | Đi trek | Dẫn đường kín kẽ cả khi mất sóng | P1→P2 logic app thật (nav.ts hysteresis 50/30m ✅); checkpoint 5 bước server re-validate ✅ (mục 1.1); GPS mất >60s có banner (docs/08); **offline map chưa có** | 🟡 Logic dẫn tốt; lỗ là offline (đã P0 vòng 1) + nhóm 3 người 1 người tụt: không có gì theo dõi đồng đội (mâu thuẫn #2) |
| 7 | CERTIFIED | Hiểu vì sao đạt/không | Điểm 0.6/0.2/0.2, ngưỡng 0.7, +25 uy tín — minh bạch, giải thích được ✅ | 🟡 Nhưng H7: bạn cùng đoàn gian lận được bằng API; và **bỏ dở vì mưa** → điểm thấp → không cert — cần trạng thái "hoàn thành một phần — thời tiết" để không mất trắng |
| 8 | Sự cố, khiếu nại | Nút khiếu nại, tiền treo lại | `moderation.report` nhận đơn rồi… hết (mục 1.1); không hoàn tiền được (H2) | 🔴 Có hộp thư, không có người mở |

**Luật PHẢI có (theo Minh):** thang hoàn cọc theo mốc ngày (đề xuất phần 4); bão/cảnh báo thiên tai chính thức = đổi ngày miễn phí hoặc hoàn 100%; waiver ký số lưu server trước khi mở track cung ≥Chuẩn; group booking chia tiền; SLA khiếu nại 72h, tiền treo trong escrow tới khi xử xong; "hoàn thành một phần" khi bỏ dở có lý do được xác minh (thời tiết/y tế).

**Phán quyết Minh:** *"Logic dẫn đường và xác minh checkpoint thuyết phục nhất tôi từng thấy ở app Việt — tôi tin cái CERTIFIED này. Nhưng tiền thì chưa: không cọc rõ ràng, không luật hoàn, không nói chuyện được với guide, mua cho nhóm không xong. Tôi sẽ mua cung 0đ đi thử trước, còn 4,5tr của nhóm thì đợi."*

---

## PHẦN 4 — KẾ HOẠCH R&D LEAD

### 4.1 Bộ LUẬT nghiệp vụ đề xuất (chờ chủ dự án CHỐT)

| Luật | Đề xuất cụ thể | Vì sao |
|---|---|---|
| Hoàn cọc khi khách hủy | ≥7 ngày trước: 100% · 3–7 ngày: 50% · <72h: 0% (seller nhận 50% phần cọc bị mất, Potter 50%) | Chuẩn ngành tour; bảo vệ 2 chiều |
| Bất khả kháng | Cảnh báo thiên tai chính thức (KTTV) tại khu vực cung trong ngày đi → đổi ngày miễn phí hoặc hoàn 100% | Nỗi lo lớn nhất của cả 2 persona |
| Seller hủy/bùng | Hoàn khách 100% + phạt uy tín −50 + đình chỉ nhận đơn 14 ngày nếu tái phạm | Đối xứng với luật phạt khách |
| Phí Potter | 10% trên tổng, TRỪ VÀO PAYOUT SELLER; hiển thị cho seller dạng "khách trả 350k → anh nhận 315k" | Minh bạch theo mắt người bán (anh Páo) |
| Payout | Momo/bank, T+24h sau khi buyer bấm "kết thúc tốt đẹp", auto T+72h nếu không có khiếu nại | Escrow ngắn, seller không bị om tiền |
| Khiếu nại | Mở trong 48h sau chuyến; SLA xử 72h; tiền treo trong escrow tới khi xong | Minh cần "người mở hộp thư" |
| Cấp 1 × độ khó | Chốt: Cấp 1 mua cung **Chuẩn** BẮT BUỘC kèm booking guide (Kiểu 1/2); cung Khó cấm hẳn kể cả free (sửa H8) | Đóng lỗ pháp lý docs/04 |
| Chống đạo GPX | Track nộp overlap ≥80% với route đã publish → từ chối tự động + yêu cầu ≥3 ảnh checkpoint có EXIF-GPS khớp track | Bảo vệ anh Páo — tài sản là track |
| Thăng Cấp 2 porter bản địa | KYC nhẹ: CCCD + 1 xác nhận (Cấp 2/3 hiện hữu hoặc đối tác địa phương); hồ sơ được người khác tạo hộ | Không có luật này thì không có supply |
| Ghép đoàn chia porter | Chốt đoàn khi đủ N (seller đặt min/max); mỗi người cọc phần mình; không đủ N trước 72h → hoàn 100% tất cả | Hook tăng trưởng (vòng 1) cần luật để chạy |

### 4.2 Workstream (gắn module server thật)

| Prio | Workstream | Việc cụ thể |
|---|---|---|
| **P0** | **Vá 5 bug logic** (làm ngay, không chờ payment) | H5 fullTrack thêm check seller (1 dòng) · H6 finish() atomic `UPDATE...WHERE status='active'` · H10 buy() notify seller · H8 chặn Cấp 1 ở `assertAccess` + `buy()` theo luật chốt · H9 thêm `priceVnd` vào GpxSubmission + submit DTO |
| **P0** | **Module `payments`** (mới) | Entity: Order (tripDate, headcount, depositVnd, feeVnd, status máy trạng thái đủ: pending→deposited→confirmed→completed→refunded/cancelled/disputed) · tích hợp VNPay/MoMo · webhook idempotent · escrow ledger |
| **P0** | Sửa `purchases` → nghiệp vụ booking | Migrate Purchase → Order; xóa deadlock H1 (pending có TTL 30'); group booking (1 order N người, mỗi người 1 suất) |
| **P1** | Module `payouts` | Ledger seller; Momo disbursement; màn hình đối soát admin |
| **P1** | Module `reviews` + xử lý report | Review chỉ từ order completed (xác minh); seller phản hồi trước khi public 24h; admin resolve report có trạng thái |
| **P1** | Flow thăng cấp | `POST /users/tier-application` + duyệt admin; dùng luật KYC 4.1 |
| **P1** | Chat app-side | Nối Socket.IO có sẵn — mở liên hệ guide TRƯỚC khi cọc (rào cản #1 vòng 1) |
| **P2** | Entity `group` (đoàn) | Nền cho Tiến độ đoàn + ghép đoàn chia porter + "1 người tụt" |
| **P2** | Chống gian lận sâu | Server tự tính kmMarks từ evidence (bỏ client khai H7); Play Integrity/DeviceCheck; EXIF ảnh checkpoint |
| **P2** | Porter marketplace backend | porters, availability slots, ghép đoàn theo luật 4.1 |

### 4.3 Quyết định cần CHỦ DỰ ÁN chốt
1. Thang hoàn cọc 4.1 (các con số %) — đặc biệt mốc <72h.
2. Cấp 1 có được mua cung Chuẩn không kèm guide không? (H8 đang mơ hồ)
3. Phí 10%: trừ seller (đề xuất) hay cộng vào giá khách?
4. Phí cổng thanh toán (~1.5–2%) ai chịu?
5. Giá sàn/trần cung để chống phá giá lẫn nhau giữa creator?
6. KYC porter: mức nào đủ (CCCD thôi, hay cần hợp đồng CTV)?

### 4.4 Roadmap đề xuất
| Giai đoạn | Tuần | Mục tiêu |
|---|---|---|
| A — Vá logic + luật | 1–2 | 5 bug P0 xong; bộ luật 4.1 chốt xong thành docs/15; schema Order thiết kế xong |
| B — Tiền thật | 3–6 | payments + escrow + refund chạy sandbox VNPay/MoMo; booking có ngày/số người; chat app nối |
| C — Hai phía chợ | 7–10 | payout Momo; reviews; tier application; seller nhận thông báo đơn |
| D — Đoàn + porter | 11–14 | entity group; Tiến độ đoàn an toàn; porter marketplace + ghép đoàn |

---

## PHẦN 5 — KẾ HOẠCH UI TEAM LEAD

### 5.1 Nguyên tắc (kế thừa docs/13 §1.5)
1. Token hoá theme dark v3 vào `app/src/theme/tokens.ts` TRƯỚC khi port bất kỳ màn nào.
2. Không port màn nào có luồng tiền khi luật 4.1 chưa chốt — UI tiền viết theo luật, không theo mock.
3. Mọi màn có trạng thái mạng: offline/GPS yếu là first-class state, không phải edge case.
4. Touch target ≥44px cứng (vòng 1 phát hiện vi phạm hệ thống).

### 5.2 Màn MỚI phải thiết kế thêm (v3 chưa có — do vòng 2 lộ ra)

**Phía anh Páo (creator/seller):**
- Wizard "Mở cung" 6 bước theo docs/08 B1 (REC_CHECK→…→SUBMITTED) — app hiện không có màn ghi track nào
- Màn trạng thái duyệt GPX (đang chờ/duyệt/từ chối + lý do + SLA)
- Nhập GIÁ + preview "khách trả X → anh nhận Y" (chờ H9 + luật phí)
- Hộp đơn hàng seller: đơn mới (push+SMS), ngày đi, số người, chuẩn bị đoàn
- Ví & rút tiền Momo; lịch sử payout
- Nộp hồ sơ Cấp 2 (chụp CCCD, chọn người xác nhận — tạo hộ được)
- Phản hồi review

**Phía Minh (buyer):**
- Chọn ngày đi + số người (group booking) trong luồng mua
- Màn waiver ký số (cung ≥Chuẩn) — bắt buộc trước thanh toán
- Màn hủy/đổi ngày với thang hoàn cọc hiển thị TRƯỚC khi xác nhận
- Trạng thái đơn: pending TTL đếm ngược / deposited / confirmed
- Khiếu nại + theo dõi SLA 72h
- Checkpoint: trạng thái NGOÀI VÙNG / GPS yếu (v3 chỉ vẽ happy path — vòng 1)
- "Hoàn thành một phần — thời tiết" trên màn kết thúc
- Quản lý offline pack (tải/xoá theo cung)

### 5.3 Sửa TRONG THIẾT KẾ trước khi code (gộp vòng 1+2)
1. Copy SOS bỏ "trạm cứu hộ ✓" → "Gọi 112 / gửi SMS vị trí cho đoàn" (pháp lý).
2. Thuật ngữ tiền: bỏ "Kiểu 1/Kiểu 2" → "Tour riêng có người dẫn" / "Thuê porter đồng hành"; ghi rõ "/người" hay "/ngày"; ai chịu phí 10%.
3. Tiến độ đoàn: leaderboard → an toàn đoàn (cảnh báo tụt ember).
4. Màn Bản đồ bổ khuyết: offline indicator, scale bar, route card, GPS accuracy, SOS khi nav.
5. Touch target: toggle 26px, stepper 24px, nút thêm-giỏ 28px, nút Ghép 30px → ≥44px.
6. Micro-type 8.5–10px ngoài trời → tối thiểu 11px cho mọi thông tin điều hướng.

### 5.4 Sprint (1 tuần/sprint — khớp roadmap R&D)
| Sprint | Mục tiêu | Màn | Phụ thuộc backend |
|---|---|---|---|
| S1 | Theme dark v3 + tab bar mới | tokens.ts dark, BT Danta static, tab 5 slot + FAB | — |
| S2 | Diện mạo v3 cửa ngõ | Trang chủ, Tất cả cung đường (+ tìm kiếm/lọc — vòng 1) | — |
| S3 | Màn chuyển đổi | Chi tiết cung (4 tab, elevation, checkpoint timeline; block giá chờ luật) | Luật 4.1 chốt |
| S4 | Vòng trek lõi 1 | Trek HUD + Bản đồ (bổ khuyết 5.3.4) | — |
| S5 | Vòng trek lõi 2 | Xác minh checkpoint (+ NGOÀI VÙNG/GPS yếu) + Check-in | media upload |
| S6 | Luồng tiền buyer | Chọn ngày/nhóm + waiver + trạng thái đơn + hủy/hoàn | payments P0 xong |
| S7 | Phía seller tối thiểu | Hộp đơn seller + trạng thái duyệt GPX + nhập giá | H9, H10 vá xong |
| S8 | Ví + hồ sơ Cấp 2 | Ví Momo, payout, tier application | payouts P1 |
| S9 | Cộng đồng + review | Feed restyle, Bình luận, review xác minh + seller phản hồi | reviews P1 |
| S10 | Hoàn thiện | Hồ sơ Oura, Cài đặt, Thông báo, Nhật ký; Onboarding/Login gắn auth | auth config |

### 5.5 Rủi ro UI
- Blur/glass trên Android (vòng 1 §1.4) — chốt surrogate không-blur ngay S1.
- Sprint 6–8 phụ thuộc backend tiền — nếu payment trễ, kéo S9–S10 lên trước (không phụ thuộc).
- 2 persona cho thấy **~15 màn mới ngoài 21 màn v3** — tổng khối lượng thiết kế tăng ~70%; cần chủ dự án duyệt scope 5.2 trước khi vẽ.

---

## PHỤ LỤC — Điểm mạnh nên GIỮ NGUYÊN (đừng đập đi)
- Toàn bộ `completions.logic.ts` — 5 bước + ngưỡng thích ứng accuracy là thiết kế tốt, có test, giải thích được cho người dùng (Minh tin CERTIFIED).
- Nguyên tắc server re-validate + cấm chụp bù sau FINISHED.
- `addCheckpoint` ép seller ≤80m — chống chính người tạo đặt checkpoint bừa.
- Vòng nộp GPX → duyệt → tự tạo route + notification 2 chiều: khung marketplace đã đúng, chỉ thiếu giá + tiền.
- Hysteresis off-route 50/30m ở client khớp spec — không rung lắc cảnh báo.

*Vòng 2 thực hiện trực tiếp (không qua agent phụ — tài khoản chạm trần chi tiêu tháng lúc chạy). Mọi phát hiện H1–H10 kiểm chứng được bằng file/hàm đã trích.*
