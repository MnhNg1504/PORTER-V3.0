# POTTER 3.0 — R&D: Nghiên cứu thị trường & Công nghệ

> File R&D thuộc dự án POTTER 3.0. Nguồn ngữ cảnh chung: [[00-brief]].
> Mục tiêu: cung cấp cơ sở để **user chốt TECH STACK** và để agent Code triển khai.
> Ngày cập nhật: 2026-07-22. Số liệu giá/chi phí là ước lượng tham khảo, cần verify lại trước khi ký hợp đồng.

---

## 0. TL;DR (đọc trước)

- **App:** MapLibre GL Native — chọn **RN (`@maplibre/maplibre-react-native`)** nếu ưu tiên map/offline trưởng thành + team JS, hoặc **Flutter (`maplibre_gl`)** nếu ưu tiên UX mượt (xem §2.1 & §2b.5, user chốt theo team). **Backend:** NestJS (Node) hoặc Go + PostgreSQL/PostGIS. **Routing:** GraphHopper. **Tile:** tự host Planetiler/Protomaps → PMTiles + CDN (< 30 USD/tháng ở MVP cho vùng VN).
- **Bản đồ THẬT (ràng buộc user):** nền = OSM thật (Geofabrik VN), **cung = GPX thật do Cấp 2 upload** (không fake), elevation = **Copernicus DEM GLO-30 (free)**, routing = GraphHopper trên OSM thật. Chi tiết §2b.
- **Khoảng trống thị trường:** không có app "AllTrails/Gaia-class" bản địa hóa cho **Việt Nam / Đông Nam Á**, có **cung hướng dẫn kèm ảnh thực địa điểm xuất phát** và **marketplace bán cung có support** — POTTER nhắm đúng vào đây.
- **Cảnh báo pháp lý quan trọng:** tile OSM tự host = OK, nhưng **BẮT BUỘC attribution "© OpenStreetMap contributors"** và tuân thủ **ODbL** (share-alike). Ảnh vệ tinh **KHÔNG** miễn phí — phải mua provider (xem §3).

---

## 1. Phân tích đối thủ

### 1.1 Bảng so sánh tổng quan

| Tiêu chí | AllTrails | Gaia GPS | Astrail | Komoot | 两步路 (2bulu) | Strava |
|---|---|---|---|---|---|---|
| **Định vị sản phẩm** | Discovery + cộng đồng hiking | Navigation chuyên sâu, backcountry | Hiking/nav (thị trường nhỏ) | Route planning multi-sport (đi bộ + xe đạp) | Outdoor toàn diện (bản đồ TQ) | Theo dõi hoạt động thể thao + social |
| **Bản đồ** | Topo + vệ tinh, heatmap cộng đồng | **Rất mạnh:** hàng trăm layer topo/vệ tinh/thời tiết, xếp chồng opacity | Topo cơ bản | Topo, tự tính lộ trình theo bề mặt đường | Topo + vệ tinh, dữ liệu track dày ở TQ | Bản đồ nền + heatmap (không phải app nav) |
| **Offline** | Có (Plus/Peak) | **Xuất sắc** — tải theo vùng, chọn layer + độ phân giải, route offline | Có, cơ bản | 1 region free, còn lại trả phí | **Rất tốt & free** — tải track/vùng offline | Hạn chế (chủ yếu tracking) |
| **Snap-to-trail / routing** | Custom Routes (ML, tier Peak) | Có, route offline được | Cơ bản | **Mạnh** — routing theo profile đi bộ/đạp | Có, theo track cộng đồng | Không (chỉ record + segment) |
| **Cộng đồng** | **Rất mạnh** — review, ảnh, điều kiện đường | Trung bình | Yếu | Highlights, ảnh, gợi ý cộng đồng | **Mạnh tại TQ** — feed "在路上", team real-time | **Rất mạnh** — social/segment/kudos |
| **Real-time đội nhóm** | Không nổi bật | Có (chia sẻ vị trí) | Không | Không | **Có** — xem vị trí đồng đội | Beacon (an toàn) |
| **Mô hình giá** | Free + Plus ~35.99 USD/năm + **Peak 79.99 USD/năm** (AI) | **Premium ~39.99 USD/năm** | Free/nhỏ | Chuyển sang subscription 3/2025: ~59.99 USD/năm (bỏ mua region lẻ) | **Free là chính**, gói VIP giá rẻ | Free + Subscription ~79.99 USD/năm |
| **Điểm mạnh** | Cộng đồng + khám phá + thương hiệu | Layer & offline & độ chính xác nav | — | Routing đa bề mặt, UX planning | Free, dữ liệu dày, real-time team, phù hợp thị trường châu Á | Social + động lực + phân tích hiệu suất |
| **Điểm yếu** | Nav backcountry kém hơn Gaia; giá Peak cao | Cộng đồng yếu; đường học UX dốc | Thị phần nhỏ, hệ sinh thái mỏng | Đổi giá gây phản ứng tiêu cực; không mạnh cộng đồng | Chủ yếu tiếng Trung, dữ liệu ngoài TQ thưa, không bản địa hóa VN/ĐNÁ | Không phải app nav/offline cho trekking |

