# POTTER 3.0 — Hệ phân cấp người dùng & Thang điểm uy tín

> Agent phụ trách: **LUẬT NGƯỜI DÙNG & THANG ĐIỂM**
> Nguồn ngữ cảnh: [[00-brief]] (đặc biệt mục 5).
> Ngôn ngữ: Tiếng Việt (thuật ngữ kỹ thuật giữ nguyên tiếng Anh).
>
> **Mục tiêu cốt lõi:** Chia người dùng thành 3 cấp nhằm **GIẢM RỦI RO PHÁP LÝ** cho nền tảng.
> Nguyên tắc: POTTER là **nền tảng kết nối & công cụ bản đồ**, KHÔNG phải đơn vị lữ hành,
> KHÔNG đi thay/dẫn thay người dùng, và KHÔNG chịu trách nhiệm thay khi người dùng tự ý đi cung nguy hiểm.
> Hệ phân cấp + waiver + phân định trách nhiệm là lớp phòng vệ pháp lý chính.

---

## 0. Tổng quan nhanh

| Cấp | Tên | Vai trò chính | Điều kiện đạt |
|-----|-----|---------------|----------------|
| **Cấp 1** | Mới (Newbie) | Người đi cung, chỉ tiêu dùng | Đăng ký tài khoản, xác minh email/SĐT |
| **Cấp 2** | Có kinh nghiệm (Verified Leader) | Tự mở cung, bán cung kèm support, hướng dẫn cấp 1 | Đủ điểm uy tín + xác minh danh tính (KYC) + đóng góp GPX/lịch sử |
| **Cấp 3** | Doanh nghiệp/Tổ chức (Operator) | Chạy tour, quản lý đoàn, xuất hoá đơn | Pháp nhân + giấy phép lữ hành + hợp đồng |

**Trục phân cấp về độ khó cung** (đồng bộ với [[02-routes]] nếu có): `DỄ (Easy) → CHUẨN (Moderate) → KHÓ (Hard) → CỰC KHÓ (Expert)`.

---

## 1. Định nghĩa 3 cấp (quyền & giới hạn)

### 1.1. Cấp 1 — Mới (Newbie)

**Đối tượng:** Người mới cài app, chưa có/ít lịch sử hoạt động.

**Được phép:**
- Xem toàn bộ danh mục cung (kể cả cung khó — chỉ để tham khảo/tìm hiểu).
- Đặt & tự đi các cung **DỄ (Easy)** một mình.
- Đặt cung **CHUẨN/KHÓ/CỰC KHÓ** **CHỈ KHI** có người hướng dẫn (cấp 2/3) đi kèm trong booking.
- Mạng xã hội (Tab 1), chat support (Tab 4), lưu waypoint cá nhân.

**Bị giới hạn (app enforce cứng):**
- **KHÔNG** được bắt đầu điều hướng (navigation) một cung có `difficulty ≥ Moderate` nếu **không** gắn với một `guide_id` hợp lệ (một tài khoản cấp 2/3 đã nhận dẫn cung đó).
- **KHÔNG** được mở cung mới, không được bán cung, không tạo tour.

**App enforce như thế nào (bắt buộc, agent Code triển khai):**
1. **Chặn ở tầng đặt cung (booking):** Khi cấp 1 chọn cung có `difficulty ≥ Moderate`, nút "Đi ngay" bị **disable**; chỉ bật nút "Tìm người hướng dẫn" → luồng ghép guide cấp 2/3.
2. **Chặn ở tầng điều hướng (Tab 3 — Map):** Trước khi cho phép `startNavigation(routeId)`, backend kiểm tra:
   ```
   if user.tier == 1 and route.difficulty >= MODERATE and booking.guide_id == null:
       reject("Cung này yêu cầu người hướng dẫn đi kèm")
   ```
   → App **không snap/không dẫn đường**, hiển thị màn cảnh báo + gợi ý ghép guide hoặc chọn cung dễ hơn.
