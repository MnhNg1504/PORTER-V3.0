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
  night: '#0E120E', // Gần đen — nền dark sâu nhất (Char/Ground)
  // --- Sắc v3 dark-glass (thêm mới, không thay khoá cũ) ---
  void: '#080B08', // Near-black v3 — nền dark sâu nhất của bề mặt glass
  surfaceGlass: '#121B15', // Card glass nền tối (giả lập backdrop-filter)
  surfaceGlassAlt: '#18271B', // Card glass biến thể sáng hơn 1 bậc
  surfaceSunk: '#0D1410', // Vùng chìm (input, well) trên nền dark
  glassTop: 'rgba(44,61,46,0.50)', // Đỉnh gradient glass (158deg)
  glassBottom: 'rgba(18,28,20,0.40)', // Đáy gradient glass
  limeHi: '#DFF19A', // Lime hover/nhấn mạnh
  onLime: '#182200', // Chữ trên nền Lime — tương phản cực cao (v3)
  emberSoft: '#FF8368', // Ember nhạt (chữ/viền cảnh báo mềm trên nền tối)
  sageTeal: '#9FCBB5', // Xanh sage-teal — thông tin/success mềm trên nền tối
  inkOnDark: '#EAF1E4', // Text mức 1 (ink) trên nền tối
  mutedOnDark: '#93A090', // Text mức 2 (muted) — sàn tương phản đọc ngoài nắng
  faintOnDark: '#6F7A6E', // Text mức 3 (faint) — nhãn phụ, fine print
  borderDark: '#24331F', // Viền card mặc định trên nền tối
  borderLime: 'rgba(201,226,101,0.16)', // Viền glass phát sáng lime
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
    faint: brandPalette.sage, // Text mức 3 — nhãn phụ, fine print
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
    base: brandPalette.void, // v3 near-black #080B08 (trước là Pine)
    baseDark: '#050705', // Sâu hơn base cho vùng chìm tối nhất
    surface: brandPalette.surfaceGlass, // Card glass #121B15
    surfaceDark: brandPalette.surfaceGlassAlt, // Card glass biến thể #18271B
  },
  text: {
    primary: brandPalette.inkOnDark, // Ink (#EAF1E4)
    secondary: brandPalette.mutedOnDark, // Muted #93A090 — sàn tương phản (nâng từ sage)
    faint: brandPalette.faintOnDark, // Faint #6F7A6E — nhãn phụ, fine print
    onBrand: brandPalette.pine,
    onLime: brandPalette.onLime, // Chữ trên Lime tương phản cực cao #182200
  },
  border: brandPalette.borderDark, // #24331F
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
  /** Heading phụ / kicker — Young Regular (alias ngữ nghĩa của displayRegular) */
  heading: 'Young',
  /** Số liệu / toạ độ / nhãn kỹ thuật — Space Mono, fallback mono hệ thống */
  data: 'monospace',
  /** Body — sans hệ thống (Archivo khi bundle sẵn, hiện dùng System) */
  body: 'System',
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
  // Kicker/nhãn micro v3 — floor 11px (không dùng 8.5–10px như comp để đọc được ngoài nắng)
  kicker: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 1.5 },
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

// ---- BO GÓC (nhích về thang v3: 14–26) ----
export const radius = {
  sm: 10, // Chip nhỏ, badge (v3 mềm hơn 8)
  md: 14, // Input, card phụ (v3 14–16)
  lg: 18, // Card chính glass
  card: 20, // Card lớn / sheet (khớp guidelines 20)
  xl: 22, // Panel / bottom-sheet
  xxl: 26, // Hero / terrain header
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
  // --- Bóng cho bề mặt dark-glass v3 (thêm mới) ---
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  glassSoft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },
  // Quầng sáng lime cho CTA chính trên nền tối
  limeGlow: {
    shadowColor: brandPalette.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  // Nút SOS/khẩn cấp — quầng ember, cần nổi bật ngoài nắng
  sos: {
    shadowColor: brandPalette.ember,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ---- CÔNG THỨC "GLASS" v3 (surrogate cho backdrop-filter — RN không có CSS filter) ----
// Dùng: <LinearGradient colors={[...glass.gradient]} start={glass.start} end={glass.end}>
//   + borderWidth 1 / borderColor glass.border + shadow.glass; highlight = viền trên mảnh trắng.
export const glass = {
  /** Gradient nền glass (linear 158deg từ đỉnh xuống đáy) */
  gradient: [brandPalette.glassTop, brandPalette.glassBottom] as [string, string],
  start: { x: 0.1, y: 0 },
  end: { x: 0.9, y: 1 },
  /** Nền đặc thay thế khi không dùng gradient (list dài, tránh tốn hiệu năng) */
  fill: brandPalette.surfaceGlass,
  fillAlt: brandPalette.surfaceGlassAlt,
  fillSunk: brandPalette.surfaceSunk,
  /** Viền phát sáng lime */
  border: brandPalette.borderLime, // rgba(201,226,101,0.16)
  borderStrong: 'rgba(201,226,101,0.28)',
  /** Highlight 1px trắng ở mép trên (giả inset highlight) */
  highlight: 'rgba(255,255,255,0.13)',
  /** Blur thật chỉ dùng cho tab bar/header (expo-blur); list dài KHÔNG blur */
  blur: 16,
  radius: radius.lg,
} as const;
