> ⚠️ DRAFT — chưa có giá trị pháp lý tới khi luật sư có chứng chỉ rà soát (docs/17 §0).

# Checklist tuân thủ bảo vệ dữ liệu cá nhân (PDPD)
# Personal Data Protection Compliance Checklist — Nghị định 13/2023/NĐ-CP

> Phạm vi: dữ liệu **nhạy cảm và định danh** phát sinh ở Giai đoạn 1–3 mà hệ thống hiện tại CHƯA phủ đầy đủ trong [Chính sách bảo mật](chinh-sach-bao-mat.md) v0.1:
> **(A) Vị trí GPS/track**, **(B) Ảnh checkpoint có EXIF-GPS** (chống gian lận GPX, mục C.7 docs/16), **(C) CCCD + người xác nhận cho KYC người bán bản địa** (QĐ-6).
> Đây là **checklist tuân thủ** để luật sư có chứng chỉ rà và bộ phận bảo vệ dữ liệu (DPO) thực thi TRƯỚC khi bật từng tính năng.

*Phiên bản: 0.1 (bản thảo) — Ngày soạn: 2026-07-24 — Hiệu lực: [chưa công bố] — Căn cứ: NĐ 13/2023/NĐ-CP ("NĐ 13")*

---

## 0. Nguyên tắc chung (áp cho cả 3 loại dữ liệu)

- [ ] **Đồng ý riêng, tách bạch** cho từng loại dữ liệu nhạy cảm (Điều 11, 13 NĐ 13) — không gộp vào "đồng ý điều khoản chung".
- [ ] **Thông báo trước khi xử lý** (Điều 13): nêu rõ dữ liệu gì, mục đích, thời gian, bên nhận.
- [ ] **Tối thiểu hoá**: chỉ thu đúng dữ liệu cần cho mục đích đã nêu.
- [ ] **Rút đồng ý** được bất kỳ lúc nào; rút không hồi tố tính hợp pháp của xử lý trước đó.
- [ ] **Lập Hồ sơ đánh giá tác động xử lý DLCN (DPIA)** — Điều 24 — và **hồ sơ chuyển dữ liệu ra nước ngoài** — Điều 25 — nếu có bên nhận ngoài VN.
- [ ] **Chỉ định bộ phận/nhân sự bảo vệ dữ liệu** (DPO) vì có xử lý dữ liệu nhạy cảm (Điều 28/43).
- [ ] **Thông báo vi phạm** tới Bộ Công an (A05) trong **72 giờ** (Điều 23).

---

## A. Dữ liệu VỊ TRÍ GPS / TRACK (dữ liệu nhạy cảm — Điều 2 NĐ 13)

**Vì sao nhạy cảm:** vị trí cá nhân xác định qua dịch vụ định vị được xếp là **dữ liệu cá nhân nhạy cảm**.

### A.1. Dữ liệu thu thập
- [ ] Vị trí GPS hiện tại (khi mở bản đồ / điều hướng / SOS);
- [ ] Track/hành trình (chuỗi toạ độ + độ cao + thời gian) khi người dùng chủ động ghi;
- [ ] File GPX người bán tải lên (chứa toạ độ tuyến).

### A.2. Mục đích
- [ ] Hiển thị vị trí trên bản đồ, dẫn đường, ghi track, thống kê cột mốc (km/tổng leo);
- [ ] Kiểm duyệt & công khai cung (với GPX người bán);
- [ ] **KHÔNG** dùng cho quảng cáo, **KHÔNG** bán dữ liệu.

### A.3. Đồng ý
- [ ] Hộp thoại quyền vị trí của hệ điều hành **+** thông báo xử lý dữ liệu nhạy cảm **đồng ý riêng** khi bật lần đầu;
- [ ] Đồng ý **background location** tách riêng, chỉ khi người dùng bật ghi track nền — nêu rõ lý do.

### A.4. Lưu trữ
- [ ] Track cá nhân: tới khi người dùng xoá từng track hoặc xoá tài khoản;
- [ ] GPX công khai: theo vòng đời cung;
- [ ] Ẩn danh hoá toạ độ khi dùng cho phân tích/thống kê tổng hợp.