3. **Chặn ở tầng tải offline:** Gói offline cho cung khó chỉ mở khi booking đã có guide (tránh lách bằng cách đi offline).
4. **Ghi log & waiver:** Mọi lần cấp 1 cố mở cung khó đều log lại; nếu vượt qua (có guide) vẫn phải ký waiver (mục 4).

> **Lưu ý enforce có giới hạn:** App chỉ chặn được trong-app (booking, snap, dẫn đường, offline). App **không thể** ngăn người dùng tự đi ngoài thực địa bằng thiết bị khác. Đây là lý do waiver + disclaimer (mục 4) là **bắt buộc**, không thể thay bằng enforce kỹ thuật.

### 1.2. Cấp 2 — Có kinh nghiệm (Verified Leader)

**Điều kiện đạt (tất cả bắt buộc):**
- Đạt **ngưỡng điểm uy tín** (mục 2).
- **Xác minh danh tính (KYC):** CCCD/hộ chiếu + ảnh chân dung (liveness). Bắt buộc để gán trách nhiệm pháp lý.
- **Đóng góp dữ liệu:** cung cấp đủ **GPX** cho các cung định mở/bán + có **lịch sử hoạt động** thực (track đã đi trong app).
- Chấp nhận **"Điều khoản người dẫn cung"** (trách nhiệm với người đi cùng).

**Được phép (thêm so với cấp 1):**
- **Tự MỞ cung riêng:** vẽ route + snap-to-trail (theo [[03-map-spec]] nếu có), gắn ảnh điểm xuất phát (bắt buộc theo brief mục 4), mô tả, độ khó, cảnh báo.
- **BÁN cung kèm support:** đặt giá, nhận booking, chat support (Tab 4), cam kết SLA hỗ trợ.
- **Hướng dẫn/đi kèm cấp 1** trên cung khó (đóng vai `guide_id`).
- Đi mọi độ khó **một mình** (tự chịu trách nhiệm, vẫn phải ký waiver theo độ khó).

**Giới hạn:**
- Chưa được xuất hoá đơn tổ chức, chưa chạy "tour" nhiều ngày/đoàn đông (đó là cấp 3).
- Cung do cấp 2 mở phải qua **kiểm duyệt** (ít nhất: hợp lệ GPX, không trùng vùng cấm) trước khi công khai/bán.

### 1.3. Cấp 3 — Doanh nghiệp/Tổ chức/Tour (Operator)

**Điều kiện đạt:**
- **Pháp nhân** (doanh nghiệp/hộ kinh doanh) + **Giấy phép kinh doanh dịch vụ lữ hành** (nội địa/quốc tế theo phạm vi — xem mục 4).
- Ký **hợp đồng hợp tác** với POTTER; cung cấp thông tin thuế/hoá đơn.
- (Khuyến nghị) Có **bảo hiểm trách nhiệm** cho khách tham gia tour.

**Được phép (thêm so với cấp 2):**
- **Tài khoản tổ chức:** nhiều nhân sự (guide) dưới một pháp nhân, phân quyền nội bộ.
- **Quản lý đoàn:** danh sách khách, phân công guide, theo dõi vị trí đoàn real-time (theo quy định dữ liệu vị trí — mục 4).
- **Chạy tour:** gói nhiều ngày/nhiều cung, lịch trình, điểm hẹn.
- **Xuất hoá đơn (VAT)** cho khách; đối soát doanh thu với POTTER.

**Giới hạn:**
- Chịu **toàn bộ nghĩa vụ tuân thủ luật lữ hành** đối với tour do mình bán; POTTER chỉ là kênh phân phối/công cụ.

---

## 2. Tiêu chí & thang điểm thăng cấp

### 2.1. Thang điểm uy tín (Reputation Score)

Điểm tổng là tổng trọng số các yếu tố. Thang tham chiếu **0–1000**.