> Ghi chú: giá là số công bố gần thời điểm khảo sát (2025–2026), thay đổi theo vùng & thời điểm; xác minh lại khi làm mô hình tài chính.

### 1.2 Nhận định từng đối thủ (rút gọn)

- **AllTrails** — vô địch về *discovery + cộng đồng*, đang đẩy mạnh AI (Community Heatmap, Trail Conditions, Outdoor Lens nhận diện cây/địa danh qua camera) ở tier Peak. Nav backcountry vẫn kém Gaia.
- **Gaia GPS** — chuẩn vàng về *bản đồ & offline & navigation*. Điểm POTTER cần bắt kịp về mặt kỹ thuật map (brief §6 lấy Gaia làm tham chiếu).
- **Astrail** — nhỏ, không tạo áp lực cạnh tranh; tham khảo UX là chính.
- **Komoot** — routing đa bề mặt tốt, nhưng cú đổi giá 3/2025 (bỏ mua region một lần, ép subscription) tạo *khoảng trống niềm tin* → bài học về mô hình giá.
- **两步路 (2bulu)** — hình mẫu UX của brief; mạnh ở *free + real-time team + feed cộng đồng*, nhưng dữ liệu ngoài Trung Quốc thưa và **không bản địa hóa Việt Nam/ĐNÁ** → đây là cửa cho POTTER.
- **Strava** — thống trị *social thể thao* nhưng không phải công cụ nav/offline cho trekking; là đối thủ gián tiếp về cộng đồng.

### 1.3 KHOẢNG TRỐNG THỊ TRƯỜNG cho POTTER

1. **Bản địa hóa Việt Nam & Đông Nam Á** — chưa app quốc tế nào có dữ liệu cung, tiếng Việt, mùa đẹp, cảnh báo địa phương chuẩn cho VN/ĐNÁ. 2bulu mạnh nhưng "đóng khung" thị trường Trung Quốc.
2. **Cung hướng dẫn có ẢNH thực địa điểm xuất phát** (brief §4) — không đối thủ nào giải bài toán "tìm đúng điểm bắt đầu" bằng ảnh mốc thực địa. Đây là *khác biệt hữu hình* cho người mới ở địa hình VN (đường mòn khó nhận, ít biển chỉ dẫn).
3. **Marketplace cung + support (bán cung kèm hướng dẫn)** — mô hình lai giữa AllTrails (nội dung cộng đồng) và nền tảng tour, chưa đối thủ nào làm mạnh.
4. **Hệ 3 cấp người dùng gắn với an toàn/pháp lý** (brief §5) — cấp 1 chỉ đi cung dễ, cung khó phải có người dẫn; đây vừa là tính năng *giảm rủi ro pháp lý* vừa là *rào cản khác biệt* mà app phương Tây (định hướng tự chịu trách nhiệm cá nhân) không có.

**Kết luận:** POTTER cạnh tranh bằng *bản địa hóa + an toàn có kiểm soát + marketplace cung có ảnh*, KHÔNG cạnh tranh trực diện về số lượng layer bản đồ toàn cầu (đó là sân của Gaia).

---

## 2. Khuyến nghị TECH STACK (mục quan trọng nhất)

> Ràng buộc đã chốt trong brief §2: **MapLibre GL + OSM**, tự host tile, routing GraphHopper hoặc OSRM. Phần dưới bám ràng buộc này.

### 2.1 App di động: React Native vs Flutter (cho app map-heavy)

