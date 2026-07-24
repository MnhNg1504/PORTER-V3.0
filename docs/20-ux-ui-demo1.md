# 20 — UX/UI cho DEMO1 (audit luồng + punch-list)

> Chủ sở hữu: **Trưởng phòng UX/UI**. Ngày: 2026-07-24.
> Phạm vi: chỉ chuẩn hoá UX cho **DEMO1 chạy độc lập trên iPhone** (docs/12 §6b, `DEMO_MODE` bật sẵn, không cần server NestJS).
> Nguồn đối chiếu: app THẬT trong `app/src` (không phải comp v3 `.dc.html`) + docs/13 (verdict 21 màn, lỗi touch-target/micro-type) + docs/12 §6b (kịch bản demo 5').
> **Doc này chỉ mô tả — KHÔNG sửa code.** CEO thực thi punch-list, Art Lead giữ code màn. Mỗi việc trích `file:dòng` để CEO sửa đúng chỗ.

---

## 0. Bối cảnh quan trọng trước khi đọc

**App THẬT hiện tại đang light-first (nền Cream), CHƯA phải dark-glass v3.** `app/src/theme/tokens.ts:42-47` đặt `bg.base = #EAF1E4` (cream), `brand.primary = #16281A` (Pine). Thiết kế đích dark-glass (#080B08 + lime + BT Danta) là **một track port riêng của Art Lead** (docs/13 §1.5 — token hoá trước, rồi restyle 21 màn), KHÔNG làm trong khung thời gian DEMO1.

→ **Quyết định UX cho DEMO1: cam kết MỘT hệ (light-cream hiện có), giữ nhất quán, KHÔNG lật nửa vời sang dark.** Toàn bộ punch-list dưới đây nằm trong hệ light hiện tại. "Nhất quán dark-glass" là mục tiêu sau DEMO1, không phải việc của buổi demo này.

**Cấu trúc điều hướng thật** (`app/src/navigation/BottomTabs.tsx`): 5 slot — **Cộng đồng** (tab 1, màn mở app) · **Cung đường** · **FAB la bàn giữa → Bản đồ** · **Tin nhắn** · **Hồ sơ**. Không có màn "Trang chủ" riêng.

---

## 1. Audit luồng demo 5' (docs/12 §6b) — điểm vấp theo file:dòng

Kịch bản §6b: *mở app → Trang chủ (săn mây) → chọn cung → Chi tiết → MUA CUNG → Booking → ký cam kết → cọc 30% → trạng thái đơn → thử Hủy (thang hoàn cọc) → tab Bản đồ (GPS) → Hồ sơ.*

Bảng dưới là **những gì thực sự xảy ra** khi bấm theo kịch bản:

| # | Bước kịch bản | Màn thật | Điểm vấp UX (file:dòng) |
|---|---|---|---|
| 1 | "lướt Trang chủ (thời tiết săn mây thật)" | **KHÔNG có** Trang chủ. App mở vào **Cộng đồng** (`BottomTabs.tsx:69-73`). Săn mây/thời tiết **không nằm ở đây** — nó ở màn Chi tiết cung. | **Kịch bản lệch app.** Màn mở đầu là feed toàn ảnh xám placeholder → 10 giây đầu trông dở. Xem P0-1, P0-2. |
| 2 | "chọn cung" | Tab **Cung đường** (`RoutesScreen.tsx`), bấm 1 RouteCard | OK. Có "🔥 Điểm đến hot" + filter Dễ/Chuẩn/Khó + list. Nút "＋ Mở cung" (`RoutesScreen.tsx:81-86`) **không có `onPress`** → bấm vào là no-op, trông hỏng. Xem P1-3. |
| 3 | "xem Chi tiết (bản đồ/độ cao)" | `RouteDetailScreen.tsx` | Hero là **ô xám chữ "Ảnh hero cung"** (`:44-45`) ngay trên nút MUA — màn chốt tiền trông chưa xong. Xem P0-3. ContourCard (Tà Xùa, DEM+GPX thật `:66-68`) và WeatherCard (thời tiết/săn mây thật `:79-85`) là điểm sáng — đây mới là chỗ "săn mây" của kịch bản. |
| 4 | "MUA CUNG → Booking" | `RouteDetailScreen.tsx:98-104` → `BookingScreen.tsx` | Nút mua nền **Pine + chữ trắng** (`:150,156`), nhưng nút bước kế "ĐẶT CỌC" lại nền **Lime + chữ Pine** (`BookingScreen.tsx:282-289`). Màu hành động chính **đổi giữa dòng tiền**. Xem P1-1. |
| 5 | "ký cam kết" | Tà Xùa = `hard` (`mockData.ts:70`) → `BookingScreen.tsx:59` chặn → `WaiverScreen.tsx` | OK, đúng luồng. Checkbox 28px nhưng hàng bọc `minHeight: touchMin` (`:124-130`) — đạt chạm. Ký tên dùng font YoungDisplay (`:151`) — chi tiết đẹp. |
| 6 | "đặt cọc 30%" | `BookingScreen.tsx:61-81` → `createOrder` → `OrderStatus` | Stepper số người dùng `sizing.touchMin` (44px, `:236-238`) — **đã sửa** lỗi stepper 24px mà docs/13 nêu. Bảng giá minh bạch. Nhưng dòng "Phí dịch vụ (5%)" (`:140`) lệch chính sách "Potter giữ 10%" (docs/16) — kiểm tra copy. Xem P1-6. |
| 7 | "xem trạng thái đơn" | `OrderStatusScreen.tsx` | Stepper vòng đời + đếm ngược TTL + sổ ký quỹ — tốt. CTA thanh toán ghi **"THANH TOÁN CỌC (SANDBOX)"** (`:272`) — chữ dev lọt UI ở màn tiền, trông chưa xong. Xem P0-5. |
| 8 | "thử Hủy (xem thang hoàn cọc)" | `OrderStatusScreen.tsx:224-256` | **BẪY DEMO:** ngày mặc định là **ngày mai** (`BookingScreen.tsx:49` → `days[0]` = base+1). `previewRefund` với chuyến <72h → tier `'0'` → thang hoàn hiện **"Không hoàn cọc / hoàn 0đ / Mất tiền cọc"** (`:53-57,106-109,241-245`). Nút hủy đỏ "Xác nhận hủy" ra kết quả **phản cảm** đúng lúc cao trào. Xem P0-4. |
| 9 | "tab Bản đồ (GPS thật)" | FAB la bàn giữa → `MapScreen.tsx` | Điểm mạnh nhất: MapLibre thật + GPX Tà Xùa + định vị GPS + toggle lớp/3D/elevation. **CẦN MẠNG** (tile OSM/Open-Meteo) — mất wifi → map trắng (docs/12 §7). Có loading + banner lỗi (`:200-211`). Icon "▲▲" (elevation, `:169`) hơi khó hiểu. |
| 10 | "Hồ sơ" | Tab Hồ sơ → `ProfileScreen.tsx` | Có hero + uy tín + cột mốc + huy hiệu. Nhưng hàng "Cung của tôi / Đã mua / Track" (`:46-50`) là **Text trần trông như tab nhưng bấm không làm gì**; banner Premium (`:57-59`) cũng không bấm được. Xem P1-4. |

**Trạng thái loading/empty/lỗi (tổng quan):** OrderStatus (loading/lỗi+thử lại `:137-154`), Booking (spinner CTA + Alert lỗi `:170-177`), Map (loading + banner `:200-211`), WeatherCard (loading/lỗi+thử lại `:35-52`) — **đều có, khá tốt.** Community/Profile là dữ liệu mock tĩnh nên không cần.

---

## 2. PUNCH-LIST ưu tiên cho DEMO1

Quy ước: **P0** = làm demo trông hỏng / kịch bản gãy / cao trào phản cảm — **phải sửa trước demo**. **P1** = lỗi thấy rõ, nên sửa. **P2** = đánh bóng, sau demo cũng được.

### P0 — bắt buộc trước DEMO1

**P0-1 · Cộng đồng (màn mở app) trông chưa xong**
`CommunityScreen.tsx` — ảnh bài là ô xám `colors.rock` cao 200 chữ "Ảnh chuyến đi" (`:52-53,86-87`), avatar rỗng (`:82`), hàng tương tác ♥💬↗🔖 là Text trần không bấm được (`:65-70`).
→ Sửa: thay ô ảnh xám bằng **placeholder gradient thương hiệu (Pine→Forest) + icon núi**, đổ chữ cái đầu tên tác giả vào avatar. Bọc ♥💬 trong `Pressable` hitSlop ≥8 (hoặc ẩn ↗🔖 cho demo). Mục tiêu: màn đầu **không có ô xám kèm chữ "Ảnh..."**.

**P0-2 · Kịch bản §6b lệch app — không có "Trang chủ / săn mây" ở đầu**
Bước 1 kịch bản không tồn tại trong app.
→ Sửa **kịch bản (docs/12 §6b)**, không sửa code: đổi mở đầu thành *"mở app → lướt feed **Cộng đồng** → sang tab **Cung đường** chọn cung → ở **Chi tiết cung** xem thời tiết/săn mây thật + bản đồ độ cao"*. Brief người trình bày: khoảnh khắc "săn mây" nằm ở WeatherCard trong RouteDetail, không phải màn đầu.

**P0-3 · Hero Chi tiết cung là ô xám ngay trên nút MUA**
`RouteDetailScreen.tsx:44-49,112-114` — hero cao 220 nền `primaryLight` chữ "Ảnh hero cung".
→ Sửa: đổi thành **gradient thương hiệu + overlay tên cung + DifficultyChip** (chip đã có sẵn `:46-48`), bỏ chữ "Ảnh hero cung". Đây là màn chốt tiền, phải trông hoàn thiện.

**P0-4 · Bẫy thang hoàn cọc: ngày mặc định = mai → hủy ra 0đ**
`BookingScreen.tsx:49` + `OrderStatusScreen.tsx:53-57,106-109,241-245`.
→ Sửa (chọn 1): (a) **choreography** — người trình bày khi đặt hãy chọn 1 ngày **≥7 ngày** để beat "thử Hủy" ra **hoàn 100%** (tích cực); hoặc (b) đổi ngày mặc định `days[0]` sang mốc ≥7 ngày. Khuyến nghị (a) cho demo, (b) là sửa code nhỏ nếu CEO muốn chắc ăn. **Tuyệt đối tránh** demo hủy khi chuyến là ngày mai (ra "Mất tiền cọc").

**P0-5 · Chữ dev "(SANDBOX)" lọt UI ở nút tiền**
`OrderStatusScreen.tsx:272`.
→ Sửa copy: `"THANH TOÁN CỌC (SANDBOX)"` → `"THANH TOÁN CỌC (THỬ)"` hoặc `"THANH TOÁN CỌC"`. (Giữ DEMO_MODE, chỉ đổi nhãn hiển thị.)

### P1 — nên sửa

- **P1-1 · Màu CTA chính đổi giữa dòng tiền.** Nút MUA (`RouteDetailScreen.tsx:150,156`: Pine+trắng) khác nút ĐẶT CỌC (`BookingScreen.tsx:282-289`: Lime+Pine) và các CTA khác (Waiver/OrderStatus đều Lime). → Thống nhất **CTA chính = Lime + chữ Pine** (đúng brand: Lime = hành động, guidelines/tokens.ts:31) cho cả nút MUA.
- **P1-2 · Hàng tương tác Cộng đồng không bấm được & <44px** (`CommunityScreen.tsx:65-70`). → Bọc `Pressable`, thêm hitSlop, hoặc ẩn nút không có hành vi trong demo.
- **P1-3 · Nút "＋ Mở cung" chết** (`RoutesScreen.tsx:81-86`, không `onPress`). → **Ẩn cho DEMO1** (chưa có màn upload), tránh bấm ra no-op.
- **P1-4 · Hồ sơ có "tab" giả** (`ProfileScreen.tsx:46-50`) trông bấm được nhưng vô tác dụng; Premium banner (`:57-59`) cũng vậy. → Cho DEMO1: đổi thành nhãn tĩnh rõ ràng (bỏ vẻ "tab"), hoặc thêm state rỗng "Sắp có".
- **P1-5 · Search là chữ nhỏ.** `RoutesScreen.tsx:31-33` — "🔍 Tìm kiếm" là Text hitSlop 8. → Làm **nút pill có viền, cao ≥44** cho dễ chạm & rõ là nút. (docs/13 cũng nêu màn Cung đường thiếu tìm/lọc/sort — với DEMO1 chỉ cần nút tìm rõ ràng, filter đầy đủ để sau.)
- **P1-6 · "Phí dịch vụ (5%)" vs "Potter 10%".** `BookingScreen.tsx:140` lệch docs/16. → CEO xác nhận con số đúng cho demo, đồng bộ copy (kẻo bị hỏi lúc demo).
- **P1-7 · Booking chưa hé chính sách hủy trước khi cọc.** `BookingScreen.tsx:144-146` chỉ nói escrow. Thang hoàn chỉ hiện lúc hủy. → Thêm 1 dòng "Xem chính sách hoàn cọc theo thời điểm" gần nút cọc (docs/13 pain: quyết định chi tiền cần biết hủy/hoàn).

### P2 — sau demo

- **P2-1 · Micro-type <11px:** nhãn tab 9.5px (`BottomTabs.tsx` tabLabel). docs/13 khuyến nghị floor 11px cho đọc ngoài nắng — không chặn demo (demo trong nhà).
- **P2-2 · Map icon "▲▲"** (`MapScreen.tsx:169`) khó hiểu → nhãn chữ "Độ cao". Bổ khuyết chỉ báo offline/scale bar là việc lớn của bản đồ (docs/13 màn Bản đồ 🔴) — ngoài phạm vi DEMO1.
- **P2-3 · Tin nhắn** (`MessagesScreen.tsx`) OK cho demo (danh sách hội thoại mock, avatar 44px đạt chạm). docs/13 muốn chuyển thành bottom-sheet + đổi tab sang Chợ — để sau, KHÔNG đụng trước demo.
- **P2-4 · Dark-glass v3** toàn app — track port riêng (docs/13 §1.5), không làm trong DEMO1.

---

## 3. Checklist "SẴN SÀNG DEMO"

**A. Boot & không crash**
- [ ] `cd app && npm install && npx expo prebuild && npx expo run:ios --device` chạy được (docs/12 §1-3).
- [ ] App mở vào tab **Cộng đồng** không màn đỏ (red box).
- [ ] Bấm đủ 5 tab (Cộng đồng · Cung đường · FAB Bản đồ · Tin nhắn · Hồ sơ) — không crash.
- [ ] Đi trọn luồng: RouteDetail → MUA → Booking → Waiver → ký → ĐẶT CỌC → OrderStatus → THANH TOÁN → Hủy → thang hoàn cọc → back. Không crash.

**B. Mỗi tab có nội dung**
- [ ] Cộng đồng: feed hiện bài (sau P0-1: không còn ô xám "Ảnh...").
- [ ] Cung đường: "Điểm đến hot" + filter + list cung.
- [ ] Bản đồ: GPX Tà Xùa vẽ được + nút GPS định vị (**cần mạng**).
- [ ] Tin nhắn: danh sách hội thoại.
- [ ] Hồ sơ: hero + uy tín + cột mốc + huy hiệu.

**C. Luồng booking mượt (tâm điểm demo)**
- [ ] Chọn cung **Tà Xùa** (`hard`) để kích luồng ký cam kết (Waiver).
- [ ] **Chọn ngày ≥ 7 ngày** để beat "thử Hủy" ra **hoàn 100%** (tránh 0đ — P0-4).
- [ ] Bảng giá + đặt cọc 30% + stepper số người mượt (touch 44px đã đạt).
- [ ] OrderStatus: stepper vòng đời + THANH TOÁN (nhãn đã bỏ "SANDBOX" — P0-5) + thang hoàn cọc hiện đúng.
- [ ] `DEMO_MODE` bật trong `app/src/lib/paymentsApi.ts` (docs/12 §6b) — **không cần chạy server**.

**D. Điều kiện sân khấu**
- [ ] Có **wifi/4G** (Bản đồ + thời tiết gọi tile/Open-Meteo thật; mất mạng → map trắng, docs/12 §7). Chuẩn bị hotspot dự phòng.
- [ ] Chạy thử trọn kịch bản 1 lượt trước khi demo thật.

---

## 4. Tóm tắt cho CEO

- App booking (Booking/Waiver/OrderStatus) **đã khá chắc** và đã sửa được các lỗi touch-target nặng mà docs/13 nêu (stepper, ngày, checkbox đều ≥44px) — luồng tiền là phần hoàn thiện nhất, sẵn sàng làm tâm điểm demo.
- Rủi ro DEMO1 **không phải crash**, mà là **"trông chưa xong"** ở 2 màn đầu tiên khán giả thấy (Cộng đồng mở app + Hero Chi tiết cung) và **1 bẫy cao trào** (hủy đơn ra 0đ vì ngày mặc định là mai). Ba thứ này là P0.
- Demo giữ **một hệ light-cream**; dark-glass v3 để track sau (Art Lead).
- 5 việc P0 (xem §2): (1) Cộng đồng hết ô xám "Ảnh...", (2) sửa kịch bản §6b không có Trang chủ, (3) Hero Chi tiết cung thành gradient+tên cung, (4) chọn ngày ≥7 ngày để hủy ra hoàn 100%, (5) bỏ chữ "(SANDBOX)" ở nút thanh toán.
</content>
</invoke>