| Yếu tố | Cách tính | Trọng số | Điểm tối đa |
|--------|-----------|----------|-------------|
| Số cung hoàn thành | 15đ/cung (đã đi trọn, có track hợp lệ) | Cao | 300 |
| Tổng quãng đường (km) | 1đ/5km, trần 200 | Trung bình | 200 |
| Tổng leo tích luỹ (m) | 1đ/50m leo, trần 150 | Trung bình | 150 |
| Đánh giá từ người đi cùng | Trung bình sao ×20 (5★ = 100), cần ≥5 lượt | Cao | 100 |
| Xác minh danh tính (KYC) | Đạt = 100, chưa = 0 | Cổng bắt buộc cấp 2 | 100 |
| Chứng chỉ (nếu có) | Sơ cấp cứu WFR/WFA, chứng chỉ leo núi… 25đ/cc | Cộng thêm | 100 |
| Đóng góp GPX được duyệt | 10đ/GPX được kiểm duyệt & công khai | Cộng thêm | 50 |
| **Trừ điểm vi phạm** | Xem 2.3 | — | (âm) |

> Con số trên là **đề xuất khởi điểm**, cần A/B & điều chỉnh theo dữ liệu thực tế.

### 2.2. Ngưỡng thăng cấp

| Chuyển cấp | Điều kiện điểm | Điều kiện cứng (gate) |
|------------|----------------|------------------------|
| **1 → 2** | Reputation ≥ **450** | KYC đạt **+** ≥ 10 cung hoàn thành **+** đã nộp ≥ 1 GPX được duyệt **+** rating TB ≥ 4.0 (nếu đã có ≥5 lượt) |
| **2 → 3** | Không xét bằng điểm cá nhân | Pháp nhân + giấy phép lữ hành + hợp đồng + (khuyến nghị) bảo hiểm |

- Cấp 1→2: **tự động đề xuất** khi đủ ngưỡng, nhưng phải qua **duyệt thủ công/bán tự động** (chống gian lận track).
- Cấp 2→3: **luôn thủ công** (xét hồ sơ pháp lý), không tự động.

### 2.3. Cơ chế xuống cấp / khoá

| Vi phạm | Trừ điểm / Hành động |
|---------|----------------------|
| Track giả/gian lận (spoof GPS) | −200 & cảnh cáo; tái phạm → khoá |
| Đánh giá TB tụt < 3.0 (≥10 lượt) | Đóng băng quyền bán cung tới khi cải thiện |
| Mở cung sai lệch/nguy hiểm không cảnh báo | Gỡ cung + −100; tái phạm → giáng cấp |
| Khiếu nại có căn cứ từ người đi cùng | Điều tra; nếu đúng → giáng cấp/khoá |
| Bán tour không phép (mạo cấp 3) | **Khoá tài khoản** + báo cáo cơ quan chức năng nếu cần |
| Không hoạt động > 12 tháng | Đóng băng quyền cấp 2 (không giáng vĩnh viễn), mở lại khi hoạt động lại |

**Nguyên tắc giáng cấp:** Nếu Reputation tụt dưới ngưỡng duy trì (đề xuất: dưới **350** với cấp 2) trong **2 kỳ đánh giá liên tiếp** → tự động giáng về cấp 1, thu hồi quyền mở/bán cung. Cấp 3 bị thu hồi khi mất/hết hạn giấy phép lữ hành.

---

## 3. Ma trận phân quyền (Hành động × Cấp)