| Tiêu chí | React Native (RN) | Flutter | Ghi chú cho POTTER |
|---|---|---|---|
| **SDK MapLibre chính thức** | `@maplibre/maplibre-react-native` — active, wrap MapLibre Native | `maplibre-gl` (flutter-maplibre) + `flutter-maplibre-gl` (fork mapbox) — MapLibre bảo trợ | Cả hai đều dùng chung lõi **MapLibre Native (C++)** → hiệu năng render lõi tương đương |
| **Render vector tile** | Native qua bridge; ổn định, có ca lỗi cấu hình (vd. GZIP) nhưng giải quyết được | Native; nếu vẽ marker/polyline bằng widget Flutter đồng bộ theo tile có thể **giật (platform view lag)** | POTTER cần **annotation/marker chạy trong layer native của MapLibre**, tránh overlay widget → giảm lag ở cả hai |
| **Hiệu năng UI tổng thể** | Tốt; JS bridge có overhead ở list/animation nặng | **Rendering riêng (Skia/Impeller), mượt hơn** ở UI phức tạp, 60/120fps ổn định | Feed ảnh (Tab 1) + list cung (Tab 2) nhiều item → Flutter nhỉnh hơn |
| **Offline map** | Được (offline pack qua MapLibre Native) | Được (tương đương) | Ngang nhau — do lõi giống nhau |
| **Background GPS tracking** | Có (`react-native-background-geolocation` — mạnh nhưng thư viện tốt là bản trả phí) | Có (`flutter_background_geolocation` — cùng tác giả, cũng trả phí; hoặc `geolocator`+`flutter_background_service`) | Đây là mắt xích **rủi ro** cho cả hai; ngân sách cho lib background-geo bản pro (~vài trăm USD/năm) nên tính trước |
| **Hệ sinh thái thư viện** | **Rộng nhất** (npm), nhiều dev JS, chia sẻ code với web React | Đủ & chất lượng cao, package pub.dev tốt, nhưng ít dev hơn ở VN | Nếu team thạo JS/web → RN; nếu ưu tiên UX mượt & 1 codebase kỷ luật → Flutter |
| **Tuyển dụng ở VN** | Nhiều dev RN/JS | Đang tăng nhanh, nhiều dev mobile trẻ | Cân nhắc theo team thực tế |

**KHUYẾN NGHỊ DỨT KHOÁT: Chọn Flutter.**

Lý do:
1. **UX mượt hơn cho app nhiều màn hình nặng** (feed ảnh, list cung, elevation profile vẽ tùy biến): rendering engine riêng của Flutter cho 60–120fps ổn định, ít phụ thuộc bridge.
2. **Vẽ tùy biến mạnh** — elevation profile (dốc đỏ/phẳng xanh, brief §6), badge cột mốc, thẻ cung custom: `CustomPainter` của Flutter làm nhanh, gọn, đồng nhất iOS/Android.
3. **Lõi map giống nhau** — vì cả hai đều dùng MapLibre Native, POTTER *không mất gì* về sức mạnh bản đồ khi chọn Flutter; điểm quyết định dồn về tầng UI, nơi Flutter thắng.
4. **1 codebase kỷ luật, ít mảnh vỡ nền tảng** → phù hợp giai đoạn spec→MVP với team gọn.

*Điều kiện đảo ngược:* nếu team hiện có **đã rất mạnh JS/React và muốn share code với một web app React**, thì RN là lựa chọn hợp lý hơn — khi đó chọn RN, không phải Flutter. Nhưng nếu team trung lập → **Flutter**.

> Quan trọng cho cả hai: đặt **marker/track/waypoint trong layer native của MapLibre** (SymbolLayer/LineLayer), **không** overlay bằng widget/View app-side → tránh lag đồng bộ khi pan/zoom.

### 2.2 Backend đề xuất

| Thành phần | Đề xuất | Lý do |
|---|---|---|
| **API** | **NestJS (Node/TypeScript)** hoặc **Go (Gin/Fiber)** | NestJS: dev nhanh, hệ sinh thái rộng, dễ tuyển; Go: hiệu năng cao, tốn ít RAM. Mặc định đề xuất **NestJS** cho tốc độ ra MVP |
| **DB chính + địa lý** | **PostgreSQL + PostGIS** | Chuẩn vàng cho dữ liệu địa lý: lưu track/route (LineString), waypoint (Point), truy vấn "cung gần tôi" (ST_DWithin), snap, bounding box. Bắt buộc cho POTTER |
| **Lưu GPX/KML** | File gốc trên **object storage (S3/MinIO)** + metadata + geometry đã parse trong PostGIS | Giữ file gốc để xuất/nhập lại (brief §6); geometry vào DB để truy vấn/hiển thị nhanh |
| **Ảnh (điểm xuất phát, feed)** | Object storage (S3/R2/MinIO) + CDN + tạo thumbnail | Ảnh thực địa điểm xuất phát (brief §4) và feed Tab 1 |
| **Đồng bộ web↔mobile** | REST + **sync theo timestamp/updated_at**, có thể thêm delta sync | Waypoint/route/folder đồng bộ 2 chiều (brief §6) |
| **Realtime chat (Tab 4) + vị trí đội** | **WebSocket** (Socket.IO/`ws`) hoặc dịch vụ (Ably/Pusher/self-host); vị trí real-time qua kênh riêng | Chat 1-1 & nhóm giữa người mua cung ↔ người bán/hướng dẫn; real-time team giống 2bulu |
| **Auth & phân quyền** | JWT + refresh, RBAC theo **3 cấp user** (brief §5) | Cấp 1/2/3 quyết định quyền mở cung, bán cung, chạy tour |
| **Thanh toán (mua cung)** | Cổng nội địa VN: **MoMo / ZaloPay / VNPay** + (tùy) Stripe cho quốc tế | Marketplace cung; lưu ý app store IAP nếu bán nội dung số trên iOS |
| **Hàng đợi/nền** | Redis + queue (BullMQ) | Xử lý ảnh, tính elevation, gửi thông báo |