### A.5. Chia sẻ bên thứ ba
- [ ] Open-Meteo: **chỉ toạ độ điểm xuất phát cung** (làm tròn), **không** kèm định danh người dùng;
- [ ] Máy chủ tile bản đồ nhận IP + vùng đang xem — nêu trong chính sách;
- [ ] Đánh giá **chuyển dữ liệu ra nước ngoài** (Open-Meteo/Esri/AWS ngoài VN) — Điều 25.

### A.6. Quyền chủ thể
- [ ] Tắt quyền vị trí bất kỳ lúc nào (bản đồ vẫn xem được, mất định vị/dẫn đường);
- [ ] Xoá từng track; xuất track ra GPX chuẩn (quyền cung cấp dữ liệu).

---

## B. ẢNH CHECKPOINT có EXIF-GPS (chống gian lận GPX — mục C.7 docs/16)

**Bối cảnh:** khi track nộp bị nghi đạo GPX (overlap ≥80% cung đã publish), hệ thống yêu cầu **≥3 ảnh checkpoint có EXIF-GPS khớp track**. Ảnh + EXIF (toạ độ, thời gian, có thể cả thiết bị) là **dữ liệu cá nhân** (và toạ độ trong EXIF là **nhạy cảm**).

### B.1. Dữ liệu thu thập
- [ ] Ảnh checkpoint do người bán/người đi cung tải lên;
- [ ] **Metadata EXIF**: toạ độ GPS, thời gian chụp, model thiết bị (nếu có);
- [ ] Có thể lộ **khuôn mặt/người thứ ba** trong ảnh — cân nhắc.

### B.2. Mục đích
- [ ] **Chỉ** để xác minh tính xác thực của track (chống đạo GPX) và kiểm duyệt cung;
- [ ] **KHÔNG** dùng ảnh cho mục đích khác nếu chưa xin đồng ý bổ sung.

### B.3. Đồng ý & thông báo
- [ ] Thông báo rõ **EXIF-GPS sẽ được đọc** để đối chiếu — người dùng đồng ý riêng;
- [ ] Cảnh báo người dùng nếu ảnh chứa **người khác**: cần sự đồng ý của người đó (dữ liệu bên thứ ba);
- [ ] Tuỳ chọn: cho phép người dùng biết hệ thống đọc EXIF (minh bạch).

### B.4. Lưu trữ & tối thiểu hoá
- [ ] Chỉ giữ ảnh checkpoint **cần cho việc kiểm duyệt/tranh chấp**; đặt thời hạn (đề xuất theo vòng đời cung + thời hạn khiếu nại);
- [ ] Cân nhắc **strip EXIF** khi hiển thị ảnh công khai (không lộ toạ độ nhà/vị trí nhạy cảm ngoài ý muốn);
- [ ] Lưu ảnh gốc ở storage phân quyền chặt (chỉ kiểm duyệt viên/điều tra truy cập).

### B.5. Quyền chủ thể
- [ ] Xoá ảnh; biết ảnh nào đang lưu; phản đối xử lý.

---

## C. CCCD + NGƯỜI XÁC NHẬN cho KYC người bán bản địa (QĐ-6)

**Bối cảnh:** KYC "nhẹ" (QĐ-6): **CCCD + 1 người xác nhận**; cho **tạo hồ sơ hộ** (porter ít dùng smartphone). Số CCCD/ảnh giấy tờ là **dữ liệu định danh nhạy cảm**; "người xác nhận" là **dữ liệu bên thứ ba**.

### C.1. Dữ liệu thu thập
- [ ] Số CCCD + ảnh CCCD (mặt trước/sau) hoặc ảnh chụp;
- [ ] Họ tên, ngày sinh, quê quán (theo CCCD);
- [ ] Ảnh chân dung/liveness (nếu áp dụng);
- [ ] **Thông tin người xác nhận**: tên + SĐT (dữ liệu của người thứ ba).

### C.2. Mục đích
- [ ] **Chỉ** để xác minh danh tính người bán (gán trách nhiệm pháp lý), điều kiện lên Cấp 2;
- [ ] **KHÔNG** dùng CCCD cho mục đích khác.

