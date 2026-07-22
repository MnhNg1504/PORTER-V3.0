/**
 * POTTER 3.0 — SOS & chia sẻ vị trí (checklist §5).
 * QUYẾT ĐỊNH ĐÃ CHỐT (docs/05 §5): SMS + gọi số khẩn cấp, KHÔNG qua server —
 * hoạt động khi chỉ còn sóng thoại (không cần data); app không hứa hẹn cứu hộ.
 * Thuần hàm (test được) — phần mở SMS/gọi dùng Linking ở component.
 */

export interface SosPosition {
  lat: number;
  lon: number;
  ele?: number | null; // độ cao (m) nếu có
  accuracy?: number | null; // sai số GPS (m) nếu có
}

/** Số khẩn cấp Việt Nam — hiển thị đúng nhãn, không hứa hẹn gì thay tổng đài */
export const EMERGENCY_NUMBERS = [
  { number: '112', label: 'Cứu nạn cứu hộ quốc gia' },
  { number: '115', label: 'Cấp cứu y tế' },
  { number: '113', label: 'Công an' },
] as const;

/** Link Google Maps mở được trên mọi máy (kể cả người nhận không cài app) */
export function mapsLink(pos: SosPosition): string {
  return `https://maps.google.com/?q=${pos.lat.toFixed(6)},${pos.lon.toFixed(6)}`;
}

/** Toạ độ dạng đọc-qua-điện-thoại: "21.447808, 104.353528, cao ~1500m" */
export function speakableCoords(pos: SosPosition): string {
  const base = `${pos.lat.toFixed(6)}, ${pos.lon.toFixed(6)}`;
  return pos.ele != null ? `${base}, cao ~${Math.round(pos.ele)}m` : base;
}

/** Nội dung SMS khẩn cấp — ngắn (SMS 1-2 segment), đủ thông tin định vị */
export function formatSosMessage(
  pos: SosPosition,
  opts: { name?: string; routeName?: string } = {},
): string {
  const who = opts.name ? `Tôi là ${opts.name}. ` : '';
  const where = opts.routeName ? ` khi trekking cung ${opts.routeName}` : ' khi trekking';
  const acc = pos.accuracy != null ? ` (sai số ~${Math.round(pos.accuracy)}m)` : '';
  return (
    `SOS! ${who}Cần hỗ trợ KHẨN CẤP${where}. ` +
    `Vị trí: ${speakableCoords(pos)}${acc}. ` +
    `Bản đồ: ${mapsLink(pos)} — gửi từ app POTTER.`
  );
}

/** Nội dung chia sẻ vị trí thông thường (không khẩn cấp) */
export function formatShareMessage(pos: SosPosition, routeName?: string): string {
  const route = routeName ? ` trên cung ${routeName}` : '';
  return `Mình đang${route} tại: ${speakableCoords(pos)}. Xem bản đồ: ${mapsLink(pos)} (POTTER)`;
}

/**
 * URL mở soạn SMS kèm nội dung.
 * iOS dùng `&body=`, Android dùng `?body=` — khác nhau thật sự giữa 2 nền tảng.
 */
export function smsUrl(phone: string, body: string, platform: 'ios' | 'android'): string {
  const sep = platform === 'ios' ? '&' : '?';
  return `sms:${phone}${sep}body=${encodeURIComponent(body)}`;
}

/** URL gọi điện */
export function telUrl(number: string): string {
  return `tel:${number}`;
}