**Sơ đồ tối giản:** App (Flutter) ⇄ API (NestJS) ⇄ PostGIS + Redis + Object Storage; Map tiles từ **tile server riêng**; Routing từ **GraphHopper service**; Realtime qua WebSocket.

### 2.3 Routing / Snap engine: GraphHopper vs OSRM

| Tiêu chí | OSRM | GraphHopper | Ý nghĩa cho POTTER |
|---|---|---|---|
| **Ngôn ngữ** | C++ | Java (JVM) | GH tốn RAM hơn (planet cần 8–16GB heap) |
| **Tốc độ A→B** | **Nhanh nhất** (~5–10ms) | ~10–30ms (cache còn 1–3ms) | Cả hai đủ nhanh cho tải một app; tốc độ không phải nút thắt |
| **Đổi profile / custom model** | Thay đổi profile phải **build lại graph** (nặng, kém linh hoạt) | **Custom model JSON**, đổi trọng số/tốc độ không cần rebuild toàn bộ | POTTER cần nhiều profile đi bộ (dễ/khó, tránh dốc, theo mùa) → **GH linh hoạt hơn hẳn** |
| **Hiking/foot & xe đạp** | Hỗ trợ, nhưng thế mạnh là ô tô/matrix lớn đồng nhất | **Thế mạnh ở foot/bike**, isochrone, elevation tích hợp | Trekking = foot-first → GH hợp mục tiêu |
| **Elevation** | Cần cấu hình thêm | **Tích hợp elevation** (SRTM…) sẵn | Brief cần tổng leo/elevation profile → GH tiện |
| **Snap-to-trail** | Có (nearest/match service) | Có (map matching) | Cả hai làm được; GH có map-matching tốt |
| **Isochrone/vùng tới được** | Không sẵn (cần tự làm) | **Có sẵn** | Hữu ích cho tính năng "đi được bao xa" tương lai |
| **Vận hành** | Nhẹ RAM, đơn giản nếu 1 profile | Nặng RAM hơn, nhưng linh hoạt vận hành | Với team JVM/Java, GH dễ tích hợp |

**KHUYẾN NGHỊ DỨT KHOÁT: Chọn GraphHopper.**

Lý do: POTTER là app **trekking đa cấp độ** cần *nhiều profile đi bộ khác nhau, tính elevation/tổng leo, isochrone, và điều chỉnh trọng số theo mùa/độ khó* — tất cả GraphHopper làm được bằng **custom model JSON không cần rebuild graph**, cộng elevation & map-matching tích hợp. OSRM nhanh hơn vài ms nhưng lợi thế đó vô nghĩa ở quy mô một app, trong khi việc phải rebuild graph mỗi lần đổi profile là bất lợi lớn cho lộ trình sản phẩm. Chỉ nên cân nhắc OSRM nếu sau này cần **ma trận khoảng cách khổng lồ, một loại phương tiện, tối ưu độ trễ tuyệt đối** (không phải bài toán của POTTER).

### 2.4 Hạ tầng tile OSM: tự host vs dịch vụ

| Phương án | Mô tả | Chi phí ước lượng | Khi nào chọn |
|---|---|---|---|
| **Tự host (khuyến nghị theo brief)** | Planetiler sinh vector tile (.pmtiles/.mbtiles) từ OSM → phục vụ bằng tileserver-gl / martin / pmtiles trên CDN | **~20 USD/tháng** (1 VPS nhỏ) ở quy mô khởi đầu; cộng đồng có case ~2 USD/tháng | MVP, kiểm soát chi phí, dữ liệu VN/ĐNÁ (extract vùng nhỏ → rẻ) |
| **Dịch vụ (MapTiler/Stadia/Protomaps)** | Trả theo lượt tải tile / thuê bao | Free tier nhỏ → tăng theo MAU; đắt dần khi scale | Prototype cực nhanh, hoặc chưa muốn lo DevOps |
| **Lai (khuyến nghị khi scale)** | Tự sinh tile + đặt sau **CDN (Cloudflare/CloudFront)**; dùng định dạng **PMTiles** (1 file, serve tĩnh, không cần server render) | VPS + phí CDN theo băng thông (thường thấp vì tile cache tốt) | Khi MAU tăng, tối ưu chi phí/độ trễ |

