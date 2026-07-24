# 19 — Art Direction: Ngôn ngữ thị giác Potter (dark-glass v3) cho DEMO1

> Ngày: 2026-07-24 · Chủ sở hữu: Trưởng phòng Định hướng Mỹ thuật.
> Nguồn sự thật: `BỘ NHẬN DIỆN THƯƠNG HIỆU PORTER/Porter Brand Guidelines.dc.html` + `docs/13 §1.1` (hệ token v3). Token thực thi: `app/src/theme/tokens.ts`.
> Mục tiêu: một ngôn ngữ dark-glass nhất quán, dùng được ngay khi port 21 màn — **đọc được ngoài nắng** là ràng buộc số 1 (docs/02).

---

## 1. Tinh thần

Potter = **bản đồ địa hình sống**: chính xác, tối giản, để dữ liệu tự kể chuyện, nhưng tràn năng lượng người đi rừng. Nền xanh rừng đậm / near-black làm sân khấu; **lime bừng lên như tín hiệu dẫn đường** — chỉ dùng cho hành động và điểm nhấn, không rải đều. Cảm giác đích: HUD thiết bị ngoài trời cao cấp (Oura × Gaia), không phải app mạng xã hội bóng bẩy.

**Tỉ lệ màu vàng (bám guidelines):** ~70% pine/dark · 18% trung tính · 8% lime · 4% phụ trợ (ember/mist/gold). Nếu một màn thấy nhiều hơn 8% lime → đang lạm dụng accent.

---

## 2. Palette

Tất cả giá trị đã token hoá trong `tokens.ts` (`brandPalette`, `colors`, `darkColors`). Đây là ý nghĩa dùng.

### Nền tối (dark surfaces)
| Vai trò | Token | HEX |
|---|---|---|
| Nền sâu nhất (app bg) | `brandPalette.void` / `darkColors.bg.base` | `#080B08` |
| Vùng chìm tối nhất | `darkColors.bg.baseDark` | `#050705` |
| Card glass | `brandPalette.surfaceGlass` | `#121B15` |
| Card glass biến thể | `brandPalette.surfaceGlassAlt` | `#18271B` |
| Well / input chìm | `brandPalette.surfaceSunk` | `#0D1410` |
| Viền card mặc định | `brandPalette.borderDark` | `#24331F` |

### Thương hiệu & accent
| Vai trò | Token | HEX |
|---|---|---|
| Pine (nền sáng / chữ nền sáng) | `pine` | `#16281A` |
| Lime Signal (CTA, active, highlight) | `lime` | `#C9E265` |
| Lime hover/nhấn | `limeHi` | `#DFF19A` |
| Chữ trên nền Lime | `onLime` | `#182200` |
| Ember (SOS, record, lệch tuyến, cung Khó) | `ember` | `#FF5233` |
| Ember mềm (chữ/viền cảnh báo) | `emberSoft` | `#FF8368` |
| Mist (thông tin, nước, sương) | `mist` | `#A9CDD8` |
| Sage-teal (success mềm nền tối) | `sageTeal` | `#9FCBB5` |
| Gold (cảnh báo mềm, cung Chuẩn) | `gold` | `#E8C877` |
| Cream (nền sáng chính / ink nền tối) | `cream` | `#EAF1E4` |

### Thang chữ trên nền tối — 3 mức DUY NHẤT
Comp v3 dùng 6–7 sắc xám-xanh rời rạc. Ta chuẩn hoá còn **3 mức**, cấm dùng ngoài thang:
- **Ink** `#EAF1E4` (`darkColors.text.primary`) — tiêu đề, số liệu hero.
- **Muted** `#93A090` (`darkColors.text.secondary`) — body phụ, meta. Đây là **sàn tương phản**; không đi mờ hơn cho nội dung cần đọc.
- **Faint** `#6F7A6E` (`darkColors.text.faint`) — nhãn micro, fine print, disabled.

---

## 3. Typography

- **Display / tiêu đề:** Young Display Bold (`fonts.display`). Tên cung, số hero, H1. Letter-spacing hơi âm (−0.5px) ở cỡ lớn.
- **Heading phụ:** Young Regular (`fonts.displayRegular` / `fonts.heading`).
- **Body:** sans hệ thống (`fonts.body` = System; Archivo khi bundle sẵn). 15–16px, line-height thoáng (1.4–1.5).
- **Số liệu / toạ độ / nhãn kỹ thuật:** Space Mono → `fonts.data`/`fonts.mono` (fallback monospace). Bật `fontVariant: ['tabular-nums']` cho mọi số đếm/đồng hồ để không nhảy chữ.
- **Kicker micro:** `type.kicker` — 11px, weight 600, letter-spacing 1.5, UPPERCASE.

**Quy tắc cứng:** **floor 11px** cho mọi text. Comp v3 dùng 8.5–10px uppercase tràn lan — KHÔNG port nguyên, nâng lên `type.kicker`. Không có BT Danta trong DEMO1: dùng Young; nếu cam kết BT Danta sau này phải xuất static instances (Regular/SemiBold/Bold) và kiểm glyph tiếng Việt trước.

---

## 4. Công thức "Glass" (surrogate cho backdrop-filter)

