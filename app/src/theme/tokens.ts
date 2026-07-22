/**
 * POTTER 3.0 — Design tokens theo BỘ NHẬN DIỆN THƯƠNG HIỆU PORTER.
 * Nguồn: "BỘ NHẬN DIỆN THƯƠNG HIỆU PORTER/Porter Brand Guidelines.dc.html".
 * Bảng màu chính thức: Pine Green #16281A · Lime Signal #C9E265 · Cream #EAF1E4
 *                      · Mist #A9CDD8 · Ember #FF5233.
 * Typography: Young Display (tiêu đề, serif) · Space Mono (số liệu) · sans hệ thống (body).
 * Ưu tiên tương phản cao (đọc ngoài trời nắng).
 */

// ---- BẢNG MÀU THƯƠNG HIỆU (nguồn sự thật duy nhất) ----
export const brandPalette = {
  pine: '#16281A', // Pine Green — màu chủ đạo (nền tối, chữ trên nền sáng)
  pineMid: '#1F3A22', // Pine biến thể (pressed, gradient)
  forest: '#2F5233', // Xanh rừng trung gian (link, icon active trên nền sáng)
  lime: '#C9E265', // Lime Signal — accent CTA (nút Xuất phát, highlight)
  cream: '#EAF1E4', // Cream — nền sáng chính
  sand: '#E3DFD2', // Viền/nền phụ ấm
  mist: '#A9CDD8', // Mist — accent phụ (nước, sương, thông tin)
  ember: '#FF5233', // Ember — SOS, lệch tuyến, cung Khó
  gold: '#E8C877', // Vàng hổ phách — cảnh báo mềm, cung Chuẩn
  sage: '#8FA07F', // Chữ phụ trên nền sáng
  night: '#0E120E', // Gần đen — nền dark sâu nhất
} as const;

// ---- MÀU NGỮ NGHĨA (giữ nguyên key cũ — mọi màn hình không phải sửa) ----
export const colors = {
  brand: {
    primary: brandPalette.pine, // Nút chính, active tab, header
    primaryDark: brandPalette.night, // Pressed
    primaryLight: brandPalette.lime, // Nền nhấn / chip active (Lime Signal)
  },
  accent: {
    summit: brandPalette.ember, // "Độ hot", track đang ghi, CTA phụ
  },
  earth: brandPalette.forest, // Icon địa hình, nhãn mùa
  rock: brandPalette.sage, // Text phụ, phân cách

  danger: brandPalette.ember, // Dốc đứng, lệch hướng, cung Khó, SOS
  warning: brandPalette.gold, // Cung Chuẩn, cần chú ý
  success: brandPalette.forest, // Cung Dễ, hoàn thành

  bg: {
    base: brandPalette.cream, // Nền sáng chính (Cream)
    baseDark: brandPalette.pine, // Nền dark chính (Pine)
    surface: '#F2F6ED', // Card trên nền cream
    surfaceDark: brandPalette.pineMid,
  },
  text: {
    primary: brandPalette.pine,
    secondary: '#5A6552', // Xám rêu (từ guidelines)
    onBrand: brandPalette.cream, // Chữ trên nền pine
    onLime: brandPalette.pine, // Chữ trên nút Lime (tương phản cao)
  },
  // Màu track/route trên map — nền map sáng nên cần line đậm tương phản
  map: {
    trackPlanned: '#2F6BFF', // Track dự kiến (xanh điều hướng — giữ để dễ đọc)
    trackRecording: brandPalette.ember, // Track đang ghi
    trackSample: brandPalette.forest, // Track cung mẫu (đã mua)
    start: brandPalette.forest, // Điểm đầu
    end: brandPalette.ember, // Điểm cuối
    me: '#2F6BFF', // Vị trí người dùng
    casing: '#FFFFFF', // Viền bọc line
  },
  border: brandPalette.sand,
} as const;

/** Nới literal type của bảng màu `as const` thành string để theme dark gán giá trị khác */
type DeepWiden<T> = { [K in keyof T]: T[K] extends string ? string : DeepWiden<T[K]> };

/** Dark mode (checklist §9) — cùng key với `colors`, nền Pine/Night, accent Lime */
export const darkColors: DeepWiden<typeof colors> = {
  ...colors,
  brand: {
    primary: brandPalette.lime, // Trên nền tối, Lime là màu hành động chính
    primaryDark: '#B5CE55',
    primaryLight: brandPalette.pineMid,
  },
  bg: {
    base: brandPalette.pine,
    baseDark: brandPalette.night,
    surface: brandPalette.pineMid,
    surfaceDark: '#24331F',
  },
  text: {
    primary: brandPalette.cream,
    secondary: brandPalette.sage,
    onBrand: brandPalette.pine,
    onLime: brandPalette.pine,
  },
  border: '#24331F',
} as const;

// ---- FONT THƯƠNG HIỆU ----
// Load trong App.tsx qua expo-font; fallback an toàn khi font chưa sẵn sàng.
export const fonts = {
  /** Young Display Bold — tiêu đề lớn, tên cung, số liệu hero */
  display: 'YoungDisplay',
  /** Young regular — heading phụ */
  displayRegular: 'Young',
  /** Số liệu kiểu Space Mono — fallback monospace hệ thống (font không kèm trong kit) */
  mono: 'monospace',
} as const;

// ---- TYPOGRAPHY ----
export const type = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  h1: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  meta: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const },
  stat: { fontSize: 20, lineHeight: 24, fontWeight: '700' as const },
} as const;

// ---- SPACING (grid 4pt) ----
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  screen: 16,
  cardGap: 12,
} as const;

// ---- BO GÓC ----
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

// ---- KÍCH THƯỚC / TOUCH TARGET ----
export const sizing = {
  touchMin: 44,
  buttonHeight: 52,
  tabIcon: 26,
  fabDiameter: 64,
  bottomNav: 56,
} as const;

// ---- BÓNG ----
export const shadow = {
  card: {
    shadowColor: brandPalette.pine,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: brandPalette.pine,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
