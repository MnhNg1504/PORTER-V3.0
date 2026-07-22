# POTTER 3.0 — Bản Spec Tổng Hợp (để CHỐT)

> Gộp từ: [[00-brief]] · [[01-rnd-market-tech]] · [[02-ux-ui-5tabs]] · [[03-map-ux-flows]] · [[04-user-tiers-scoring]] + 2 prototype thật (`prototype/map-demo.html`, `prototype/nav-demo.html`).
> Mục đích: 1 tài liệu duy nhất để bạn duyệt & chốt trước khi code. Mọi phần đánh dấu 🔴 = **cần bạn quyết**.

---

## 1. Tóm tắt sản phẩm
App di động cho cộng đồng trekking VN/ĐNÁ. Lõi mạnh nhất = **bản đồ thật** (MapLibre + OSM + DEM), khác biệt = **cung có hướng dẫn + ảnh điểm xuất phát**, **marketplace bán cung kèm support**, **hệ 3 cấp user gắn an toàn/pháp lý**. Đối thủ (Gaia, AllTrails, 2bulu) không phủ đúng ngách này ở VN.

## 2. Kiến trúc 5 Tab (đã đặc tả đầy đủ ở [[02-ux-ui-5tabs]])
| Tab | Nội dung lõi | Ưu tiên MVP |
|---|---|---|
| 1. Cộng đồng | Feed, ảnh, check-in cung, follow/like/comment | P1 |
| 2. Cung đường | Danh mục cung, Route Card đủ chỉ số, điểm đến hot | **P0** |
| 3. Bản đồ/Chỉ đường | Map thật, snap cung mua, mở cung (cấp 2+), offline, elevation | **P0** |
| 4. Nhắn tin | Chat mua–bán cung / support | P1 |
| 5. Hồ sơ/Cột mốc/R&D | Profile, thành tích (km, leo, số cung), R&D | P1 |
Bottom nav 5 tab + nút giữa "Xuất phát" nổi (kiểu 2bulu). Design tokens: tông thiên nhiên/xanh lá; style điều hướng = xanh-sạch (đã duyệt qua `nav-demo.html`).

## 3. Bản đồ THẬT — kiến trúc dữ liệu (đã chốt hướng, xem [[03-map-ux-flows]] + [[01-rnd-market-tech]])
| Thành phần | Nguồn thật | Ghi chú |
|---|---|---|
| Tile nền | OSM (Geofabrik VN) → Planetiler → **PMTiles** + CDN | < 30 USD/th ở MVP; vệ tinh (Esri/Maxar) để sau Premium |
| Vector style | OpenFreeMap/Protomaps → custom style xanh-sạch | Đã thử nghiệm ở `nav-demo.html` |
| Địa hình 3D + hillshade | **DEM Terrarium/Copernicus GLO-30** (miễn phí) | Isometric + đổ bóng — đã demo |
| Contour (bình độ) | OpenTopoMap (MVP) → tự sinh từ DEM (sau) | — |
| Routing / snap-to-trail | **GraphHopper** (hiking profile) trên OSM | Thắng OSRM; hỗ trợ offline routing |
| Nguồn TRAIL | **GPX thật do user Cấp 2 upload** (kiểm duyệt) | Vì trail trek VN trên OSM còn thưa — đúng mô hình bán cung |
| Offline | PMTiles + routing graph + DEM tải theo Area | Gắn gói Premium |
✅ Đã kiểm chứng thật: parse GPX Fansipan = 9.541 điểm, 24km, +3.264m leo, đỉnh 3.133m; sinh 132 khúc rẽ từ hình học.

## 4. Luồng "Mua cung hướng dẫn" (state machine — [[03-map-ux-flows]])
1. **Dẫn tới ĐIỂM XUẤT PHÁT** (bắt buộc có **ảnh thực địa** để đối chiếu) → cảnh báo khi tới nơi.
2. **Đi cung**: snap track mẫu, dẫn đường GPX, cảnh báo off-route, ETA, còn lại, độ cao — đã demo card turn-by-turn.