**Khuyến nghị:** Bắt đầu **tự host với Planetiler + PMTiles sau CDN**, chỉ extract **Việt Nam + ĐNÁ** (nhỏ hơn planet rất nhiều → build nhanh, rẻ, tile nhẹ để tải offline). Chỉ mở rộng ra planet khi thị trường mở rộng.

**Ước lượng chi phí sơ bộ theo quy mô (tham khảo, cần verify):**

| Quy mô | Tile (vector, self-host) | Routing (GraphHopper) | DB/API | Ghi chú |
|---|---|---|---|---|
| **MVP (< 5k MAU)** | 1 VPS ~20 USD/th + CDN vài USD | 1 VPS 8–16GB RAM ~40–80 USD/th | DB managed nhỏ ~25–50 USD/th | Extract vùng VN/ĐNÁ |
| **Tăng trưởng (50k MAU)** | PMTiles + CDN ~50–150 USD/th (băng thông) | 1–2 instance ~150 USD/th | DB + Redis + storage ~200–400 USD/th | Thêm cache |
| **Lớn (500k+ MAU)** | CDN theo băng thông (có thể vài trăm–nghìn USD/th) | Cụm auto-scale | Cụm DB, read-replica | Xem lại kiến trúc |

> **Ảnh vệ tinh** KHÔNG nằm trong chi phí OSM tile: phải mua riêng (Mapbox Satellite/MapTiler/ESRI/Bing) — chi phí theo lượt xem, có thể lớn. Cân nhắc coi satellite là **tính năng Premium** (brief §6) để kiểm soát chi phí.

---

## 2b. RÀNG BUỘC "BẢN ĐỒ THẬT" — nguồn dữ liệu thật (ưu tiên cao)

> User yêu cầu: **bản đồ phải THẬT, không fake**. Mục này chốt nguồn dữ liệu thật, có thể kiểm chứng, cho từng lớp.

### 2b.1 Nguồn TILE OSM thật: tự host vs dịch vụ (so sánh chi phí thật)

Toàn bộ tile lấy từ **dữ liệu OpenStreetMap thật** (planet.openstreetmap.org, cập nhật hàng ngày). Khác biệt là *ai render & phục vụ*.

**Pipeline tự host thật (khuyến nghị):**
1. Tải extract OSM **Việt Nam / Đông Nam Á** từ **Geofabrik** (`vietnam-latest.osm.pbf`, ~vài trăm MB — nhỏ, build nhanh).
2. Sinh vector tile bằng **Planetiler** (nhanh nhất, chạy 1 máy; schema OpenMapTiles) hoặc **Tilemaker** (nhẹ RAM, cấu hình linh hoạt).
3. Xuất **PMTiles** (1 file, serve tĩnh trên S3/R2/CDN, không cần server render) hoặc **MBTiles** (SQLite, cần tileserver-gl/martin).
4. Render client bằng MapLibre GL + style OSM mã nguồn mở (OpenMapTiles/Positron/Liberty hoặc tự làm).

| Phương án | Nguồn thật | Chi phí thật (ước lượng) | Ưu | Nhược |
|---|---|---|---|---|
| **Tự host — Planetiler + PMTiles + CDN** | OSM Geofabrik VN/ĐNÁ | VPS build ~20 USD/th + CDN băng thông (thấp, cache tốt); riêng VN vector ~vài trăm MB–1GB | Rẻ nhất khi scale, kiểm soát hoàn toàn, offline dễ | Cần DevOps, tự cập nhật dữ liệu định kỳ |
| **MapTiler Cloud** | OSM (họ render) | Free ~100k tile/th; trả phí theo lượt tải/MAU, tăng nhanh khi đông user | Nhanh triển khai, có satellite bán kèm | Đắt dần theo lượt, phụ thuộc bên thứ 3 |
| **Stadia Maps** | OSM | Free tier nhỏ; gói theo request/MAU | Dễ, có style đẹp | Chi phí theo lượt |
| **Protomaps** | OSM | **Bản build PMTiles công khai gần như miễn phí** (chỉ trả hosting/CDN của bạn) | Rất rẻ, hợp offline, đúng tinh thần tự host | Cập nhật/schema tự lo |

**Ước lượng cho quy mô VN:** vì chỉ cần extract VN/ĐNÁ (không cần planet), build tile rất rẻ. **Khuyến nghị: Protomaps/Planetiler → PMTiles → Cloudflare R2 + CDN.** Ở MVP thực tế chi phí tile có thể **< 30 USD/tháng**. Dùng MapTiler chỉ khi cần satellite hoặc muốn bỏ qua DevOps giai đoạn đầu.

