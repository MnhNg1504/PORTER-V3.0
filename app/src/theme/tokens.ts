/**
 * POTTER 3.0 — Design tokens
 * Nguồn: docs/02-ux-ui-5tabs.md §0.2. Tông "thiên nhiên / outdoor" + style điều hướng xanh-sạch.
 * KHÔNG dùng màu neon. Ưu tiên tương phản cao (đọc ngoài trời nắng).
 */

// ---- MÀU (Color) ----
export const colors = {
  brand: {
    primary: '#2E7D32', // Xanh rừng — nút chính, nút Xuất phát, active tab
    primaryDark: '#1B5E20', // Pressed, header gradient
    primaryLight: '#A5D6A7', // Nền nhấn nhẹ, chip active
  },
  accent: {
    summit: '#F57C00', // Cam đỉnh núi — CTA phụ, "độ hot", track đang ghi
  },
  earth: '#795548', // Nâu đất — icon địa hình, nhãn mùa
  rock: '#607D8B', // Xám đá — text phụ, đường phân cách

  danger: '#D32F2F', // Dốc đứng, cảnh báo lệch hướng, cung Khó
  warning: '#FBC02D', // Cung Chuẩn, cần chú ý
  success: '#43A047', // Cung Dễ, hoàn thành

  bg: {
    base: '#FFFFFF',
    baseDark: '#121712',
    surface: '#F5F7F4',
    surfaceDark: '#1D241C',
  },
  text: {
    primary: '#1B241E',
    secondary: '#5B6B60',
    onBrand: '#FFFFFF',
  },
  // Màu track/route trên map — dùng chung với prototype đã verify
  map: {
    trackPlanned: '#2962FF', // Track dự kiến
    trackRecording: '#F57C00', // Track đang ghi
    trackSample: '#2E7D32', // Track cung mẫu (đã mua)
    start: '#16A34A', // Điểm đầu
    end: '#E11D48', // Điểm cuối
    me: '#2F6BFF', // Vị trí người dùng (mũi tên GPS)
    casing: '#FFFFFF', // Viền trắng bọc line
  },
  border: '#E2E8F0',
} as const;

// ---- TYPOGRAPHY ----
export const type = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  h1: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  meta: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const },
  stat: { fontSize: 20, lineHeight: 24, fontWeight: '700' as const }, // tabular figures
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
  screen: 16, // padding lề màn
  cardGap: 12, // khoảng cách giữa card
} as const;

// ---- BO GÓC ----
export const radius = {
  sm: 8, // chip
  md: 12, // card
  lg: 16, // sheet, ảnh hero
  pill: 999,
} as const;

// ---- KÍCH THƯỚC / TOUCH TARGET ----
export const sizing = {
  touchMin: 44, // 44x44pt tối thiểu
  buttonHeight: 52, // nút chính
  tabIcon: 26,
  fabDiameter: 64, // nút Xuất phát giữa
  bottomNav: 56,
} as const;

// ---- BÓNG (elevation) ----
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
