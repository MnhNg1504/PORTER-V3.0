# POTTER 3.0 — Gap Analysis theo checklist "Ban giao va yeu cau.md"

> Bảng bám tiến độ. Trạng thái: ✅ xong · 🟡 một phần (skeleton/mock) · ❌ chưa có.
> Cột GĐ = giai đoạn dự kiến hoàn thành (theo kế hoạch đã duyệt).

## 1. Sản phẩm
| Hạng mục | Trạng thái | GĐ | Ghi chú |
|---|---|---|---|
| Android + iOS | 🟡 | 1 | RN Expo build được 2 nền tảng; cần dev build test thật |
| Đăng nhập Google/Apple/Email | 🟡 | 3✓ | Email+JWT ✅; Google ✅ code (chờ GOOGLE_CLIENT_ID); Apple stub 501 (chờ Apple Dev) |
| Hồ sơ người dùng | 🟡 | 2 | Màn Profile có UI, chờ nối API |
| Đăng bài, ảnh, video | 🟡 | 3 | Feed UI mock; upload media cần backend + storage |
| Bình luận, cảm xúc | ❌ | 3 | Contract có; chưa build |
| Chat 1-1 & nhóm | 🟡 | 3 | UI mock; Socket.IO gateway GĐ3 |
| Thông báo đẩy | 🟡 | 3✓ | Server XONG (Expo Push API, token registry, tự dọn token chết); app đăng ký token khi build có FCM |
| Bản đồ | ✅ | — | MapLibre + OSM/OpenFreeMap + DEM THẬT, đã verify |
| GPS tracking | 🟡 | 1 | expo-location foreground có; background tracking chưa |
| Offline cache | ❌ | 5 | PMTiles theo Area (đã đặc tả docs/03) |
| Tìm kiếm | 🟡 | 1✓ | Màn Search + lọc không dấu XONG (client); nối server query sau |
| Báo cáo nội dung xấu | ❌ | 2 | Module moderation GĐ2 |
| Chặn người dùng | ❌ | 2 | Module moderation GĐ2 |
| Trang quản trị | ❌ | 4 | Web admin (duyệt GPX, xử lý report, quản lý tier) |

## 2. Mã nguồn
| Hạng mục | Trạng thái | GĐ | Ghi chú |
|---|---|---|---|
| GitHub/GitLab | 🟡 | 0 | Git local init hôm nay; push remote khi user cấp repo |
| Commit đều, có ý nghĩa | 🟡 | 0→ | Bắt đầu từ commit đầu tiên |
| Không file rác | ✅ | 0 | .gitignore loại zip, gpx trùng, build, native gen |
| README | ✅ | — | `app/README.md` (102 dòng, cài & chạy, thật vs mock) |
| CHANGELOG | ✅ | 0 | `CHANGELOG.md` |
| LICENSE | ✅ | 0 | Proprietary — All rights reserved |
| Tài liệu kiến trúc | ✅ | — | docs/01, 03, 05 + api-contract |
| Tách FE/BE | 🟡 | 2 | `app/` có; `server/` GĐ2 |
| Code theo module | ✅ | — | app: screens/components/lib/theme; server: module NestJS |
| Không hard-code key | ✅ | 0 | `.env.example` cả 2 phía |

## 3. Backend (GĐ2 — ✅ scaffold xong 2026-07-22, commit `43f1506`; typecheck 0 lỗi, parser verify với GPX thật)
| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| REST API rõ ràng | 🟡 | NestJS theo api-contract + Swagger |
| JWT/OAuth + Refresh | 🟡 | JWT + refresh GĐ2; OAuth Google/Apple GĐ3 |
| Rate limit | 🟡 | @nestjs/throttler |
| Log lỗi | 🟡 | Nest Logger; production: pino GĐ5 |
| Backup DB | 🟡 | Script pg_dump+gzip giữ 14 bản (npm run db:backup); tự động hoá cron khi deploy |
| Phân quyền Admin/User | 🟡 | RolesGuard + TierGuard |
| Upload ảnh/video | ❌ | GĐ3 (multer + object storage) |
| Queue tác vụ nặng | ❌ | GĐ5 (BullMQ — xử lý GPX lớn, thumbnail) |
| Monitoring | ❌ | GĐ5 |

## 4. Database
✅ Thiết kế PostGIS (api-contract §11) · 🟡 migration + index + seed 15 cung (GĐ2) · ❌ backup tự động (GĐ5)

## 5. Map & Trekking
| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| GPX import | ✅ | `app/src/lib/gpx.ts` — đã verify với 15 GPX thật |
| GPX export | ✅ | `toGpxXml()` + test roundtrip (2026-07-22) |
| Lưu hành trình / độ cao / khoảng cách / thời gian | 🟡 | Lib tính đủ; lưu server GĐ2 |
| Tốc độ | ❌ | GĐ1 (từ timestamp GPX / GPS) |
| Check-in, cắm trại, nguồn nước | ✅ | route_checkpoints (7 kind) + xác minh ảnh-GPS server-side 5 bước, verify_score, CERTIFIED +25 uy tín (2026-07-22) |
| Mức độ khó | ✅ | DifficultyChip + thang docs/04 |
| Ảnh từng waypoint | 🟡 | Design có (điểm xuất phát BẮT BUỘC ảnh); upload GĐ3 |
| Offline map | ❌ | GĐ5 — PMTiles |
| Thời tiết | ✅ | Open-Meteo thật + đánh giá an toàn trekking (2026-07-22) |
| SOS | ✅ | SMS + gọi 112/115/113, GPS thật, không qua server — đã chốt docs/05 §5 (2026-07-22) |
| Chia sẻ vị trí | ✅ | Share sheet kèm toạ độ + link maps (trong SosSheet) |

## 6. Chat — ✅ server realtime + REST đầy đủ (đã xem/online/typing/thu hồi 30'/block-aware/report, 2026-07-22) · 🟡 client app còn mock (nối GĐ3 tiếp) · ❌ gửi ảnh/video (chờ storage)

## 7. Bảo mật
🟡 GĐ2: bcrypt hash, JWT an toàn, validation (chống injection/XSS), throttle đăng nhập sai ·
🟡 xác thực email (flow token 24h xong, chờ nối SMTP thật — TODO mailer) · ❌ GĐ5: HTTPS (deploy), CSRF cho admin web

## 8. DevOps — 🟡 GĐ2: docker-compose (PostGIS) · ✅ test tự động lib app (Jest) · ✅ CI GitHub Actions (typecheck+test mỗi push, 2026-07-22) · ❌ GĐ5: crash reporting, monitoring

## 9. Thiết kế — ✅ tokens theo **bộ nhận diện PORTER** (Pine/Lime/Cream/Mist/Ember + font Young) · 🟡 dark mode (palette `darkColors` đã định nghĩa, chưa wire toggle) · ✅ component thống nhất · 🟡 icon (emoji tạm)

## 10. Pháp lý — 🟡 docs/04 có khung waiver + NĐ13/2023; ❌ GĐ6: Điều khoản/Privacy/Quy định nội dung (cần luật sư rà)

## 11. Dữ liệu kinh doanh — ❌ GĐ5-6: instrument analytics (DAU/MAU/retention/conversion) sau khi có backend

## 12. Hồ sơ bàn giao — ❌ GĐ6: `docs/07-handover.md` (danh sách tài khoản: GitHub, Firebase, Apple Dev, Play Console, domain, tile CDN, cloud)