| Hành động | Cấp 1 (Mới) | Cấp 2 (Kinh nghiệm) | Cấp 3 (Tổ chức) |
|-----------|:-----------:|:-------------------:|:---------------:|
| Xem danh mục cung khó (tham khảo) | ✅ | ✅ | ✅ |
| Đặt & đi cung DỄ (một mình) | ✅ | ✅ | ✅ |
| Đi cung CHUẨN/KHÓ/CỰC KHÓ (một mình) | ❌ | ✅ (ký waiver) | ✅ (ký waiver) |
| Đi cung khó **có guide đi kèm** | ✅ (bắt buộc có guide) | ✅ | ✅ |
| Bắt đầu navigation/snap cung khó | ❌ nếu không có guide | ✅ | ✅ |
| Tải gói offline cung khó | ❌ nếu không có guide | ✅ | ✅ |
| Lưu waypoint / xuất-nhập GPX cá nhân | ✅ | ✅ | ✅ |
| **Mở cung mới** (vẽ + snap) | ❌ | ✅ (qua kiểm duyệt) | ✅ |
| **Bán cung** kèm support | ❌ | ✅ | ✅ |
| Đóng vai **guide** dẫn cấp 1 | ❌ | ✅ | ✅ |
| Chat support với người mua | Nhận (khách) | ✅ (người bán) | ✅ |
| **Tạo tour** nhiều ngày/đoàn | ❌ | ❌ | ✅ |
| Quản lý đoàn / nhiều guide | ❌ | ❌ | ✅ |
| **Xuất hoá đơn (VAT)** | ❌ | ❌ | ✅ |
| Quản trị nhân sự tổ chức | ❌ | ❌ | ✅ |

> Quy ước: ✅ = được phép; ❌ = app chặn cứng; ghi chú trong ngoặc là điều kiện kèm theo.

---

## 4. Khung pháp lý & Disclaimer

> ⚠️ **Miễn trừ:** Toàn bộ mục này là **đề xuất khung**, mang tính định hướng để agent Code dựng luồng.
> **KHÔNG phải tư vấn pháp lý chính thức.** Trước khi phát hành, **BẮT BUỘC** có luật sư/chuyên gia pháp chế
> Việt Nam rà soát và chuẩn hoá câu chữ waiver, điều khoản, hợp đồng.

### 4.1. Waiver / Miễn trừ trách nhiệm (bắt buộc trước cung khó)

Trước khi bắt đầu bất kỳ cung có `difficulty ≥ Moderate` (kể cả cấp 2/3 tự đi), người dùng **phải xác nhận waiver điện tử** gồm các điểm:
- Xác nhận **tự nguyện** tham gia hoạt động **có rủi ro cao** (chấn thương, lạc, thời tiết, địa hình nguy hiểm, thậm chí tử vong).
- Xác nhận **đủ điều kiện thể chất** và **đủ thiết bị** cần thiết (mục 4.3).
- Chấp nhận rằng **POTTER chỉ cung cấp công cụ bản đồ & thông tin tham khảo**, không đảm bảo an toàn tuyệt đối, không chịu trách nhiệm cho quyết định đi cung của người dùng.
- Đồng ý **tự chịu trách nhiệm** và (trong giới hạn luật cho phép) **miễn trừ trách nhiệm** cho POTTER với thiệt hại phát sinh từ hành vi tự nguyện của mình.

**Yêu cầu kỹ thuật:** Lưu bản ghi waiver (user_id, route_id, difficulty, timestamp, version điều khoản, IP/thiết bị) làm **bằng chứng đồng thuận**. Không có bản ghi → app không cho bắt đầu điều hướng.

### 4.2. Phân định trách nhiệm 3 bên

| Bên | Vai trò | Chịu trách nhiệm về | KHÔNG chịu trách nhiệm về |
|-----|---------|----------------------|----------------------------|
| **POTTER (nền tảng)** | Công cụ bản đồ, kênh kết nối, lưu trữ dữ liệu | Hoạt động đúng của công cụ; kiểm duyệt cơ bản nội dung cung; bảo mật dữ liệu | Quyết định đi cung của user; hành vi của guide/tổ chức; tai nạn thực địa |
| **Người bán/hướng dẫn (cấp 2/3)** | Cung cấp cung, dẫn đường, support | Tính chính xác GPX & cảnh báo mình đăng; chất lượng dẫn cung; cam kết support | — |
| **Người đi (mọi cấp)** | Tự quyết tham gia | Đánh giá năng lực bản thân; tuân thủ cảnh báo; chuẩn bị thể chất/thiết bị | — |