### 2b.2 Dữ liệu TRAIL thật cho Việt Nam — có đủ không?

**Thực trạng:** OSM ở VN phủ **tốt cho đường ô tô/đường phố**, nhưng **đường mòn trekking (`highway=path/footway`, `sac_scale`, route `hiking`) THƯA và không đồng đều** — nhiều cung núi nổi tiếng (Tà Xùa, Lảo Thẩn, Bạch Mộc…) có thể thiếu hoặc chỉ có một phần. OSM là "niche topic": chất lượng thay đổi mạnh theo vùng, **không được tin tưởng mù quáng**. Có thể đối chiếu nhanh qua **Waymarked Trails (hiking)** để thấy độ phủ route hiking thực tế ở VN còn mỏng.

**Hệ quả kiến trúc — KHÔNG phụ thuộc OSM cho hình học cung:**

| Lớp dữ liệu | Nguồn thật | Vai trò |
|---|---|---|
| **Bản đồ NỀN (base)** | OSM tile (§2b.1) | Nền topo/đường — hiển thị, không phải nguồn cung |
| **Hình học CUNG (trail geometry)** | **GPX do user Cấp 2 upload** (brief §5) + GPX admin số hóa thực địa | **Nguồn sự thật chính** cho track cung — đây là "trail thật" của POTTER |
| **Snap-to-trail** | Snap vào **track GPX của cung** (không snap vào OSM path) | Đảm bảo đi đúng cung đã mua, kể cả khi OSM thiếu đường |
| **Routing tới điểm xuất phát** | GraphHopper trên OSM (đường có phủ tốt) | Dẫn từ vị trí user → điểm bắt đầu cung |

> Đây là điểm mấu chốt: POTTER **không fake** đường bằng cách vẽ tay tùy tiện; cung được định nghĩa bằng **GPX thật ghi ngoài thực địa** (do người Cấp 2/tổ chức đóng góp), đối chiếu ảnh điểm xuất phát (brief §4). OSM chỉ làm *nền* và *routing tiếp cận*. Nên có quy trình **kiểm duyệt GPX** (loại nhiễu GPS, kiểm tra độ dài/độ cao hợp lý) trước khi cung lên marketplace.

**Đóng góp ngược (khuyến khích):** cung chất lượng cao có thể được biên tập viên đóng góp lại vào OSM để làm giàu dữ liệu — nhưng cẩn trọng license (không import dữ liệu có bản quyền khác vào OSM).

### 2b.3 Routing engine thật trên OSM thật

- **GraphHopper** (khuyến nghị, §2.3) và **OSRM** đều build graph trực tiếp từ **OSM .pbf thật** (Geofabrik VN/ĐNÁ).
- **Hiking profile thật:** GraphHopper có profile `foot`/`hike` sẵn, cân nhắc `sac_scale`, và **custom model JSON** để thêm quy tắc theo độ khó/mùa.
- **Offline routing:** brief §6 yêu cầu "route offline". Cách thật: đóng gói **GraphHopper graph theo vùng** hoặc dùng snap/route on-device dựa trên **track GPX của cung đã tải offline** (cho việc đi cung); routing tiếp cận điểm xuất phát cần graph vùng đã tải. Cần xác nhận: GraphHopper server-side là chính; on-device chủ yếu **snap-to-GPX** (nhẹ, chạy offline tốt).

### 2b.4 Nguồn DEM/độ cao thật (elevation/độ dốc)

Elevation profile (dốc đỏ/phẳng xanh, tổng leo) phải tính từ **DEM thật**, không nội suy bừa.

| Nguồn DEM | Độ phân giải | License | Khuyến nghị |
|---|---|---|---|
| **Copernicus DEM GLO-30** | 30m toàn cầu | **Free** (AWS Open Data, OpenTopography, GEE); Cloud-Optimized GeoTIFF | **Ưu tiên** — mới hơn, chất lượng tốt hơn SRTM |
| **SRTM 30m (SRTMGL1)** | 30m (tới ~60°N/S) | Free (NASA) | Phương án dự phòng/đối chiếu |
| (Tùy chọn) DEM địa phương VN | tốt hơn nếu có | tùy nguồn | Nếu mua/xin được, tăng độ chính xác vùng núi |

**Cách dùng thật:** tải tile Copernicus GLO-30 cho VN → lưu dạng COG/terrain-RGB; **GraphHopper** có thể nạp trực tiếp DEM để gán elevation cho từng đỉnh graph; với GPX cung, sample độ cao dọc track từ DEM để dựng elevation profile & tính tổng leo. Có thể phục vụ **terrain-RGB tile** cho MapLibre để hiển thị hillshade/3D.

