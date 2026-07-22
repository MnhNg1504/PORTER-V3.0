# POTTER 3.0 — Hồ sơ bàn giao (Handover)

> Bám checklist mục 12 (và mục 11) của `docs/Ban giao va yeu cau.md`.
> Trạng thái ghi **THẬT tại 2026-07-22** (đối chiếu git remote, `app/app.json`, mã nguồn, gap analysis).
> Quy ước: ✅ đã có — sẵn sàng chuyển giao · 🟡 một phần · ❌ chưa có (ghi rõ khi nào cần + chi phí).

---

## 1. Bảng tài khoản & tài sản cần chuyển giao

### 1.1. Đã có — chuyển giao được ngay

| Tài sản | Trạng thái | Chi tiết thật | Việc cần làm khi bàn giao |
|---|---|---|---|
| **Source code + GitHub** | ✅ | Repo `https://github.com/MnhNg1504/PORTER-V3.0` (owner: MnhNg1504). Monorepo: `app/` (React Native Expo), `server/` (NestJS + PostGIS), `docs/`, `prototype/` | Transfer ownership repo (Settings → Transfer) hoặc thêm owner mới; bàn giao 2FA của tài khoản GitHub |
| **Expo / EAS** | ✅ | Account **padfoot1504** · project **padfoot** · projectId `0ca472bf-ac55-4136-8f64-47ac2dab0f08` (slug đã khớp app.json — fix commit `da7ecf4`) | Chuyển project sang organization Expo của bên nhận, hoặc bàn giao tài khoản; EAS build history đi kèm |
| **Database (thiết kế + script)** | ✅ thiết kế / ❌ production | PostGIS chạy local qua `server/docker-compose.yml`; migration đầy đủ (`server/src/migrations/`); seed 15 cung từ GPX thật; backup script `npm run db:backup` (pg_dump+gzip, giữ 14 bản) | Chưa có DB production để chuyển — bàn giao schema + seed + script là đủ ở giai đoạn này |
| **API Documentation** | ✅ | Swagger tự sinh tại `/docs` khi chạy server (không cần tài khoản ngoài) + `docs/api-contract.md` | Không cần hành động |
| **Tài liệu kiến trúc** | ✅ | `docs/00` → `docs/07` (brief, R&D, UX 5 tab, map flows, 3 cấp user, spec tổng hợp, gap analysis, hồ sơ này) + `docs/legal/` (3 văn bản pháp lý bản thảo) | Không cần hành động |
| **README triển khai** | ✅ | `app/README.md` (cài & chạy app, thật vs mock); `server/.env.example` + docker-compose cho backend | Không cần hành động |
| **CHANGELOG / LICENSE** | ✅ | `CHANGELOG.md` (Keep a Changelog); `LICENSE` proprietary — All rights reserved | Xác nhận điều khoản chuyển nhượng IP trong hợp đồng mua bán |
| **CI** | ✅ | GitHub Actions (`.github/`): typecheck + test mỗi push | Đi kèm repo, không cần tài khoản riêng |
| **Bộ nhận diện thương hiệu** | ✅ | Thư mục `BỘ NHẬN DIỆN THƯƠNG HIỆU PORTER` (logo 6 biến thể, font Young, palette Pine/Lime/Cream/Mist/Ember) — đã áp vào app (`app/src/theme/tokens.ts`) | Bàn giao file gốc + xác nhận quyền sử dụng font Young |
| **Dữ liệu GPX gốc** | ✅ | Thư mục `16 Đỉnh Tây Bắc` — 15 file GPX thật (Fansipan 9.541 điểm/24km/+3.264m đã verify) dùng seed cung | Đi kèm repo/ổ lưu trữ; xác nhận nguồn gốc & quyền dùng dữ liệu |

### 1.2. CHƯA có — cần tạo khi tiến tới production (ghi rõ thời điểm + chi phí)