### C.3. Đồng ý
- [ ] **Đồng ý riêng** cho xử lý dữ liệu định danh nhạy cảm;
- [ ] **Tạo hồ sơ hộ:** phải có cơ chế xác nhận người được tạo hồ sơ **thực sự đồng ý** (chống mạo danh) — ví dụ xác nhận qua SĐT/gặp trực tiếp có ký. *(Rủi ro cao nhất: hồ sơ hộ dễ bị lạm dụng — luật sư quyết cơ chế đồng ý hợp lệ.)*
- [ ] **Người xác nhận** phải được thông báo và đồng ý cho dùng SĐT của họ (nghĩa vụ của người khai với dữ liệu bên thứ ba).

### C.4. Lưu trữ & bảo mật
- [ ] **KHÔNG lưu ảnh CCCD gốc trong bảng chính** — dùng `identity_ref` tham chiếu tới storage mã hoá, phân quyền (đồng bộ docs/04 §5.1);
- [ ] Mã hoá khi lưu (at-rest) và khi truyền (in-transit);
- [ ] Thời hạn lưu: trong thời gian tài khoản còn hiệu lực + thời hạn nghĩa vụ pháp lý; xoá/ẩn danh khi không còn cần (đề xuất — luật sư chốt);
- [ ] Chỉ nhân sự KYC được duyệt truy cập; ghi log truy cập.

### C.5. Quyền chủ thể
- [ ] Truy cập/sửa thông tin định danh; rút đồng ý (kéo theo hạ/khoá quyền Cấp 2);
- [ ] Người xác nhận có quyền yêu cầu gỡ thông tin của họ.

---

## D. Bảng tóm tắt rà chéo với hệ thống hiện có

| Loại dữ liệu | Trạng thái hệ thống | Đã có trong Chính sách bảo mật v0.1? | Việc cần làm trước khi bật |
|---|---|---|---|
| Vị trí/track GPS | Đã xây | Có (§2.2, §4) | Rà lại đồng ý background; DPIA |
| Ảnh checkpoint + EXIF | **Chưa phát hành** (thuộc chống gian lận GĐ sau) | **Chưa** | Bổ sung mục thu thập ảnh/EXIF + đồng ý + strip EXIF công khai |
| CCCD + người xác nhận (KYC) | **Chưa phát hành** (QĐ-6, GĐ3) | **Chưa** (§2.5 ghi "KYC chưa phát hành") | Bổ sung mục KYC; cơ chế đồng ý cho "tạo hồ sơ hộ"; storage mã hoá |
| Thanh toán/escrow | Sandbox (GĐ1) | Ghi "chưa có cổng" | Bổ sung khi bật; dữ liệu do PSP xử lý |

---

## Các điểm luật sư PHẢI quyết (cho file này)

1. **"Tạo hồ sơ hộ" (QĐ-6):** cơ chế nào để đồng ý của người bán bản địa được coi **hợp lệ** khi họ ít dùng smartphone — rủi ro mạo danh/ép buộc cao nhất; có cần chứng kiến/ký giấy.
2. **EXIF-GPS trong ảnh checkpoint:** đọc toạ độ EXIF có cần đồng ý riêng ngoài đồng ý tải ảnh; có bắt buộc **strip EXIF** khi ảnh hiển thị công khai không.
3. **CCCD:** thời hạn lưu tối đa, yêu cầu mã hoá cụ thể, có phải đăng ký/thông báo A05 khi xử lý số lượng lớn giấy tờ tuỳ thân.
4. **DPIA (Điều 24)** và **Hồ sơ chuyển dữ liệu ra nước ngoài (Điều 25)** — bắt buộc lập & nộp trước khi bật tính năng nào.
5. **Người xác nhận / liên hệ khẩn cấp (dữ liệu bên thứ ba):** trách nhiệm bảo đảm đồng ý thuộc người khai hay Nền tảng; cần cảnh báo/xác nhận thế nào.
6. **Chỉ định DPO** và quy trình thông báo vi phạm 72h — ai chịu trách nhiệm.

---

*Tham chiếu: NĐ 13/2023/NĐ-CP (Điều 2, 11, 13, 20, 23, 24, 25, 28) · [Chính sách bảo mật](chinh-sach-bao-mat.md) · docs/16 (QĐ-6, mục C.7) · docs/04 §5.1 (identity_ref) · docs/17 §0 (ranh giới KYC/pháp lý).*
