# 13 — Báo cáo 3 Agent: UI · R&D · Trekker trải nghiệm (Potter App v3)

> Ngày: 2026-07-24 · Nguồn: thiết kế `Potter App v3.dc.html` (21 màn, Claude Design) đối chiếu repo thật (`app/`, `server/`, `docs/`).
> Ba agent chạy độc lập: **Agent UI** (rà 21 màn + token), **Agent R&D** (thị trường/đối thủ/mô hình tiền), **Agent Trekker** (nhập vai người dùng đi trọn hành trình).

## 0. Tổng hợp điều hành (đọc 1 phút)

- **Điểm trekker chấm:** UI **8.5/10** · Flow **8/10** · Tin cậy **7.5/10** · An toàn **6.5/10** → Tổng **7.5/10**. An toàn là điểm thấp nhất — đúng chỗ Potter tuyên bố mạnh nhất.
- **Thiết kế v3 tốt:** 16/21 màn đạt "tốt"; 4 màn "cần sửa" (Tất cả cung đường, Check-in, Chợ, Giỏ hàng); 1 màn "thiếu sót" (Bản đồ — màn lõi lại mỏng nhất).
- **3 việc P0 cả 3 agent cùng chỉ ra:** (1) thanh toán + escrow cọc 30% (mọi dòng tiền đứng trên nó); (2) **offline map kéo từ GĐ5 lên ngay** (trek VN mất sóng là mặc định — trekker chấm An toàn 6.5 vì thiếu nó); (3) sửa copy SOS trái quyết định pháp lý docs/05 ("đã gửi trạm cứu hộ ✓" — không được hứa cứu hộ).
- **Rào cản niềm tin lớn nhất luồng porter:** không được nhắn tin/gọi porter trước khi chuyển cọc 30%.
- **Port UI v3 sang RN = làm lại bề mặt toàn app** (10 màn hiện có restyle + ~15 màn mới), bắt đầu bằng token hoá theme dark.

---

## 1. AGENT UI — Rà soát thiết kế v3 & gap so với app RN

### 1.1 Hệ token / ngôn ngữ thị giác

Hệ token v3 là dark-glassmorphism nhất quán ở mức "ngôn ngữ thị giác" nhưng CHƯA được token hoá: nền tối #080B08 (surface #121b15/#0D1410/#18271b), accent lime #C9E265 (hover #DFF19A, chữ trên lime #182200), cream #EAF1E4, ember #FF5233/#FF8368, mist #A9CDD8, sage-teal #9FCBB5/#6FA08A, gold #E3CFA3/#FFD100 — trùng brand palette Porter nên chuyển đổi thuận lợi. Công thức glass lặp lại rất kỷ luật: linear-gradient(158deg, rgba(44,61,46,.5)→rgba(18,28,20,.4)) + backdrop-filter blur(15–18px) saturate(1.3) + border rgba(201,226,101,.16) + inset highlight 1px trắng .12–.14 + shadow đen .3; radius 14–26px, pill 999; font display 'BT Danta' variable (fallback Young/Lora), số liệu dùng font-variant-numeric tabular. ĐIỂM YẾU: (1) toàn bộ màu inline, có tới 6–7 sắc xám-xanh cho text phụ (#93A090, #8E998C, #B7C1B4, #A9B4A6, #6F7A6E, #C6D1C2) không có scale rõ ràng — cần chuẩn hoá thành 3 mức ink/muted/faint trước khi port; (2) micro-type 8.5–10px uppercase dùng tràn lan cho label. KHÁC BIỆT với tokens.ts hiện tại (/home/user/PORTER-V3.0/app/src/theme/tokens.ts): app RN đang light-first (nền Cream #EAF1E4, primary Pine #16281A), darkColors mới chỉ tối tới Pine #16281A/night #0E120E chứ chưa tới near-black #080B08; radius max 16 vs v3 dùng 18–26; font mới có YoungDisplay chưa có BT Danta; chưa có bất kỳ token nào cho glass (gradient+blur+border lime .16), text-on-dark scale, hay shadow tối. Tin tốt: lime/ember/mist/gold trong brandPalette khớp gần như 100% với v3, nên chỉ cần thêm nhánh "dark v3" (bg.base=#080B08, surface glass giả lập) chứ không phá key ngữ nghĩa hiện có.

### 1.2 Chấm từng màn (21 màn)