### 2b.5 Thư viện MapLibre THẬT — mức trưởng thành cho app map-heavy + offline

| | RN: `@maplibre/maplibre-react-native` | Flutter: `maplibre_gl` / `flutter-maplibre-gl` |
|---|---|---|
| **Bảo trợ** | Cộng đồng MapLibre (kế thừa rnmapbox) | Tổ chức MapLibre (fork từ flutter-mapbox-gl) |
| **Lõi** | MapLibre Native (C++) | MapLibre Native (C++) |
| **Offline pack** | Có API offline (download region, layer) — **trưởng thành** | Có, nhưng API/ổn định **kém đều hơn** ở một số phiên bản |
| **Vector tile/style** | Ổn định, dùng rộng | Ổn định lõi; **overlay marker bằng widget dễ lag** (platform view) |
| **Mức trưởng thành thực tế** | **Cao** — nhiều app production, tài liệu tốt | Khá; đang cải thiện mạnh 2025–2026; cần khóa version cẩn thận |
| **Kết luận** | Rất chắc chắn cho map + offline | Đủ tốt nếu giữ marker/track trong **layer native**, khóa version |

> **Điều chỉnh khuyến nghị stack (quan trọng):** xét riêng tiêu chí *bản đồ + offline trưởng thành*, **MapLibre trên RN hiện nhỉnh hơn về độ chín và API offline**. Vì vậy cân bằng lại kết luận §2.1:
> - Nếu **ưu tiên độ chắc chắn của map/offline và team thạo JS** → **React Native + @maplibre/maplibre-react-native**.
> - Nếu **ưu tiên UX tổng thể mượt & vẽ tùy biến (elevation, feed)** và chấp nhận khóa version map lib → **Flutter + maplibre_gl** (đặt marker/track trong layer native để tránh lag).
>
> Cả hai đều dùng chung lõi MapLibre Native nên *sức mạnh render bản đồ tương đương*; quyết định cuối phụ thuộc **năng lực team** — đề nghị user chốt (xem §4 mục 4).

---

## 3. Rủi ro & lưu ý pháp lý/kỹ thuật

| Nhóm | Rủi ro | Mức | Giảm thiểu |
|---|---|---|---|
| **License OSM/tile** | OSM data theo **ODbL** (share-alike + attribution bắt buộc). Phải hiển thị **"© OpenStreetMap contributors"** ở mọi màn có bản đồ | Cao (bắt buộc) | Nhúng attribution cố định; nếu phân phối lại *dữ liệu dẫn xuất* (không chỉ tile ảnh) phải giữ ODbL |
| **Ảnh vệ tinh** | Không miễn phí; mỗi provider có điều khoản riêng, cấm cache/offline tùy hợp đồng | Cao | Mua đúng gói; đọc kỹ điều khoản offline/caching; coi là Premium |
| **Style/sprite/font** | Một số style/asset có license riêng | Trung bình | Dùng style mã nguồn mở hoặc tự làm |
| **Dữ liệu vị trí người dùng** | GPS là dữ liệu cá nhân nhạy cảm; VN có **Nghị định 13/2023 về bảo vệ dữ liệu cá nhân (PDPD)**; nếu có người dùng EU → GDPR | Cao | Chính sách quyền riêng tư rõ; xin **consent** cho tracking nền; mã hóa; cho phép xóa dữ liệu; không đặt vị trí trong URL/query |
| **Background GPS** | iOS/Android siết quyền chạy nền; app có thể bị từ chối lên store nếu justification yếu | Cao | Khai báo mục đích rõ; UX xin quyền đúng lúc; test kỹ battery |
| **Chi phí scale** | CDN băng thông tile + ảnh vệ tinh + routing tăng phi tuyến theo MAU | Trung bình–Cao | PMTiles + CDN cache; giới hạn offline/satellite theo Premium; giám sát chi phí |
| **An toàn & trách nhiệm** | User đi cung khó gặp nạn → rủi ro pháp lý cho nền tảng | Cao (cốt lõi) | Hệ 3 cấp (brief §5), disclaimer/miễn trừ, bắt buộc hướng dẫn với cung khó, SOS/chia sẻ vị trí |
| **Marketplace/thanh toán** | Bán nội dung số trên iOS có thể buộc dùng IAP (phí 15–30%); trách nhiệm với giao dịch mua cung | Trung bình | Tư vấn điều khoản App Store/Play; hợp đồng người bán cung rõ ràng |
| **Bản đồ khu vực nhạy cảm** | VN có quy định về bản đồ/biên giới; hiển thị sai có thể vi phạm | Trung bình–Cao | Rà soát dữ liệu biên giới; tham vấn pháp lý địa phương |

