# 12 — Test POTTER trên iPhone (FREE, không cần tài khoản Apple trả phí)

> Mục tiêu: cài app `app/` (React Native + Expo) lên **chính iPhone của bạn** để test thật —
> **không tốn 99$/năm**. Chỉ khi muốn lên **TestFlight / App Store** mới cần mua Apple Developer Program.

## 0. Điều kiện

| Cần | Ghi chú |
|---|---|
| **MacBook** + **Xcode** (App Store, miễn phí) | Bắt buộc — build iOS chỉ chạy trên macOS |
| **CocoaPods** | `sudo gem install cocoapods` (hoặc `brew install cocoapods`) |
| **Apple ID cá nhân** (iCloud đang dùng) | KHÔNG cần trả phí. Xcode tạo "Personal Team" free |
| **iPhone + cáp** | Cắm vào Mac, mở khoá, bấm **Tin cậy máy tính này** |
| Node 18+ , npm | |

> ⚠️ MapLibre là **native module** → **không chạy Expo Go**. Bắt buộc **development build** (các bước dưới).

## 1. Cài & sinh native

```bash
cd app
npm install
npx expo prebuild          # sinh thư mục ios/ (và android/) từ app.json + config plugin
```

## 2. Ký app bằng Apple ID free (làm 1 lần trong Xcode)

```bash
open ios/POTTER.xcworkspace     # mở workspace vừa prebuild (KHÔNG mở .xcodeproj)
```

Trong Xcode:
1. Chọn target **POTTER** → tab **Signing & Capabilities**.
2. Tick **Automatically manage signing**.
3. **Team** → *Add an Account…* → đăng nhập **Apple ID cá nhân** → chọn team dạng
   **"(Tên bạn) — Personal Team"**.
4. Nếu báo trùng **Bundle Identifier** `vn.potter.app`: đổi thành thứ riêng của bạn,
   ví dụ `vn.potter.<tên-bạn>` (chỉ ảnh hưởng bản test).

## 3. Chạy lên iPhone

Cắm iPhone, rồi:

```bash
npx expo run:ios --device      # chọn iPhone của bạn trong danh sách
```

Lần đầu iPhone sẽ chặn app "nhà phát triển chưa tin cậy":
> iPhone → **Cài đặt → Cài đặt chung → VPN & Quản lý thiết bị** →
> chọn Apple ID của bạn → **Tin cậy**.

Mở lại app trên iPhone → chạy được. Sau lần đầu, chỉ cần:

```bash
npm start        # = expo start --dev-client  (nạp JS nhanh, không build lại native)
```

## 4. Giới hạn của bản FREE (chấp nhận được để test)

| Giới hạn | Ảnh hưởng |
|---|---|
| App **hết hạn sau 7 ngày** | Chạy lại `npx expo run:ios --device` là gia hạn tiếp |
| Tối đa **3 app** free / thiết bị | Đủ dùng |
| **Không có Push Notification thật** | Test được UI; push thật cần Apple Dev trả phí |
| Không TestFlight / không chia sẻ cho máy khác | Chỉ cài trên iPhone đã ký |

> **Vị trí nền (background location)** vẫn hoạt động với bản free — đủ để test GPS + ghi track + dẫn đường.

## 5. Khi nào cần mua Apple Developer (99$/năm)

Chỉ khi muốn một trong các thứ sau:
- Đưa lên **TestFlight** cho người khác test / lên **App Store**.
- **Push Notification** thật (Expo Push / FCM-APNs).
- App không hết hạn sau 7 ngày.
- Build đám mây **EAS** cài lên iPhone không cần Mac (đăng ký UDID thiết bị).

→ Lúc đó dùng: `eas build --platform ios --profile preview` (đã cấu hình sẵn trong `eas.json`).

## 6. Lỡ không có Mac lúc cần?

- Test **Android** trước (miễn phí 100%, không cần Apple/Mac): `npx expo run:android`.
- Hoặc mua Apple Dev sớm để dùng EAS build đám mây.

## 6b. DEMO1 — chạy độc lập, KHÔNG cần server

Cho buổi demo đầu tiên, app **tự chạy trên iPhone mà không cần bật backend NestJS**:
- **Booking / đặt cọc**: chạy ở `DEMO_MODE` (mặc định BẬT trong `app/src/lib/paymentsApi.ts`) — mô phỏng cục bộ trọn luồng *chọn ngày → cọc 30% → xác nhận → hủy/hoàn theo thang QĐ-1*, **KHÔNG tiền thật**.
- **Bản đồ + thời tiết**: dùng tile OSM/OpenFreeMap + Open-Meteo công khai → chỉ cần **wifi/4G**, không cần server.
- **Các tab khác** (Cộng đồng, Hồ sơ, Nhắn tin): dữ liệu mock sẵn.

→ Demo1 chỉ cần: Mac build 1 lần (mục 1–3) + iPhone có mạng. Không cần chạy `server/`.
Khi nối backend thật: `configurePaymentsApi({ baseUrl, token, demo: false })` lúc đăng nhập.

**Kịch bản demo gợi ý (5'):** mở app → lướt Trang chủ (thời tiết săn mây thật) → chọn cung → xem Chi tiết (bản đồ/độ cao) → **MUA CUNG → Booking → ký cam kết → đặt cọc 30% → xem trạng thái đơn → thử Hủy (xem thang hoàn cọc)** → mở tab Bản đồ (GPS thật) → Hồ sơ.

## 7. Sự cố hay gặp

| Lỗi | Cách xử lý |
|---|---|
| `pod install` fail | `cd ios && pod repo update && pod install` |
| Xcode báo *"Failed to register bundle identifier"* | Đổi `bundleIdentifier` trong `app.json` sang tên riêng, `npx expo prebuild --clean` |
| App mở ra tắt ngay | Đã bấm **Tin cậy** ở bước 3 chưa? |
| Map trắng | Kiểm tra mạng + `src/lib/mapStyles.ts` (tile demo cần Internet) |
| Sửa `app.json`/plugin không ăn | Chạy lại `npx expo prebuild --clean` rồi build lại |