**Ranh giới then chốt (bảo vệ nền tảng):** POTTER **không** là bên tổ chức chuyến đi và **không** thuê guide làm nhân viên. Guide/tổ chức là **bên độc lập** dùng nền tảng để cung cấp dịch vụ. Điều này phải nêu rõ trong Điều khoản sử dụng để tránh POTTER bị coi là đơn vị lữ hành.

### 4.3. Cảnh báo rủi ro theo độ khó & Checklist điều kiện

App hiển thị **cảnh báo phân tầng** trước khi đặt/đi:

| Độ khó | Mức cảnh báo | Yêu cầu trước khi đi |
|--------|--------------|----------------------|
| DỄ | Nhẹ | Xác nhận đã đọc thông tin cung |
| CHUẨN | Trung bình | Waiver + xác nhận thể chất cơ bản |
| KHÓ | Cao | Waiver + checklist thiết bị + (cấp 1: bắt buộc guide) |
| CỰC KHÓ | Rất cao | Waiver + checklist thiết bị đầy đủ + chứng nhận kinh nghiệm/guide + xác nhận thời tiết |

**Checklist xác nhận (bắt buộc tick trước cung KHÓ/CỰC KHÓ):**
- [ ] Đủ sức khoẻ, không có bệnh lý cấm gắng sức.
- [ ] Đủ nước/thức ăn/dự phòng theo thời lượng cung.
- [ ] Thiết bị: giày phù hợp, đèn, áo mưa/giữ ấm, sạc dự phòng, bộ sơ cứu.
- [ ] Đã tải **bản đồ offline** (đề phòng mất sóng).
- [ ] Đã báo lịch trình cho người thân/ liên hệ khẩn cấp.

### 4.4. Lưu ý luật Việt Nam liên quan (cần luật sư xác nhận)

- **Kinh doanh lữ hành:** Bán tour/dịch vụ lữ hành cần **giấy phép kinh doanh dịch vụ lữ hành** (theo Luật Du lịch 2017) — chỉ **cấp 3** được làm. Cần làm rõ ranh giới giữa "bán cung kèm support" (cấp 2) và "dịch vụ lữ hành" để tránh cấp 2 vô tình vi phạm; nếu ranh giới mờ, siết chặt quyền cấp 2 về phía "hướng dẫn/chia sẻ" thay vì "tổ chức tour".
- **Bảo hiểm:** Khuyến nghị/bắt buộc bảo hiểm tai nạn cho hoạt động ngoài trời; cấp 3 nên có bảo hiểm trách nhiệm cho khách.
- **Dữ liệu cá nhân & vị trí:** Tuân thủ **Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân**. Vị trí real-time là dữ liệu nhạy cảm — cần **đồng thuận rõ ràng**, mục đích sử dụng minh bạch, cho phép tắt chia sẻ, và giới hạn thời gian lưu.
- **Trách nhiệm sản phẩm/thông tin:** Cảnh báo rõ dữ liệu bản đồ/GPX chỉ mang tính tham khảo, có thể sai lệch so với thực địa.
- **Khu vực nhạy cảm:** Một số vùng biên giới/rừng cấm/vườn quốc gia cần **giấy phép ra vào**; app nên gắn cờ và không khuyến khích mở cung trái phép ở các khu này.

---

## 5. Mô hình dữ liệu gợi ý (cho agent Code)

### 5.1. Bảng `users` (bổ sung trường tier)

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `id` | UUID | PK |
| `tier` | ENUM('L1','L2','L3') | Mặc định 'L1' |
| `reputation_score` | INT | 0–1000, cập nhật định kỳ |
| `kyc_status` | ENUM('none','pending','verified') | Cổng lên L2 |
| `identity_ref` | STRING | Tham chiếu hồ sơ KYC (không lưu ảnh gốc trong bảng chính) |
| `org_id` | UUID nullable | FK → `organizations` (nếu L3) |
| `waiver_version_accepted` | STRING nullable | Version điều khoản đã ký |
| `suspended` | BOOL | Khoá/đóng băng |