---

## 4. Rủi ro & đề xuất (đề xuất đổi quyết định — KHÔNG tự đổi)

Các quyết định trong brief §2 (**MapLibre + OSM, tự host tile, GraphHopper/OSRM**) đều **hợp lý và được R&D ủng hộ**. Không đề xuất đảo ngược quyết định lớn nào. Một số điểm nhỏ đề nghị user cân nhắc/xác nhận:

1. **Ảnh vệ tinh không miễn phí** — brief §6 liệt kê layer "vệ tinh" ngang topo. Đề nghị chấp nhận rằng satellite phải **mua provider** và nên đặt sau **paywall Premium**; nếu không, chi phí có thể vượt ngân sách sớm. (Đây là làm rõ, không phải đổi quyết định.)
2. **Định dạng PMTiles cho tile** — brief nói "tự host tile" chung chung; đề nghị *chốt PMTiles + CDN* thay vì server render động, để rẻ và đơn giản vận hành. Cần user xác nhận.
3. **Thư viện background-geolocation tốt thường trả phí** — đề nghị duyệt một khoản ngân sách nhỏ (vài trăm USD/năm) cho lib pro thay vì tự viết (rủi ro battery/độ ổn định cao).
4. **Về stack app (cần user chốt):** brief để mở RN vs Flutter. Xét *UX tổng thể* → Flutter nhỉnh; xét *độ trưởng thành map/offline của MapLibre* → RN nhỉnh (§2b.5). Đề nghị: **team thạo JS/muốn share web → RN + @maplibre/maplibre-react-native; team ưu tiên UX mượt & vẽ tùy biến → Flutter + maplibre_gl.** Cần user xác nhận hướng team trước khi Code khởi tạo repo.
6. **Dữ liệu trail VN thưa trên OSM** — POTTER phải dựa **GPX thật do Cấp 2 upload** làm nguồn cung, kèm quy trình kiểm duyệt GPX. Đề nghị user xác nhận mô hình này (đã phản ánh trong brief §5).
5. **Ảnh vệ tinh & offline** có thể xung đột điều khoản provider (một số cấm cache offline). Nếu offline-satellite là bắt buộc, cần chọn provider cho phép (thường gói đắt hơn).

---

## Nguồn tham khảo chính

- MapLibre RN/Flutter: [MapLibre News](https://maplibre.org/news/), [flutter-maplibre-gl](https://github.com/maplibre/flutter-maplibre-gl), [MapLibre React Native SDK](https://madewithmaplibre.com/sdks/maplibre-react-native/)
- Routing: [Mapsi — OSRM vs Valhalla vs GraphHopper](https://mapsi.dev/developers/routing-engine-comparison), [Pi Stack 2026](https://www.pistack.xyz/posts/2026-04-25-graphhopper-vs-osrm-vs-valhalla-self-hosted-routing-engines-guide-2026/)
- Tile self-host: [OpenMapTiles server $19.75/mo](https://www.openstreetmap.org/user/ZeLonewolf/diary/401697), [OpenMapTiles](https://openmaptiles.org/), [MapTiler vs TileServer GL](https://docs.maptiler.com/guides/self-hosting/map-server/maptiler-server-and-tileserver-gl-compared/)
- Trail VN & DEM: [Waymarked Trails — Hiking](https://hiking.waymarkedtrails.org/), [OSM Wiki — Hiking](https://wiki.openstreetmap.org/wiki/Hiking), [Copernicus DEM GLO-30 (AWS Open Data)](https://registry.opendata.aws/copernicus-dem/), [OpenTopography GLO-30](https://portal.opentopography.org/raster?opentopoID=OTSDEM.032021.4326.3)
- Đối thủ & giá: [besthike — AllTrails v Gaia v Komoot](https://besthike.com/2025/12/05/hiking-navigation-alltrails-v-gaia-v-komoot/), [Komoot pricing guide](https://komoot-kosten.pages.dev/blog/komoot-pricing-guide-free-region-map-packs-premium-plans), [TechRadar — AllTrails AI tier](https://www.techradar.com/health-fitness/fitness-apps/alltrails-is-the-latest-app-with-an-ai-powered-subscription-tier-but-it-looks-way-more-useful-than-the-genai-from-garmin-and-strava), [2bulu/AllTracks](https://mwm.ai/apps/liang-bu-lu-hu-wai-zhu-shou-ji-lu-hu-wai-jing-cai-sheng-huo/646277024)

> Số liệu giá và chi phí mang tính tham khảo tại thời điểm khảo sát; cần xác minh lại trước khi đưa vào mô hình tài chính chính thức.