RN **không có** CSS `backdrop-filter`/`saturate`. Blur thật (`expo-blur`) tốn hiệu năng và không được đặt trên từng card trong list dài (feed Cộng đồng sẽ sập FPS). Công thức chuẩn — dùng token `glass` trong `tokens.ts`:

**Card glass (mặc định, KHÔNG blur):**
1. Nền: `LinearGradient` 158° `colors={[...glass.gradient]}` (`glass.start`→`glass.end`); hoặc nền đặc `glass.fill` cho list dài.
2. Viền: `borderWidth: 1`, `borderColor: glass.border` (lime .16). Nhấn mạnh → `glass.borderStrong`.
3. Highlight: một View/đường mảnh mép trên màu `glass.highlight` (giả inset highlight trắng .13).
4. Bóng: `...shadow.glass` (đen, y+10, radius 24). Card nhẹ → `shadow.glassSoft`.
5. Bo góc: `radius.lg` (18) card thường, `radius.card` (20)/`radius.xl` (22) sheet.

**Blur thật chỉ dùng cho:** tab bar, header cố định (`glass.blur` = 16). Cuộn nhanh → tắt blur.

**CTA lime chính:** nền `lime`, chữ `onLime`, bo `radius.md`+, cao ≥ `sizing.buttonHeight` (52), quầng `shadow.limeGlow`.
**Nút SOS:** nền/viền `ember`, `shadow.sos`, ĐẶC không mờ (ngoài nắng), có bước xác nhận trước khi gửi.

---

## 5. Hình khối, spacing, độ bo

- **Grid 4pt** (`space`). Lề màn `space.screen` (16), khoảng cách card `space.cardGap` (12).
- **Độ bo (`radius`):** chip/badge `sm` (10) · input/card phụ `md` (14) · card glass `lg` (18) · card lớn/sheet `card` (20)/`xl` (22) · hero/terrain header `xxl` (26) · pill `999`. Không trộn nhiều bán kính khác nhau trong một cụm.
- **Touch target:** tối thiểu `sizing.touchMin` (44). Comp v3 vi phạm hệ thống (toggle 26, stepper 24, nút +giỏ 28, nút Ghép ~30) — **không copy số đo từ HTML**; phóng to hoặc thêm `hitSlop`.

---

## 6. Ảnh / thực địa

- Ưu tiên **ảnh thực địa thật** (điểm xuất phát, checkpoint, cung) — đó là tài sản khác biệt của Potter, không dùng stock chung chung.
- Ảnh full-bleed luôn phủ **gradient tối chồng** (từ trong suốt xuống `void`) để chữ cream/ink luôn đọc được — không đặt chữ trắng lên vùng ảnh sáng trần.
- Hoạ tiết thương hiệu: **đường bình độ (contour)** và **lưới toạ độ** mảnh (lime .16 / cream .07 / mist .14) làm texture nền cho vùng trống — thưa, không rối.
- Badge "GPX ĐÃ KIỂM CHỨNG"/"CERTIFIED": nền lime hoặc viền lime phát sáng — dấu bảo chứng, dùng tiết chế cho đúng chỗ có giá trị uy tín.

---

## 7. Sáng – tối

- **DEMO1 mặc định dark** (`darkColors`): sân khấu near-black `#080B08`, glass surface, lime dẫn đường.
- Hệ token **giữ song song light-first** (`colors`) — không xoá; theme switch chỉ đổi bảng, không đổi cấu trúc. Mọi màn đọc màu qua token ngữ nghĩa (`colors`/`darkColors`), **không hard-code HEX inline** (lỗi comp v3 gốc — sẽ trôi màu nếu chép).
- Tương phản: nội dung cốt lõi (đọc ngoài nắng) ≥ AA; fine print có thể dưới nhưng không hạ dưới mức `faint`.

---

## 8. Motion (nhẹ)

Chuyển động phục vụ thông tin, không trang trí. Reanimated.
- **Vào màn / card:** fade + trượt lên 8–12px, 200–260ms, ease-out.
- **Nhấn:** scale 0.97, 90ms.
- **Trạng thái sống:** chấm record ember "breath"/ping (checkpoint, đang ghi track); quầng lime pulse cho CTA quan trọng — biên độ nhỏ.
- **Số liệu:** đếm mượt (progress ring, km, độ cao) thay vì nhảy số.
- **Carousel/list:** snap (`FlatList snapToInterval`), giảm/tắt hiệu ứng nặng khi cuộn nhanh.
- Tôn trọng "reduce motion".

---

## 9. Bản đồ nhanh (token → dùng ở đâu)

| Muốn | Dùng |
|---|---|
| Nền màn dark | `darkColors.bg.base` (`void`) |
| Card glass | `glass.gradient` + `glass.border` + `shadow.glass`, bo `radius.lg` |
| CTA chính | nền `lime`, chữ `onLime`, `shadow.limeGlow` |
| SOS | `ember` + `shadow.sos`, đặc, có confirm |
| Nhãn micro | `type.kicker`, màu `faint`, floor 11px |
| Số liệu | `fonts.data` + tabular-nums, màu `ink` |
| Thông tin/nước | `mist` · Success mềm | `sageTeal` · Cảnh báo mềm | `gold` |