### 5.2. Bảng `reputation_events` (nhật ký điểm)

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `type` | ENUM('route_done','distance','ascent','rating','kyc','cert','gpx','violation') | |
| `points` | INT | Có thể âm (vi phạm) |
| `ref_id` | UUID nullable | Cung/đánh giá liên quan |
| `created_at` | TIMESTAMP | |

### 5.3. Bảng `permissions` (ma trận phân quyền — cấu hình được)

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `action` | STRING | vd `open_route`, `sell_route`, `create_tour`, `nav_hard_route` |
| `min_tier` | ENUM('L1','L2','L3') | Cấp tối thiểu |
| `requires_guide` | BOOL | Cần guide đi kèm (cung khó cho L1) |
| `requires_waiver` | BOOL | Cần ký waiver |
| `requires_kyc` | BOOL | Cần KYC |

### 5.4. Bảng `waivers` (bằng chứng đồng thuận)

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `route_id` | UUID | FK |
| `difficulty` | ENUM | Tại thời điểm ký |
| `terms_version` | STRING | |
| `signed_at` | TIMESTAMP | |
| `device_ip` | STRING | Bằng chứng |

### 5.5. Bảng `organizations` (cho L3)

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `id` | UUID | PK |
| `legal_name` | STRING | |
| `travel_license_no` | STRING | Số giấy phép lữ hành |
| `license_expiry` | DATE | Thu hồi L3 khi hết hạn |
| `insurance_ref` | STRING nullable | Bảo hiểm trách nhiệm |
| `contract_status` | ENUM('pending','active','terminated') | |

**Luồng kiểm tra quyền (pseudo):**
```
canPerform(user, action, route):
    p = permissions[action]
    if tierRank(user.tier) < tierRank(p.min_tier): return DENY
    if p.requires_kyc and user.kyc_status != 'verified': return DENY
    if p.requires_guide and route.difficulty >= MODERATE and booking.guide_id == null: return DENY
    if p.requires_waiver and not hasValidWaiver(user, route): return DENY
    if user.suspended: return DENY
    return ALLOW
```

---

## 6. Rủi ro & đề xuất

- **Rủi ro lách enforce ngoài app:** App chỉ chặn trong-app; người dùng vẫn có thể tự đi bằng thiết bị khác. → **Đề xuất:** không dựa 100% vào enforce kỹ thuật; waiver + disclaimer + cảnh báo là lớp bảo vệ pháp lý chính, cần luật sư chuẩn hoá.
- **Rủi ro ranh giới cấp 2 vs lữ hành:** "Bán cung kèm support" của cấp 2 có thể bị diễn giải là kinh doanh lữ hành không phép. → **Đề xuất:** làm rõ định nghĩa pháp lý; nếu rủi ro cao, giới hạn cấp 2 ở mức "hướng dẫn/chia sẻ có thu phí nhỏ" và đẩy mọi hoạt động "tour" lên cấp 3 có giấy phép.
- **Rủi ro gian lận điểm (spoof GPS):** Track giả để lên cấp nhanh. → **Đề xuất:** phát hiện bất thường (tốc độ, độ cao, cảm biến), duyệt bán tự động cho ngưỡng 1→2, chế tài trừ điểm mạnh.
- **Rủi ro dữ liệu vị trí:** Vị trí real-time nhạy cảm theo NĐ 13/2023. → **Đề xuất:** đồng thuận rõ ràng, cho tắt chia sẻ, giới hạn lưu trữ, ẩn danh khi phân tích.
- **Đề xuất bổ sung (không tự đổi quyết định chốt):** Cân nhắc thêm **liên hệ khẩn cấp/SOS** và tích hợp cảnh báo thời tiết cho cung KHÓ/CỰC KHÓ — ghi nhận ở đây để agent liên quan xem xét, không tự thêm vào scope đã chốt.

---

*Tham chiếu chéo: [[00-brief]] (mục 5), [[02-routes]] (độ khó cung), [[03-map-spec]] (mở cung/snap), [[05-... ]] (nếu có tài liệu pháp chế riêng).*