| Màn | Kết luận | Nhận xét |
|---|---|---|
| **Onboarding** | ✅ tốt | Full-bleed ảnh + gradient chồng 5 lớp đảm bảo chữ trắng luôn đọc được; kicker lime 10px/letter-spacing 2px + tiêu đề BT Danta 31px phân cấp đẹp; CTA lime full-width padding 15px (~50px cao) đạt touch target; dots tiến trình animate width tinh tế. Nhược: nút 'Bỏ qua' chỉ ~33px cao (padding 8x15) — dưới chuẩn 44px; phụ đề #AEB9AB 13.5px hơi mờ trên ảnh sáng nếu thiếu gradient. |
| **Đăng nhập** | ✅ tốt | Layout gọn: logo, tiêu đề 30px, input SĐT +84 tách vùng rõ, CTA OTP lime, social Google/Apple pill 13px padding (~47px). Fine-print điều khoản #6F7A6E 10.5px trên #121b15 contrast thấp (~3.4:1) — chấp nhận được cho fine print nhưng nên nâng 1 bậc; social button chỉ có viền .14 hơi chìm. |
| **Trang chủ** | ✅ tốt | Màn đắt giá: chào hỏi + avatar ring lime, thẻ thời tiết 'SĂN MÂY 74%' rất đúng insight trekking VN, hero carousel 272x400 snap-center với stat bar glass trong card, chip category, list gợi ý. Cần sửa: label stat trong card 8.5px uppercase — không đọc được ngoài nắng; search input đặt trong glass blur (chồng blur lên blur khi cuộn); card 'Mở rộng' dashed là pattern tốt để thoát carousel. |
| **Tất cả cung đường** | 🟡 cần sửa | Chỉ là header + search + chip + list lặp row 52px thumbnail — sạch nhưng nghèo: không có sort, không empty/loading state, nút filter 38px không có nội dung filter thật đi kèm, meta 11px một dòng khó quét khi list 48 cung. Nên thêm phân nhóm theo vùng/độ khó hoặc row đậm thông tin hơn (elevation mini, khoảng cách từ vị trí user). |
| **Chi tiết cung** | ✅ tốt | Màn tốt nhất bộ design: terrain 3D header (x-import potter-terrain) 360px, tên cung 30px căn giữa + badge 'đã kiểm chứng', 4 stat card glass, banner cảnh báo ấm màu riêng, 4 tab (Thông tin/Lộ trình/Đánh giá/Chuẩn bị), elevation profile SVG có labels, timeline checkpoint có tail nối, nút GPX dashed đổi trạng thái, block chọn gói + cọc 30%/phí 10% minh bạch, buy bar 350k sticky. Nhược nhỏ: mật độ chữ 9–9.5px ở stat label và thẻ Kiểu 1/Kiểu 2; tab 'Chuẩn bị' dài, checklist đồ mang chưa có tiến độ tổng. |
| **Bản đồ** | 🔴 thiếu sót | Màn mỏng nhất: chỉ back + title pill + nút layers + toggle 2 chế độ + nút GPS, còn lại phó thác cho x-import potter-realmap. Thiếu hẳn theo docs/02: chỉ báo offline/vùng tile đã tải, scale bar, thông tin route đang xem (bottom card), trạng thái độ chính xác GPS, nút SOS khi đang nav. Cần thiết kế bổ sung trước khi port vì đây là màn lõi MapLibre. |
| **Trek HUD** | ✅ tốt | Đúng tinh thần dùng ngoài trời: la bàn 226px với heading 40px tabular, tick xoay theo dialRot, mini map live có nhãn 'Bản đồ đoàn · trực tiếp', 2 stat card thời gian/quãng đường có progress, hàng phụ độ cao/GPS ±4m, nút SOS riêng biệt màu ember. Cần sửa: SOS bản thường là glass mờ đỏ — ngoài nắng nên đậm/đặc hơn; các meta 9.5–11.5px vẫn nhỏ; thiếu nút tạm dừng/kết thúc trek ngay trên HUD. |
| **Xác minh checkpoint** | ✅ tốt | Flow camera thuyết phục: khung ngắm 230px với 4 góc lime + mask box-shadow 100vmax, pill 'Checkpoint 3/4', card GPS 'cách 12 m · ±6 m' + badge TRONG VÙNG nền lime chữ #182200 contrast cao, CTA 'Chụp & đóng dấu GPS' 15px padding. Đây là USP chống check-in ảo — thiết kế truyền tải tốt. Lưu ý: cần thêm trạng thái NGOÀI VÙNG/GPS yếu (design chỉ vẽ happy path). |
| **Check-in** | 🟡 cần sửa | Composer tốt: khung thả ảnh 300px dashed, card GPS khớp checkpoint kèm toạ độ, caption, 2 toggle quyền riêng tư có mô tả phụ rõ (đúng chuẩn privacy-by-design). Cần sửa: toggle 44x26 — chiều cao chạm 26px dưới chuẩn 44 (RN phải thêm hitSlop); nút Đăng 9x17 padding ~35px cao hơi thấp. |
| **Tiến độ đoàn** | ✅ tốt | Leaderboard đoàn với card động viên 'Bạn ở vị trí thứ 4 — cách top 3 300 m' là micro-copy xuất sắc; mỗi row có rank, avatar, km tabular, progress bar + pace. Nhược: pace 9.5px và bar 3.5px quá mảnh; chưa thấy trạng thái 'mất tín hiệu/tụt lại' màu ember cho thành viên nguy cơ — nên bổ sung vì đây là màn an toàn đoàn. |
| **Nhật ký hành trình** | ✅ tốt | Hero 300px + badge 'Hoàn thành', 4 stat card (17,2km/12:04/+1.880m/pace), grid ảnh 3 cột, card 'Vệt GPX đã ghi' với SVG profile, CTA chia sẻ kèm dấu GPX ✓. Cấu trúc kể chuyện tốt, tái dùng được stat card của Chi tiết cung. Thiếu: bản đồ track thật của chuyến đi (chỉ có elevation), danh sách checkpoint đã qua. |
| **Cộng đồng** | ✅ tốt | Feed dạng reels 520px với author bar glass, badge 'GPX ĐÃ KIỂM CHỨNG' phát sáng, chip metadata (▲độ cao, ◈GPS, ↔quãng), CTA 'Đi cung này' — vòng lặp content→booking rất thông minh; kèm grid 2 cột, hashtag, cung được nhắc nhiều, Tin nhắn thành bottom-sheet. Lưu ý: khối stories đang display:none (khối chết trong design — cần quyết bỏ hay giữ); mỗi card chồng 3–4 lớp gradient+blur sẽ nặng; action icon cột phải ổn về chạm nhưng số đếm 10px nhỏ. |
| **Bình luận** | ✅ tốt | Bubble bo 4/16px phân biệt người mở thread, reply thụt cấp rõ, context card bài gốc ở đầu, input bar cố định đáy với nút gửi 44px tròn lime đạt chuẩn chạm. Nhược: hành động Thích/Trả lời 11px #8E998C hơi nhỏ; chưa có trạng thái đang tải/kéo thêm. |
| **Chợ** | 🟡 cần sửa | Header + tab pill, banner 'Thuê nhanh combo lều' có icon nền lớn — đẹp; grid 2 cột sản phẩm với tag, rating, giá lime. Cần sửa: nút thêm-giỏ chỉ 28px (dưới 44 rõ rệt, lỗi touch target nặng nhất bộ design); tên sản phẩm 12.5px 2 dòng dễ tràn; thiếu phân biệt Thuê vs Mua ngay trên card (chỉ có tag màu). |
| **Giỏ hàng** | 🟡 cần sửa | Cấu trúc chuẩn: item + stepper, note giao hàng 'tận đầu bản Công trước 6h sáng' (context trekking rất tốt), breakdown tạm tính/phí giao/tổng, CTA thanh toán sticky. Cần sửa: stepper −/+ 24px quá nhỏ; không có swipe-to-delete/xoá item; không thấy trạng thái giỏ trống. |
| **Tìm porter** | ✅ tốt | Điểm sáng UX: banner 'Ghép đoàn chia tiền porter — còn ~90k/người' giải quyết đúng pain point giá; card porter có tag, ngôn ngữ, slot trống, giá + CTA 'Đặt · cọc 30%'. Sub-header nêu rõ 'giá cố định · Potter giữ 10%' minh bạch mô hình. Nhược: filter pill chỉ là placeholder; nút Ghép 7x12 padding ~30px cao dưới chuẩn chạm. |
| **Chi tiết porter** | ✅ tốt | Cover + avatar vuông 24px radius, 3 stat (4,9/214 đoàn/8 năm), bio nêu kỹ năng bản địa (sơ cứu, tiếng H'Mông), chip cung đã dẫn, review, bar giá 350k/ngày + CTA sticky. Đủ tín nhiệm để chốt đặt. Thiếu: lịch trống dạng calendar (chỉ có text slot ở màn list), nút nhắn tin trực tiếp cho porter. |
| **Hồ sơ** | ✅ tốt | Phong cách Oura thành công: hero ảnh 310px, avatar ring lime, 4 stat glass kéo đè hero (margin-top:-42px), card 'Bước chân hôm nay' với progress ring SVG stroke-dashoffset + 9.240 hiển thị 30px, tab Huy hiệu/Lịch sử/Đã lưu, badge grid 4 cột có locked state dashed. Nhược: label stat 8.5px uppercase — nhỏ nhất toàn app; huy hiệu dùng ảnh bitmap cần asset thật. |
| **Sửa hồ sơ** | ✅ tốt | Form tối giản đúng mực: avatar 92px + nút camera 30px, input tên/tiểu sử nền .06, chip sở thích multi-select. Nút Lưu ~35px cao hơi thấp; nút camera đổi ảnh 30px dưới chuẩn chạm; chưa có validate/trạng thái lưu. |
| **Cài đặt** | ✅ tốt | Card hồ sơ dẫn sang Sửa hồ sơ, nhóm setting có tiêu đề uppercase BT Danta, row icon 34px + toggle/giá trị, logout viền ember tách biệt, footer version. Pattern iOS chuẩn mực, dễ port thành SectionList. Nhược: toggle 26px cao (như Check-in) cần hitSlop; divider .06 gần như vô hình trên màn OLED ngoài trời. |
| **Thông báo** | ✅ tốt | List đơn giản đúng nhu cầu: icon vuông 40px theo loại, nội dung bold-tên, chấm lime unread, 'Đọc hết' góc phải. Nhược: 'Đọc hết' chỉ là text 11.5px không có vùng chạm đủ; chưa nhóm theo ngày; thiếu empty state. |

### 1.3 Gap — v3 có, app RN chưa có

- Onboarding 3 slide + Đăng nhập OTP/Google/Apple — app RN chưa có bất kỳ auth UI nào (RootNavigator vào thẳng BottomTabs)
- Trang chủ kiểu mới (chào user + thời tiết săn mây + hero carousel + category chips) — RoutesScreen hiện tại chỉ là list, chưa có màn Home riêng
- Trek HUD (la bàn lớn, stats live, mini map đoàn, SOS) — RouteNavigateScreen hiện có nav map nhưng không có HUD la bàn/heading/tiến độ kiểu này
- Xác minh checkpoint bằng camera + đóng dấu GPS (khung ngắm, trạng thái TRONG VÙNG) — hoàn toàn chưa có
- Check-in composer (ảnh + GPS match + 2 toggle quyền riêng tư) — chưa có
- Tiến độ đoàn / leaderboard live — chưa có
- Nhật ký hành trình (trip summary + grid ảnh + vệt GPX) — chưa có
- Màn Kết thúc hành trình (overlay showFinish: đăng bài GPX đã kiểm chứng + chọn quyền riêng tư) — chưa có
- Chợ (marketplace thuê/mua đồ) + Giỏ hàng + checkout — chưa có, đồng thời tab bar mới thay tab Messages bằng tab Chợ
- Tìm porter (kèm ghép đoàn chia tiền) + Chi tiết porter — chưa có; RouteDetail hiện chưa có block gói giá/cọc 30%/Kiểu 1-Kiểu 2
- Cài đặt + Sửa hồ sơ + Thông báo + Bình luận — chưa có màn nào trong 4 màn này
- Trang tác giả (author profile overlay), Story viewer, Messages dạng bottom-sheet trong Cộng đồng (thay 2 màn Messages/Chat hiện tại) — chưa có
- Dynamic Island / pill 'ĐANG TREK' nổi xuyên màn — chưa có cơ chế Live Activity
- Đồng thời: cả 10 màn RN hiện có đều phải restyle từ light-cream sang dark-glass v3 — về UI coi như làm lại bề mặt toàn app

### 1.4 Rủi ro khi port sang React Native

- ⚠️ backdrop-filter blur+saturate là xương sống thẩm mỹ v3 nhưng RN không hỗ trợ CSS filter: expo-blur BlurView tốn hiệu năng (đặc biệt Android, experimentalBlurMethod), không có saturate(), và v3 đặt glass trên TỪNG card trong list dài → phải giả lập bằng nền bán trong suốt + gradient (LinearGradient) + viền lime, chỉ dùng BlurView thật cho tab bar/header, nếu không FPS sập ở feed Cộng đồng
- ⚠️ Dynamic Island 'ĐANG TREK' = iOS Live Activities (ActivityKit): cần dev-client/native module, không chạy trong Expo Go, Android không có tương đương — phải thiết kế fallback (notification ongoing + pill in-app như design đã có sẵn showIsland)
- ⚠️ Terrain 3D và bản đồ trong design là x-import (potter-terrain.js / potter-realmap.js) — chỉ là component web mô phỏng; port thật phải dùng MapLibre GL Native: terrain exaggeration/hillshade cần nguồn raster-DEM riêng và hỗ trợ terrain 3D của maplibre-react-native còn hạn chế → nguy cơ header Chi tiết cung không đạt hiệu ứng như comp, nên chuẩn bị phương án camera pitch + hillshade thay vì true 3D
- ⚠️ Font: BT Danta là variable TTF (weight 100–900) — RN/Android không map fontWeight lên trục variable một cách tin cậy → phải xuất static instances (Regular/SemiBold/Bold); đồng thời phải kiểm tra glyph tiếng Việt đầy đủ của BT Danta và Young trước khi cam kết (design đang fallback Lora subset=vietnamese — dấu hiệu tác giả design cũng không chắc coverage)
- ⚠️ Khả năng đọc ngoài nắng: v3 dùng rất nhiều chữ 8.5–10px uppercase và text phụ contrast thấp (#6F7A6E, #8E998C trên nền đen) cộng nền glass bán trong suốt làm contrast dao động theo nội dung phía sau — ngược với nguyên tắc 'tương phản cao ngoài trời' trong docs/02; khi port nên đặt floor 11px và nâng muted text lên ≥ #93A090
- ⚠️ Touch target dưới 44px lặp lại có hệ thống: toggle 26px cao, stepper giỏ hàng 24px, nút thêm-giỏ 28px, nút Ghép ~30px, nút Đăng/Lưu ~35px — port phải thêm hitSlop/phóng to, không copy số đo từ HTML
- ⚠️ Các hiệu ứng CSS không có ở RN: box-shadow 0 0 100vmax (mask khung ngắm checkpoint) → thay bằng 4 View overlay; noise overlay mix-blend-mode:overlay → PNG noise opacity thấp; inset box-shadow highlight của glass → giả bằng border-top gradient; text-shadow đa lớp, scroll-snap (dùng FlatList snapToInterval — cái này dễ); animation ping/breath/heartPop/dashMove → Reanimated, tốn công nhưng khả thi
- ⚠️ Hiệu năng feed Cộng đồng: card reels 520px + 3-4 lớp gradient + blur + ảnh lớn; cần FlashList, ảnh resize theo viewport, tắt blur khi cuộn nhanh
- ⚠️ Design comp hard-code toàn bộ màu inline (không token) và còn khối chết (stories display:none) — nếu port theo kiểu chép từng màn sẽ trôi màu và ôm cả phần bị loại bỏ; phải token hoá + rà soát khối ẩn trước

### 1.5 Thứ tự port đề xuất

1. 1. Token hoá theme dark v3 vào app/src/theme/tokens.ts (bg #080B08/#121b15, scale text-on-dark 3 mức, bộ 'glass' surrogate: gradient+border lime .16+shadow, radius 18/22/26, load BT Danta static) — mọi màn sau đều phụ thuộc, làm sai ở đây là sửa 21 màn
2. 2. Tab bar mới 5 slot (Cộng đồng · Cung đường · FAB la bàn · Chợ · Hồ sơ) + chuyển Messages thành bottom-sheet — thay đổi cấu trúc điều hướng gốc, phải chốt trước khi thêm màn mới để khỏi refactor route hai lần
3. 3. Trang chủ + restyle Tất cả cung đường (RoutesScreen) — cửa ngõ của app, carousel snap và card list đều là pattern RN thuần (FlatList) rủi ro thấp, cho cảm nhận diện mạo v3 sớm nhất
4. 4. Chi tiết cung (restyle RouteDetailScreen: 4 tab, elevation SVG, timeline checkpoint, block gói/cọc 30%, buy bar sticky; header terrain tạm dùng MapLibre pitch+hillshade) — màn chuyển đổi doanh thu và là màn design hoàn thiện nhất
5. 5. Vòng lặp trek lõi: Trek HUD + Bản đồ (bổ khuyết offline/route info trước khi code) + Xác minh checkpoint + Check-in — giá trị khác biệt của Potter, cần GPS/camera thật nên làm khi theme và nav đã ổn định
6. 6. Tìm porter + Chi tiết porter — mở mô hình kinh doanh Kiểu 2, UI chỉ là list+detail nên nhanh, nhưng phụ thuộc API porter của server NestJS
7. 7. Cộng đồng restyle (feed reels + badge GPX kiểm chứng + Bình luận + author overlay) — giữ chân người dùng; làm sau vì nặng hiệu năng nhất, cần FlashList và chiến lược thay blur đã chốt ở bước 1
8. 8. Chợ + Giỏ hàng — độc lập, không chặn luồng nào; sửa lỗi touch target (nút +, stepper) ngay khi port
9. 9. Hồ sơ (Oura style) + Cài đặt + Sửa hồ sơ + Thông báo + Nhật ký hành trình + Tiến độ đoàn — hoàn thiện trải nghiệm, phần lớn là list/form ít rủi ro
10. 10. Onboarding + Đăng nhập (gắn khi auth backend sẵn sàng) và cuối cùng Dynamic Island/Live Activity — native iOS-only, cần dev-client, đã có fallback pill in-app nên để chót

---

## 2. AGENT R&D — Thị trường, đối thủ, mô hình tiền

### 2.1 Thị trường

Thị trường trekking VN đang ở giai đoạn tăng trưởng nhanh hậu-Covid: tệp khách 20–35 tuổi thành thị, chi 1,5–3,5 triệu/chuyến cho các cung Tây Bắc (Tà Xùa, Lảo Thẩn, Bạch Mộc, Tà Chì Nhù, Fansipan — đúng bộ 15 GPX seed của repo). Đặc thù quyết định: (1) hành vi đặt chuyến hiện nằm gần như 100% trong các group Facebook + Zalo — ghép đoàn, thuê porter, thuê guide đều qua tin nhắn tay, không có nền tảng nào chuẩn hóa; (2) hạ tầng trail kém — đường mòn không biển báo, OSM phủ trail VN thưa (docs/01 §2b.2 đã xác nhận), nên giá trị của GPX thật + ảnh điểm xuất phát rất cao; (3) văn hóa porter bản địa (H'Mông, Thái) là chuẩn mực ở hầu hết cung khó — khác hẳn thị trường phương Tây nơi AllTrails/Gaia phục vụ người đi tự túc. Quy mô: trekking VN là ngách (ước vài trăm nghìn người active/năm), TAM thuê bao premium kiểu AllTrails sẽ nhỏ vì willingness-to-pay subscription ở VN thấp; ngược lại GMV dịch vụ (porter 350–500k/ngày, tour 1–3 triệu, thuê gear 100–200k/đêm) trên mỗi chuyến lớn hơn nhiều lần ARPU thuê bao — nên trọng tâm doanh thu chuyển từ subscription sang transaction là đúng hướng với v3. Mở rộng SEA (Indonesia Rinjani, Malaysia, Philippines) khả thi về sau vì cùng mô hình porter/guide bản địa, nhưng nên coi là GĐ xa; trước mắt thắng 3–4 hub Tây Bắc đã là vị thế phòng thủ được.

### 2.2 Đối thủ & thế đứng của Potter

| Đối thủ | Mạnh ở đâu | Potter thắng/thua ở đâu |
|---|---|---|
| **AllTrails** | Vô địch discovery + cộng đồng toàn cầu, review/ảnh/điều kiện đường dày, thương hiệu mạnh, đang đẩy AI (tier Peak 79,99 USD/năm). | Potter thắng ở VN: dữ liệu cung Tây Bắc thật (GPX thực địa) trong khi AllTrails gần như trống trail VN; có porter/guide marketplace và enforce an toàn 3 cấp mà mô hình 'tự chịu trách nhiệm' của AllTrails không làm. Potter thua về quy mô cộng đồng, độ bóng sản phẩm và ngân sách. |
| **Gaia GPS** | Chuẩn vàng navigation backcountry: hàng trăm layer, offline theo vùng xuất sắc, độ chính xác cao. | Potter không nên đấu số layer. Nhưng hiện Potter THUA cả ở điểm phải hòa: offline map chưa có (GĐ5) trong khi trekking VN mất sóng là mặc định — đây là khoảng cách kỹ thuật phải đóng trước khi tự nhận 'ngang tầm Gaia'. Potter thắng ở dịch vụ mặt đất (porter, gear, đoàn) mà Gaia không đụng tới. |
| **Komoot** | Route planning đa bề mặt tốt nhất, UX planning mượt; nhưng cú ép subscription 3/2025 làm mất niềm tin. | Không đối đầu trực tiếp ở VN (dữ liệu VN mỏng). Bài học cho Potter: định giá minh bạch, không đổi mô hình giữa chừng — freemium + hoa hồng dịch vụ ít gây phản ứng hơn ép thuê bao. |
| **Strava** | Thống trị social thể thao, hiệu ứng mạng khổng lồ, segment/kudos gây nghiện. | Đối thủ gián tiếp về 'nơi khoe hành trình'. Màn Nhật ký hành trình + profile kiểu Oura của v3 đánh đúng nhu cầu này nhưng phải làm share-ra-ngoài (ảnh + vệt GPX + stats) thật đẹp, vì người dùng sẽ vẫn đăng lên Strava/Facebook nếu Potter không cho họ 'chiến tích' dạng chia sẻ được. |
| **Wikiloc** | Kho GPX cộng đồng lớn nhất thế giới, rẻ (~10 USD/năm), có lượng track VN do khách Tây upload nhiều hơn OSM. | Là đối thủ gần nhất về 'kho GPX VN'. Potter khác ở chỗ GPX được kiểm duyệt + gắn người dẫn + ảnh điểm xuất phát + xác minh checkpoint chống spoof — Wikiloc là kho thô, Potter là kho có bảo chứng. Rủi ro: Cấp 2 có thể lấy GPX Wikiloc đăng lại — cần kiểm duyệt chống đạo track. |
| **2bulu (两步路)** | Hình mẫu UX của brief: free, offline tốt, real-time team, feed outdoor — chứng minh mô hình châu Á (đi theo đoàn) thắng ở thị trường của nó. | Không bản địa hóa VN/ĐNÁ — đúng khoảng trống Potter nhắm. Màn Tiến độ đoàn + Bản đồ đoàn trực tiếp của v3 chính là bản địa hóa tính năng ăn khách nhất của 2bulu. |
| **Group Facebook/Zalo trekking VN + porter tự phát** | ĐỐI THỦ THẬT SỰ LỚN NHẤT: miễn phí, mạng lưới sẵn, niềm tin cá nhân, ghép đoàn/porter qua quen biết; porter nhận khách qua Zalo không mất hoa hồng. | Potter thắng bằng những gì FB không làm được: escrow + cọc 30% bảo vệ 2 chiều, review có xác minh (đoàn dẫn thật từ booking), ghép đoàn chia tiền tự động, bản đồ đoàn real-time, bảo hiểm kèm booking. Nguy cơ ngược: disintermediation — sau chuyến đầu khách có Zalo của porter và đi thẳng; 10% hoa hồng phải 'mua' được giá trị rõ ràng (bảo hiểm, đảm bảo hoàn cọc, lịch trống porter) nếu không sẽ bị lách. |
| **Klook/Traveloka Xperiences + tour operator (Viettrekking, Oxalis...)** | Phân phối tour đóng gói, thanh toán chuẩn, thương hiệu du lịch; Oxalis chứng minh mô hình adventure tour cao cấp có giấy phép. | Họ bán tour trọn gói, không bán 'porter lẻ + cung tự đi' — đúng ngách Cấp 2 của Potter. Nhưng họ cũng là kênh Cấp 3 tiềm năng: nên coi tour operator là supply đối tác (Cấp 3) thay vì đối thủ. Về gear, đối thủ thực là WeTrek/Fan Fan/Decathlon và dịch vụ thuê đồ local — Potter chỉ thắng nếu làm khâu họ không làm: giao tận điểm xuất phát bản. |

### 2.3 Điểm khác biệt thật sự

- Tìm porter — khác biệt thật và rất khó sao chép: không app quốc tế nào có (AllTrails/Gaia/Komoot phục vụ tự túc; Klook chỉ bán tour đóng gói); supply porter bản địa là quan hệ mặt đất phải đi gom từng bản — rào cản với đối thủ nước ngoài nhưng cũng là chi phí vận hành thật của Potter. Cơ chế trong design (giá cố định, Potter giữ 10%, cọc 30%, ghép đoàn chia tiền) giải đúng nỗi đau hiện phải mặc cả qua Zalo.
- Ghép đoàn chia tiền porter (~90k/người thay vì 350k) — đây là hook tăng trưởng mạnh hơn cả bản thân marketplace: chỉ làm được trong app, chống disintermediation tự nhiên, và biến chi phí porter từ rào cản thành lý do rủ thêm người cài app.
- Cung có bảo chứng: GPX thật kiểm duyệt + ảnh thực địa điểm xuất phát (docs/01 §1.3) + xác minh checkpoint ảnh-GPS 5 bước chống spoof (docs/05 chốt #8-9) → 'CERTIFIED' là đơn vị uy tín mà Wikiloc/AllTrails không có; nối thẳng vào thang uy tín 0–1000 của docs/04.
- Hệ 3 cấp gắn an toàn/pháp lý (docs/04): vừa là tính năng an toàn vừa là con hào — app phương Tây theo triết lý tự chịu trách nhiệm sẽ không copy; server đã enforce thật (TierGuard).
- An toàn theo đoàn kiểu châu Á: Tiến độ đoàn + bản đồ đoàn trực tiếp + SOS — bản địa hóa đúng tính năng ăn khách của 2bulu cho hành vi 'đi theo đoàn' của VN.
- Trải nghiệm 'chiến tích': Nhật ký hành trình (stats + 32 ảnh + vệt GPX), profile kiểu Oura, Trek HUD la bàn, Dynamic Island — tạo lớp cảm xúc/khoe mà Gaia thiếu; là khác biệt UX chứ không phải con hào, đối thủ copy được.
- LƯU Ý: Chợ gear KHÔNG phải khác biệt phòng thủ được — thuê/bán gear đã có WeTrek, shop local, homestay. Điểm khác duy nhất là logistics 'giao tận đầu bản trước 6h sáng ngày khởi hành' gắn với booking cung — chỉ có giá trị nếu làm asset-light qua đối tác địa phương, không tự ôm kho.

### 2.4 Đánh giá stack & nợ kỹ thuật

Stack Expo RN + @maplibre/maplibre-react-native + NestJS/PostGIS + GraphHopper (docs/05 chốt) là lựa chọn đúng và đã được docs/01 biện luận kỹ: RN thắng ở độ chín offline-pack của MapLibre và tuyển dụng VN; PostGIS là bắt buộc cho ST_DWithin/LineString; GraphHopper thắng OSRM nhờ custom model JSON cho nhiều profile hiking. Điểm mạnh hiện tại: nguyên tắc 'map thật không fake' được thực thi nghiêm (parse GPX Fansipan 9.541 điểm/24km/+3.264m verify được, 132 khúc rẽ sinh từ hình học, DEM Terrarium thật, Open-Meteo thật), server enforce 3 cấp thật, chat server + push + checkpoint verify đã xong, CI Jest chạy. NỢ KỸ THUẬT xếp theo độ nguy hiểm: (1) OFFLINE PMTILES chưa có mà để GĐ5 — nghịch lý chết người với app trekking vì cung Tây Bắc mất sóng là mặc định; checklist docs/04 §4.3 còn bắt user tick 'đã tải bản đồ offline' trong khi app chưa làm được; đây là nợ số 1. (2) Tile policy: đang chạy tile public OSM/OpenTopoMap/OpenFreeMap — vi phạm usage policy khi user tăng; pipeline Geofabrik→Planetiler→PMTiles→R2/CDN (<30 USD/th) đã đặc tả nhưng chưa dựng, và nó lại chính là tiền đề của offline → gộp 2 nợ này làm một hạng mục. (3) THANH TOÁN chưa có (cung 0đ auto-paid) trong khi toàn bộ v3 (porter 10% + cọc 30%, giỏ hàng gear, phí giao) đứng trên thanh toán + escrow — VNPay/MoMo + luồng giữ-cọc/hoàn-cọc là blocker doanh thu tuyệt đối. (4) Upload/storage chưa có (GĐ3) nhưng checkpoint verify, hồ sơ porter, nhật ký 32 ảnh, chợ gear đều cần ảnh — GĐ3 phải kéo lên trước v3. (5) Khoảng cách UI lớn: app mới 10 màn/5 tab cũ vs 21 màn v3, và v3 đổi IA (Chợ thay tab Nhắn tin) — phải quyết chỗ ở mới của chat vì chat là kênh vận hành porter/mua cung, server đã xong mà client còn mock. (6) Background tracking chưa có — Trek HUD/tiến độ đoàn/nhật ký cần ghi track khi tắt màn hình; lib tốt (react-native-background-geolocation) trả phí ~vài trăm USD/năm, docs/01 đã cảnh báo, cần duyệt ngân sách. (7) Dynamic Island = iOS Live Activities (ActivityKit) — cần native extension + dev build ngoài Expo Go (repo vốn đã prebuild nên khả thi), nhưng là công sức native thật, nên xếp P2 sau offline/payment. (8) Điểm cộng kiến trúc: snap vào GPX của cung thay vì OSM path (docs/01 §2b.2) là quyết định đúng đắn nhất của hệ thống — giữ nguyên.

### 2.5 Mô hình kiếm tiền (marketplace cung + porter + chợ gear)

Mô hình 3 dòng của v3 (hoa hồng cung Cấp 2/3 + porter 10% + chợ gear) hợp thị trường VN hơn thuê bao thuần — ARPU giao dịch/chuyến (porter 350k×10% = 35k, tour vài triệu×%, gear thuê + phí giao) vượt xa ARPU premium khả thi ở VN. Đánh giá từng dòng: (a) PORTER 10% là dòng đáng tin nhất nhưng mong manh trước disintermediation — hoa hồng phải được 'bọc' bằng giá trị chỉ-trong-app: escrow cọc 30% có hoàn theo chính sách, bảo hiểm tai nạn kèm mỗi booking (chi phí nhỏ, giá trị cảm nhận lớn, đồng thời giảm rủi ro pháp lý docs/04), lịch trống porter, review xác minh, ghép đoàn chia tiền. Cọc 30% + giữ 10% nghĩa là Potter cầm tiền hộ 2 bên → chạm quy định trung gian thanh toán VN, nên đi qua đối tác có phép (VNPay/MoMo/9Pay) thay vì tự giữ ví. (b) HOA HỒNG CUNG: cẩn trọng ranh giới docs/04 §4.4 — 'bán cung kèm support' của Cấp 2 dễ bị diễn giải thành kinh doanh lữ hành không phép; porter cũng vậy: 'vác đồ' là dịch vụ lao động nhưng 'dẫn cung' tiệm cận hướng dẫn viên du lịch (Luật Du lịch 2017 yêu cầu thẻ HDV) — wording trong app nên là 'porter đồng hành/gánh đồ', đẩy nghĩa vụ 'tour' lên Cấp 3 có giấy phép, và porter cần một vai riêng (Porter role) với KYC nhẹ thay vì ép qua thang Cấp 2 (450 điểm + 10 cung + GPX được duyệt — porter bản địa 8 năm kinh nghiệm như 'A Sùng' trong design sẽ không bao giờ qua nổi gate này dù là supply giá trị nhất). (c) CHỢ GEAR: biên mỏng, nặng vận hành — chỉ nên làm marketplace asset-light (shop/homestay địa phương làm seller, Potter lấy % + phí giao), tuyệt đối không ôm kho; lời hứa 'giao tận đầu bản trước 6h sáng' trong design là cam kết SLA của seller, không phải của Potter. (d) iOS IAP: dịch vụ porter/gear/tour là dịch vụ tiêu dùng ngoài đời thực → được miễn IAP 30%; riêng 'mua cung' thuần nội dung số có nguy cơ bị Apple ép IAP — nên đóng gói cung luôn kèm support người thật (vốn là thiết kế sẵn) để đứng về phía dịch vụ thực. (e) Premium thuê bao (offline, vệ tinh, 3D) giữ làm dòng phụ; satellite phải sau paywall vì phí provider. KẾT LUẬN: kim tự tháp doanh thu nên là Porter+Tour (đáy, chắc nhất) → hoa hồng cung → gear → premium; điều kiện tiên quyết của cả kim tự tháp là cổng thanh toán + escrow, hiện là ❌.

### 2.6 Khuyến nghị R&D (đã xếp ưu tiên)

- P0 — Dựng thanh toán VNPay/MoMo + luồng escrow cọc 30%/hoàn cọc/đối soát 10% qua đối tác trung gian thanh toán có phép. Đây là blocker của toàn bộ mô hình tiền v3 (porter, cung, gear đều đứng trên nó); repo hiện 'cung 0đ auto-paid'.
- P0 — Kéo offline PMTiles từ GĐ5 lên ngay sau thanh toán, gộp với việc self-host tile (Geofabrik VN → Planetiler → PMTiles → R2/CDN, <30 USD/th): vừa xóa rủi ro usage policy tile public, vừa đóng khoảng cách sống còn với Gaia/2bulu — app trekking VN không offline là không dùng được ngoài thực địa, và checklist an toàn docs/04 đang hứa thứ app chưa có.
- P0 — Sửa mâu thuẫn pháp lý SOS trong design v3: Trek HUD ghi 'Đã gửi vị trí cho đoàn & trạm cứu hộ ✓' trái quyết định đã chốt docs/05 §5 (SMS/gọi 112/115, không qua server, không hứa cứu hộ). Đổi copy thành 'Đã gửi SMS vị trí cho liên hệ khẩn cấp' trước khi implement, kẻo tự tạo trách nhiệm cứu hộ mà docs/04 dày công né.
- P1 — Thiết kế vai 'Porter' riêng ngoài thang 3 cấp: KYC nhẹ (CCCD + xác nhận của Cấp 2/3 hoặc trưởng bản/đối tác địa phương), hồ sơ do người khác tạo hộ được (porter bản địa ít dùng smartphone), không bắt gate 450 điểm/10 cung của Cấp 2. Đồng thời chốt wording pháp lý: porter = 'đồng hành/gánh đồ', không phải 'hướng dẫn viên' (Luật Du lịch 2017), và cho luật sư rà trước khi mở dòng tiền.
- P1 — Chống disintermediation bằng gói giá trị chỉ-trong-app: bảo hiểm tai nạn kèm mỗi booking porter, chính sách hoàn cọc, review xác minh từ booking thật, và đặc biệt đẩy mạnh 'Ghép đoàn chia tiền porter' làm hook tăng trưởng chính (chỉ ghép được trong app, giảm 350k→90k/người là lý do cài app mạnh nhất).
- P1 — Kéo upload/storage (GĐ3) lên trước khi build màn v3: checkpoint verify ảnh-GPS, hồ sơ porter, nhật ký 32 ảnh, chợ gear đều chết nếu không có ảnh. S3/R2 + thumbnail queue theo đúng đặc tả docs/01 §2.2.
- P1 — Quyết định IA cho chat: v3 thay tab Nhắn tin bằng Chợ trong khi chat là kênh vận hành porter/mua cung và server Socket.IO đã xong. Đề xuất: chat thành icon góc phải Trang chủ/Trek HUD + entry trong từng booking, không để thành tính năng mồ côi.
- P2 — Chợ gear: pilot asset-light tại 1–2 hub (Tà Xùa, Sa Pa) với seller là shop/homestay địa phương, Potter chỉ lấy % + điều phối giao tận điểm xuất phát; đo tỷ lệ đính kèm gear vào booking cung trước khi mở rộng. Không tự ôm kho.
- P2 — Dynamic Island/Live Activities: cần ActivityKit native extension + dev build (repo đã prebuild nên khả thi); làm sau offline/payment, ưu tiên Android foreground-service notification trước vì tệp VN đa số Android. Kèm theo: duyệt ngân sách lib background-geolocation trả phí như docs/01 §4.3 cảnh báo.
- P2 — Kiểm duyệt chống đạo track: thêm bước đối chiếu GPX Cấp 2 nộp với nguồn công khai (Wikiloc/AllTrails) và yêu cầu ảnh thực địa có EXIF-GPS khớp track — bảo vệ giá trị cốt lõi 'cung có bảo chứng' khỏi bị pha loãng.
- P3 — Instrument analytics (DAU/retention/conversion booking) ngay khi có thanh toán, và chỉ mở rộng SEA sau khi thắng rõ 3–4 hub Tây Bắc bằng số liệu; mô hình porter marketplace lặp lại được ở Rinjani/Kinabalu nhưng supply mặt đất phải gom lại từ đầu ở mỗi nước.

---

## 3. AGENT TREKKER — Nhập vai người dùng thật

### 3.1 Nhân vật

Trần Thuỳ Linh, 27 tuổi, nhân viên marketing ở Hà Nội. Đã leo 3 đỉnh (Hàm Lợn, Tà Năng, Fansipan đường Trạm Tôn theo tour). Chuẩn bị leo Lảo Thẩn lần đầu cùng nhóm 4 người bạn, tự tổ chức. Nỗi lo lớn nhất: lạc đường ở đoạn mất sóng, không biết thuê porter ở đâu cho tin cậy, và điện thoại (iPhone 13, pin đã chai) tụt pin giữa núi.

### 3.2 Hành trình trọn vẹn qua 21 màn

| # | Bước | Màn | Trải nghiệm | Vướng mắc |
|---|---|---|---|---|
| 1 | Cài app, mở lần đầu | Onboarding | 3 slide nói trúng tim đen: 'GPX kiểm chứng, đi là tới, không lo lạc', 'cảnh báo khi có người tách đoàn quá 500 m', 'săn mây có dự báo từng giờ'. Mình lo lạc đường mà slide đầu tiên nói đúng chuyện đó luôn — có nút Bỏ qua nên không sốt ruột. | không — ngắn, đúng 3 giá trị, không lan man |
| 2 | Đăng ký tài khoản | Đăng nhập | Nhập SĐT +84 nhận OTP, hoặc Google/Apple — quen thuộc như mọi app Việt, 30 giây là xong. | Không có chế độ 'xem thử không cần đăng nhập'. Mình muốn ngó giá cung Lảo Thẩn trước rồi mới quyết định đưa số điện thoại — bị chặn cửa ngay từ đầu |
| 3 | Khám phá trang chủ | Trang chủ | 'Chào, Linh' + 'Bình minh 5:42 · 18°C · SĂN MÂY 74%' — con số săn mây đập vào mắt đầu tiên, đúng thứ dân trek Việt tra cứu thủ công trên group Facebook trước mỗi chuyến. Carousel Tà Xùa, Lảo Thẩn với thời gian/quãng/cấp độ ngay trên thẻ. | Không thấy ô tìm kiếm. Mình biết sẵn mình muốn đi Lảo Thẩn mà phải lướt carousel hoặc bấm 'Tất cả 48 cung' rồi tự dò |
| 4 | Tìm cung Lảo Thẩn | Tất cả cung đường | Danh mục Núi/Rừng/Hồ/Thác/Hang khá hay để khám phá, thẻ cung có độ cao, km, tỉnh, nhãn KHÓ/CHUẨN/DỄ rõ ràng. | Với 48 cung mà KHÔNG có tìm kiếm, không lọc theo độ khó/số ngày/khoảng cách từ Hà Nội, không sắp xếp — nhóm mình chỉ rảnh 2N1Đ cuối tuần, muốn lọc 'Chuẩn + 2N1Đ + miền Bắc' mà phải cuộn tay từng thẻ |
| 5 | Đọc chi tiết cung Lảo Thẩn | Chi tiết cung | Đây là màn thuyết phục mình nhất: badge 'GPX ĐÃ KIỂM CHỨNG · 3 CHECKPOINT', cảnh báo 'Cấp 2 — cần thể lực khá, nên có người dẫn đường', mặt cắt độ cao 1.600→2.862 m, từng checkpoint có km + độ cao + chỗ lấy nước, thời tiết 2 ngày kèm % mây, checklist đồ mang (đèn đội đầu, túi ngủ -5°C…), giấy phép vào rừng 30k/người, và lưu ý 'sóng chập chờn từ km 6 — tải bản đồ ngoại tuyến trước'. Nút 'Tải GPX ngoại tuyến · 2,4 MB' ngay trong màn — mình bấm tải liền vì sợ mất sóng. Đọc xong mình tự tin hẳn, cảm giác như có leader kinh nghiệm ngồi brief cho cả nhóm. | Khối 'Kiểu 1 · Tour riêng — Porter tự tổ chức & định giá — Potter giữ 10%' và 'Kiểu 2 · Tìm porter' là ngôn ngữ mô hình kinh doanh lọt ra UI — mình đọc 3 lần vẫn không chắc chọn kiểu nào thì khác gì. 'Phí Potter 10%' ai trả — cộng vào giá mình hay trừ của porter? Giá '300.000đ /người' không nói rõ là cả chuyến 2N1Đ hay mỗi ngày (porter thì lại ghi /ngày). Trạm cứu hộ thì ghi 'SĐT trong mục Cài đặt' — lúc khẩn cấp ai đi lục Cài đặt? |
| 6 | Tìm porter cho nhóm | Tìm porter | Banner 'Ghép đoàn để chia tiền porter — 4 người đang tìm cùng ngày, chia còn ~90k/người' làm mình ồ lên — đây đúng là thứ nhóm mình vẫn phải tự đi xin ghép trên Facebook. Mỗi porter có số đoàn đã dẫn, sao, ngôn ngữ (Kinh · H'Mông), lịch trống từng ngày. | Nút duy nhất là 'Đặt · cọc 30%' — không có nút nhắn tin hay gọi cho porter trước. Chuyển tiền cọc cho một người mình chưa nói chuyện câu nào, dù chỉ ~100k, vẫn lấn cấn; nhóm mình chắc chắn sẽ hỏi 'có Zalo của anh ấy không?' |
| 7 | Xem hồ sơ porter Vàng A Chớ / A Sùng | Chi tiết porter | Hồ sơ đàng hoàng: 4,9★, 214 đoàn, 8 năm kinh nghiệm, biết sơ cứu, nấu ăn, review từ người đi trước ('luôn đi cuối để không ai tụt lại' — câu này ăn tiền với người sợ tụt đoàn như mình). '350.000đ/ngày · Đã gồm gánh đồ đoàn'. | 'Gánh đồ đoàn' là bao nhiêu kg? 1 porter kham nổi 4 balo không hay phải thuê 2? Không có số điện thoại, không có chat — vẫn là đặt lịch 'chay' |
| 8 | Thuê đồ: lều, túi ngủ | Chợ → Giỏ hàng | Tab Lều trại/Porter/Đồ ăn/Tour gọn; 'Combo lều + túi ngủ giao tận bản, từ 120k/đêm' — khỏi vác lều từ Hà Nội lên, quá tiện. Giỏ hàng ghi 'Giao tận đầu bản · trước 6h sáng ngày khởi hành', phí giao 30k, tổng cộng rõ ràng. | Giỏ hàng không cho chọn ngày giao và tự gắn với chuyến nào — mình thuê cho chuyến Lảo Thẩn mà dòng giao hàng ghi cứng 'bản Công' (điểm của Tà Xùa). Thuê túi ngủ -5°C mà không thấy điều khoản đặt cọc thiết bị / đền nếu rách ướt — kiểu gì đến nơi cũng phát sinh cãi nhau |
| 9 | Đặt cọc giữ chỗ | Chi tiết cung (sheet Thanh toán) | Sheet thanh toán là điểm cộng lớn về minh bạch: chọn gói (Tự đi / Có porter / Trọn gói / Thuê lẻ) thấy giá đổi theo, chỉnh số người thì tự chia tiền, hiện rõ 'Đặt cọc ngay 30% — còn lại trả khi hoàn thành', Momo/VNPay/thẻ. Trả nốt 70% sau khi xong khiến mình yên tâm hẳn — porter có động lực dẫn tử tế. | Không một dòng nào về chính sách huỷ/hoãn: trời bão, cả nhóm ốm thì cọc 30% mất luôn? Với cung 300k mình tặc lưỡi, nhưng tour trọn gói 2,4tr thì đây là câu hỏi chặn quyết định |
| 10 | Trước ngày đi: tải offline + dẫn đường tới điểm xuất phát | Xác minh checkpoint (sheet Bắt đầu + Dẫn đường) → Bản đồ | Sau khi cọc, app hỏi 'Bắt đầu hành trình chưa?' kèm nút 'Tải bản đồ offline · 2,4 MB' ngay tại chỗ, rồi dẫn đường XE MÁY tới điểm xuất phát: 'Rẽ trái vào QL37 · 18,4 km · ~42 phút'. Chuyến Tà Năng trước nhóm mình lạc ngay từ… đường vào bãi gửi xe, nên bước này mình muốn vỗ tay. Tới nơi bấm 'Đã tới điểm bắt đầu · vào cung' là chuyển thẳng sang chế độ trek. | 2,4 MB nghe nhẹ đến mức đáng ngờ — có gồm ảnh vệ tinh/đường đồng mức không hay chỉ là vệt GPX? Mình muốn biết chắc trước khi lên vùng không sóng |
| 11 | Đang leo ngày 2 | Trek HUD + Bản đồ | HUD chữ rất to: 6:47 đã đi, còn ~5:24, 6,8/17,2 km, la bàn, '2.208 m · còn 657 m lên đỉnh · GPS ±4 m'. Dòng 'còn 657 m lên đỉnh' là liều dopamine đúng lúc chân đang muốn bỏ cuộc. Chữ to nền tối — đeo găng, nắng chói vẫn liếc được. Bản đồ 3D thấy vị trí từng người trong đoàn. | Không thấy chỉ báo pin / chế độ tiết kiệm pin — GPS ghi track liên tục 12 tiếng là thứ giết pin nhất, iPhone chai pin của mình cần biết 'còn đủ pin ghi đến đỉnh không'. Cũng không có chỉ báo 'đang chạy offline' — mất sóng rồi mà app im lặng thì mình sẽ hoang mang không biết bản đồ còn sống không |
| 12 | Bấm thử nút khẩn cấp | Trek HUD (SOS) | 'Báo khẩn cấp' một chạm → 'Đã gửi vị trí cho đoàn & trạm cứu hộ ✓'. Có nút này hiện diện thường trực làm mình an tâm kiểu tâm lý, như mang theo còi. | Một chạm không có bước xác nhận — điện thoại trong túi quần bấm nhầm là báo động giả cho cả trạm cứu hộ. Và câu hỏi lớn nhất không được trả lời: MẤT SÓNG thì SOS gửi bằng đường nào? Nếu chỉ là hàng đợi chờ có sóng thì phải nói thật, đừng để mình tưởng nó là thiết bị vệ tinh |
| 13 | Qua checkpoint Mỏm cá heo | Xác minh checkpoint → Check-in | 'Bạn cách checkpoint 12 m · GPS ±6 m · TRONG VÙNG' → 'Chụp & đóng dấu GPS'. Cảm giác như đóng mộc hộ chiếu, sướng và đáng tin — ảnh có toạ độ thật chứ không phải ảnh mạng. Màn check-in có toggle 'Chia sẻ toạ độ chính xác — tắt = chỉ hiện tên khu vực': người hiểu chuyện thiết kế cái này, đỡ lộ toạ độ điểm camping hoang sơ. | Sáng đó sương mù dày hoặc GPS nhiễu quá 50 m thì sao? Không thấy đường lui 'xác minh sau' hay 'xác minh thủ công' — chả lẽ mất công leo mà không được tính mốc |
| 14 | Theo dõi cả đoàn | Tiến độ đoàn | Thấy cả 8 người: ai đi bao km, pace bao nhiêu, porter ở đâu — đúng thứ nhóm mình cần thay vì hét gọi nhau qua sườn núi. Chat đoàn có tin 'Đoạn dốc đá phía trước trơn lắm, bám dây nhé' — thông tin sống còn truyền được về sau. | Nhưng nó được thiết kế như bảng xếp hạng đua: 'Bạn đang ở vị trí thứ 4 — cách top 3 chỉ 300 m, giữ nhịp nhé!'. Trek theo đoàn nguyên tắc số 1 là ĐI CÙNG NHAU, app lại cổ vũ mình bứt tốc đuổi top 3 — ngược hoàn toàn với chính tính năng 'cảnh báo tách đoàn 500 m' của nó |
| 15 | Xuống núi, tổng kết | Nhật ký hành trình | 'Hoàn thành · Tà Xùa 2N1Đ' với 17,2 km, 12:04, +1.880 m, pace, 32 ảnh xếp theo dòng thời gian, vệt GPX đã ghi. Như một cuốn album tự đóng — mình sẽ mở lại màn này nhiều lần để khoe. | không — màn gây nghiện nhất app |
| 16 | Khoe chuyến đi, tương tác | Cộng đồng → Bình luận → Hồ sơ | Đăng bài kèm badge 'GPX ĐÃ KIỂM CHỨNG' — flex có bằng chứng, hơn hẳn ảnh Facebook. Bài người khác có nút 'Đi cung này' nhảy thẳng vào chi tiết cung — từ ghen tị sang đặt chỗ trong 2 chạm, vòng lặp rất khôn. Hồ sơ có huy hiệu đỉnh đã leo (4/24), lịch sử cung, cung đã lưu. | Hồ sơ có 'Bước chân hôm nay 9.240 · 412 kcal' — mình mở app trek để xem núi, không cần thêm một cái đếm bước như 5 app khác; chiếm chỗ trang trọng nhất màn. Bình luận có người xin GPX và được trả lời 'add Zalo' — chứng tỏ app còn thiếu kênh chia sẻ GPX riêng tư nên user phải chạy ra ngoài |

### 3.3 Bảng điểm

| Hạng mục | Điểm /10 |
|---|---|
| UI | **8.5** |
| Flow (luồng) | **8** |
| Độ tin cậy (dám bỏ tiền?) | **7.5** |
| An toàn (SOS, offline) | **6.5** |
| **Tổng thể** | **7.5** |

### 3.4 Điểm đau (pains)

- 😖 Thuật ngữ nội bộ lọt ra UI ở màn quyết định chi tiền: 'Kiểu 1 · Tour riêng', 'Kiểu 2 · Tìm porter', 'Phí Potter 10%' — người dùng không hiểu khác nhau chỗ nào và ai chịu phí 10%
- 😖 Không thể nhắn tin/gọi cho porter trước khi đặt cọc 30% — bắt người dùng chuyển tiền cho người lạ chưa nói chuyện câu nào; đây là rào cản niềm tin lớn nhất của cả luồng đặt
- 😖 An toàn nói nhiều nhưng thiếu 3 câu trả lời sống còn: SOS hoạt động thế nào khi mất sóng, không có chỉ báo pin/chế độ tiết kiệm pin khi ghi GPS 12 tiếng, SĐT trạm cứu hộ bị giấu trong Cài đặt thay vì nằm ngay Trek HUD
- 😖 Màn 'Tất cả cung đường' không có tìm kiếm, không lọc theo độ khó/số ngày/vùng miền — 48 cung mà bắt cuộn tay từng thẻ
- 😖 Giá mơ hồ và không có chính sách huỷ: cung ghi '/người' nhưng porter ghi '/ngày' (chuyến 2N1Đ tính sao?), cọc 30% mất hay hoàn khi bão phải hoãn — không một dòng nào
- 😖 Tiến độ đoàn thiết kế như leaderboard đua tốc độ ('cách top 3 chỉ 300 m — giữ nhịp nhé!') — cổ vũ tách tốp, mâu thuẫn trực tiếp với tính năng cảnh báo tách đoàn 500 m
- 😖 Giỏ hàng thuê đồ không gắn với chuyến đi: không chọn được ngày giao, điểm giao ghi cứng 'bản Công' kể cả khi mình đi cung khác; không có điều khoản cọc/đền thiết bị thuê
- 😖 Xác minh checkpoint bằng ảnh GPS ≤50 m không có phương án dự phòng khi sương mù dày hoặc GPS nhiễu — leo tới nơi mà có thể không được tính mốc
- 😖 Không có chế độ khách xem trước khi đăng ký — chặn OTP ngay từ cửa với người chỉ muốn tham khảo giá

### 3.5 Điểm sướng (delights)

- 🤩 Chuỗi mua → tải bản đồ offline 2,4 MB → dẫn đường xe máy tới tận điểm xuất phát ('Rẽ trái QL37 · 18,4 km · ~42 phút') → vào cung: liền mạch, giải đúng nỗi sợ 'lạc từ lúc chưa leo' mà chưa app nào ở VN làm
- 🤩 Chỉ số SĂN MÂY 74–82% cập nhật từng giờ + thông báo 'Lảo Thẩn tỷ lệ biển mây 82% sáng mai' — đúng insight độc nhất của trekker Việt, thay cả một group Facebook dự mây
- 🤩 Ghép đoàn chia tiền porter ('4 người đang tìm cùng ngày — chia còn ~90k/người') — biến chi phí porter từ gánh nặng thành chuyện vặt
- 🤩 Chi tiết cung như một leader kinh nghiệm brief: cảnh báo cấp độ, mặt cắt độ cao, checkpoint kèm điểm lấy nước cuối, checklist đồ, giấy phép 30k, cảnh báo 'mất sóng từ km 6'
- 🤩 Trek HUD chữ to nền tối, 'còn 657 m lên đỉnh · GPS ±4 m' — đọc được khi đeo găng, nắng chói, và tiếp thêm ý chí đúng đoạn muốn bỏ cuộc
- 🤩 Chụp & đóng dấu GPS tại checkpoint ('cách 12 m · TRONG VÙNG') — cảm giác đóng mộc hộ chiếu, tạo bằng chứng chinh phục thật thay vì ảnh sống ảo
- 🤩 Toggle ẩn toạ độ chính xác khi check-in (chỉ hiện tên khu vực) — hiểu văn hoá bảo vệ điểm hoang sơ của cộng đồng trek
- 🤩 Đặt cọc 30% · trả nốt 70% khi hoàn thành, chỉnh số người tự chia tiền — cấu trúc thanh toán minh bạch, tự tạo động lực cho porter dẫn tử tế
- 🤩 Nút 'Đi cung này' ngay trên bài feed có GPX kiểm chứng — từ ghen tị với ảnh người khác sang đặt chuyến trong 2 chạm

### 3.6 Phán quyết của trekker

> Có — mình sẽ giới thiệu cho nhóm 4 đứa đi Lảo Thẩn, vì bộ ba offline map + dẫn tới điểm xuất phát + ghép porter chia tiền giải đúng 3 nỗi lo lớn nhất của tụi mình, và với cung ~300k mình dám cọc 30% qua Momo ngay. Nhưng mình sẽ dặn kèm: 'Cứ đặt trên app cho có GPX và bảo hiểm, nhưng vẫn phải xin Zalo porter chốt lại giờ hẹn' — vì app chưa cho liên hệ porter trước khi trả tiền và chưa nói gì về hoàn cọc khi hoãn vì bão. Với tour trọn gói 2,4tr thì mình chưa dám xuống tiền cho tới khi hai điều đó rõ ràng. Điểm An toàn chỉ 6.5 vì SOS chưa trả lời được câu hỏi quan trọng nhất trên núi Việt Nam: mất sóng thì sao — nếu bản build thật làm rõ SOS offline, chỉ báo pin và đưa SĐT cứu hộ ra Trek HUD, mình nâng thành 8+ và app này thay được cả Gaia GPS lẫn group Facebook trong túi mình.

---

## 4. Danh sách hành động hợp nhất (3 agent giao nhau)

| Ưu tiên | Việc | Agent đề xuất |
|---|---|---|
| **P0** | Thanh toán VNPay/MoMo + escrow cọc 30% / hoàn cọc / đối soát 10% | R&D + Trekker |
| **P0** | Offline PMTiles kéo từ GĐ5 lên ngay (self-host tile, xoá rủi ro usage policy) | R&D + Trekker (an toàn 6.5/10 vì thiếu) |
| **P0** | Sửa copy SOS trái docs/05 (không hứa "trạm cứu hộ"; SMS/gọi 112/115 trực tiếp) + đưa SĐT cứu hộ ra Trek HUD | R&D + Trekker |
| **P0** | Cho nhắn tin/gọi porter TRƯỚC khi đặt cọc (rào cản niềm tin lớn nhất) | Trekker + R&D |
| **P1** | Token hoá theme dark v3 vào `app/src/theme/tokens.ts` rồi mới port màn | UI |
| **P1** | Chốt IA tab bar mới (Chợ thay Nhắn tin? chat đi đâu?) trước khi thêm màn | UI + R&D |
| **P1** | Upload/storage ảnh (GĐ3) kéo lên trước — checkpoint verify, porter, nhật ký, chợ đều cần ảnh | R&D |
| **P1** | Sửa touch target < 44px có hệ thống: toggle 26px, stepper 24px, nút thêm-giỏ 28px, nút Ghép ~30px | UI + Trekker |
| **P1** | Thêm tìm kiếm/lọc/sort cho màn Tất cả cung đường (48 cung không thể cuộn tay) | UI + Trekker |
| **P1** | Làm rõ ngôn ngữ giá: "Kiểu 1/Kiểu 2", "/người" vs "/ngày", ai chịu phí 10%, chính sách hoãn/hoàn khi bão | Trekker |
| **P2** | Thiết kế bổ sung màn Bản đồ (offline indicator, scale bar, route card, GPS accuracy, SOS khi nav) | UI |
| **P2** | Đổi Tiến độ đoàn từ leaderboard đua tốc độ → an toàn đoàn (cảnh báo tụt lại màu ember) | Trekker + UI |
| **P2** | Chợ gear: pilot asset-light 1–2 hub, sửa UX giỏ hàng (ngày giao, điểm giao theo cung, giỏ trống) | R&D + Trekker |
| **P2** | Trạng thái NGOÀI VÙNG/GPS yếu cho Xác minh checkpoint (design mới vẽ happy path) | UI |
| **P3** | Dynamic Island/Live Activities (iOS native, cần dev-client) — làm chót, đã có fallback pill | UI + R&D |

---

*Báo cáo sinh bởi workflow 3 agent (Claude Code) — kết quả gốc dạng JSON lưu tại phiên làm việc; đối chiếu được với `docs/06-gap-analysis.md`.*