## 5. Hệ 3 cấp user (đã đặc tả [[04-user-tiers-scoring]])
- **Cấp 1 (Mới):** chỉ cung Dễ; cung khó bị app **chặn** nếu không có người hướng dẫn. Waiver bắt buộc.
- **Cấp 2 (Kinh nghiệm):** đủ GPX/lịch sử → mở cung riêng, **bán cung + support**, dẫn cấp 1.
- **Cấp 3 (Doanh nghiệp/Tour):** pháp nhân, quản đoàn, chạy tour (cần giấy phép lữ hành — Luật Du lịch 2017).
Thang uy tín 0–1000; ma trận phân quyền; enforce trong-app + waiver là lớp pháp lý chính; lưu ý NĐ 13/2023 về dữ liệu vị trí. *(Khung đề xuất — cần luật sư rà.)*

## 6. Mô hình kinh doanh
- **Free:** map cơ bản, xem cung, cộng đồng, ghi track.
- **Premium (thuê bao):** offline, lớp nâng cao (vệ tinh/3D), snap không giới hạn.
- **Marketplace:** hoa hồng trên mỗi cung/support bán bởi cấp 2/3.
🔴 Cần chốt: giá Premium, % hoa hồng, có bán lẻ cung (mua đứt) không.

---

## 7. Khuyến nghị TECH STACK (từ [[01-rnd-market-tech]])
- **Mobile:** React Native (`@maplibre/maplibre-react-native`) **hoặc** Flutter (`maplibre_gl`) — cùng lõi MapLibre Native. RN nhỉnh map/offline & tuyển người; Flutter nhỉnh UX mượt.
- **Backend:** NestJS + PostgreSQL/**PostGIS** + object storage (GPX/ảnh) + WebSocket (chat/track).
- **Map infra:** Planetiler → PMTiles trên CDN; GraphHopper self-host cho routing.

---

## 8. Đề xuất phạm vi MVP (giai đoạn 1) — để không làm tràn
**Có trong MVP (P0):**
- Tab 2 (Cung đường) + Tab 3 (Map thật: xem cung, GPS, snap cung đã mua, elevation, offline cơ bản).
- Luồng mua cung → dẫn tới điểm xuất phát có ảnh → đi cung turn-by-turn.
- User cấp 1 & 2 (chưa làm cấp 3/tour).
- Upload & kiểm duyệt GPX của cấp 2.

**Để giai đoạn 2:** Cộng đồng đầy đủ (Tab 1), chat nhóm (Tab 4), cấp 3/tour, custom vector style hoàn chỉnh, cột mốc/R&D nâng cao.

---

## 9. 🔴 CÁC ĐIỂM CẦN BẠN CHỐT
1. **Tech stack mobile:** React Native hay Flutter?
2. **Phạm vi MVP:** đồng ý đề xuất mục 8, hay muốn thêm/bớt?
3. **Mô hình giá:** hướng Premium thuê bao + hoa hồng marketplace — mức giá & % ra sao?
4. **Bước kế tiếp:** sau khi chốt, khởi động **agent Code** (dựng khung dự án thật) + **agent Kiểm-tra-chéo**?

### ✅ QUYẾT ĐỊNH ĐÃ CHỐT (2026-07-22)
1. **Tech stack mobile:** **React Native** (theo khuyến nghị R&D — `@maplibre/maplibre-react-native`). Agent Code toàn quyền chọn công cụ đi kèm (Expo/bare, state mgmt…) và giải thích khi bàn giao.
2. **Phạm vi MVP:** **MVP rộng** — dựng khung đủ **cả 5 tab** ngay từ đầu (gồm Cộng đồng + Nhắn tin), không hoãn sang GĐ2.
3. **Mô hình giá:** Premium thuê bao + hoa hồng marketplace (mức cụ thể chốt sau, chưa chặn code).
4. **Bước tiếp:** khởi động **agent Code** dựng khung project thật → **agent Kiểm-tra-chéo** rà lại.