| Tài sản | Trạng thái | Khi nào cần | Chi phí | Ghi chú thật từ code |
|---|---|---|---|---|
| **Firebase (FCM)** | ❌ | Khi build push notification production cho Android | Miễn phí | Server đã XONG push qua Expo Push API (`server/src/notifications/`) — không cần key server-side; chỉ cần nạp FCM credential 1 lần vào EAS khi build |
| **Apple Developer** | ❌ | Khi lên App Store (và bật Sign in with Apple) | **$99/năm** | Apple OAuth hiện là stub trả 501 (`server/src/auth/oauth.service.ts`) — code chờ `APPLE_CLIENT_ID` |
| **Google Play Console** | ❌ | Khi lên CH Play | $25 (một lần) | Package `vn.potter.app` đã khai trong app.json |
| **Google Cloud (OAuth)** | ❌ | Khi bật đăng nhập Google | Miễn phí | Code flow Google ĐÃ viết xong, chỉ chờ điền `GOOGLE_CLIENT_ID` vào `.env` (quyết định docs/05 §6) |
| **Domain + SSL** | ❌ | Khi deploy server public (link xác thực email cần `PUBLIC_API_URL` thật) | ~$10–15/năm + SSL miễn phí (Let's Encrypt) | Placeholder email trong docs pháp lý (`potter.vn`) chưa đăng ký |
| **SMTP / dịch vụ email** | ❌ | Khi bật xác thực email thật | Free tier đủ MVP (Resend/SES/Brevo) | Flow token xác thực 24h ĐÃ xong; hiện log link ra console dev — `TODO(mailer)` trong `auth.service.ts` |
| **Cloud hosting server** | ❌ | Khi deploy backend production | ~$10–30/tháng MVP | Dockerfile + docker-compose sẵn; chưa chọn nhà cung cấp |
| **Hạ tầng tile tự host** | ❌ (kế hoạch GĐ5) | Trước khi có lượng người dùng thật đáng kể | < $30/tháng theo R&D (PMTiles + CDN) | Hiện dùng **OpenFreeMap/OpenTopoMap miễn phí** — usage policy chỉ phù hợp demo/dev (cảnh báo trong `app/src/lib/mapStyles.ts`); production phải Planetiler → PMTiles hoặc MapTiler/Stadia có key |
| **Cổng thanh toán** | ❌ | Khi bật mua cung trả tiền thật | Phí theo giao dịch | Bảng purchases + trạng thái đã có; `TODO(payment)` trong `purchase.entity.ts` |
| **Video hướng dẫn quản trị** | ❌ | Khi có web admin (GĐ4) | — | API admin đã xong (duyệt GPX, xử lý report, set tier) — UI web admin chưa build |

### 1.3. Bí mật (secrets) cần bàn giao riêng — KHÔNG nằm trong repo

| Bí mật | Nơi ở hiện tại | Lưu ý |
|---|---|---|
| `.env` server (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_EMAIL_SECRET, DB_PASSWORD) | Máy dev (không commit — có `.env.example`) | Sinh secret mới ≥32 ký tự khi production; đổi toàn bộ sau bàn giao |
| Mật khẩu tài khoản GitHub, Expo | Người sở hữu hiện tại | Chuyển qua kênh an toàn (password manager), bật 2FA phía nhận |
| Các key tương lai (GOOGLE_CLIENT_ID, SMTP, payment) | Chưa tồn tại | Tạo dưới tài khoản của bên nhận ngay từ đầu để khỏi chuyển giao lại |

## 2. Số liệu kinh doanh cần đo (checklist mục 11)

**Trạng thái thật: app CHƯA phát hành, backend CHƯA deploy → mọi chỉ số hiện = chưa có dữ liệu.**
Kế hoạch instrument (đo đạc) triển khai **sau khi backend chạy production** (GĐ5–6):

| Chỉ số | Định nghĩa đo | Nguồn dữ liệu dự kiến (từ hệ thống đã xây) |
|---|---|---|
| Tổng người dùng | Số bản ghi bảng `users` (trừ tài khoản khoá/test) | Query trực tiếp DB — có sẵn ngay khi deploy |
| DAU / MAU | User có ≥1 request xác thực trong ngày/tháng | Cần thêm bảng `activity_log` hoặc đếm qua log JWT — **chưa build, GĐ5** |
| Retention (D1/D7/D30) | % user quay lại sau 1/7/30 ngày kể từ đăng ký | Từ activity log theo cohort `createdAt` |
| Tỷ lệ tăng trưởng | % tăng đăng ký mới theo tháng | `users.createdAt` — có sẵn |
| CAC | Chi phí marketing ÷ số user mới trong kỳ | Số liệu chi tiêu ngoài hệ thống + đăng ký mới |
| LTV | Doanh thu trung bình trên user trọn vòng đời (Premium + hoa hồng) | Bảng `purchases` (đã có) + bảng subscription (chưa build) |
| Doanh thu | Tổng `purchases.priceVnd` trạng thái `paid` + thuê bao Premium | Có bảng, chờ cổng thanh toán thật |
| Conversion sang trả phí | % user có ≥1 giao dịch `paid` / tổng user hoạt động | `purchases` × activity log |
| Chỉ số ngách trekking (khuyến nghị thêm) | Số cung được nộp/duyệt, số booking có guide, tổng km track ghi | `gpx_submissions`, `purchases`, bảng track (GĐ2+) |

**Việc cần làm để đo được (đưa vào backlog GĐ5):** (1) bảng activity/event log phía server; (2) tích hợp analytics phía app (đề xuất self-host để khỏi thêm bên thứ ba vào chính sách bảo mật); (3) dashboard admin đọc các chỉ số trên.

## 3. Checklist thao tác khi bàn giao thật (rút gọn)

- [ ] Ký hợp đồng chuyển nhượng IP (source code, thương hiệu PORTER, dữ liệu GPX, tài liệu)
- [ ] Transfer GitHub repo + kiểm tra CI chạy dưới owner mới
- [ ] Transfer Expo project `padfoot` (hoặc bàn giao tài khoản padfoot1504)
- [ ] Bàn giao secrets qua kênh an toàn → bên nhận **đổi toàn bộ secret**
- [ ] Bàn giao bộ nhận diện + font + GPX gốc (file lớn ngoài git)
- [ ] Hướng dẫn chạy: `app/README.md` (app) + `server/README`/docker-compose (backend) — chạy thử end-to-end trước mặt bên nhận
- [ ] Danh sách ❌ ở mục 1.2 chuyển thành backlog của bên nhận (kèm chi phí dự kiến)
- [ ] Văn bản pháp lý `docs/legal/` chuyển luật sư bên nhận rà trước khi phát hành

---

*Đối chiếu: `docs/Ban giao va yeu cau.md` mục 11–12 · `docs/06-gap-analysis.md` (trạng thái từng hạng mục) · git remote & `app/app.json` (xác minh 2026-07-22).*
