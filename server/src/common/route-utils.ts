/**
 * Hàm dùng chung cho cung đường — dùng bởi seed script VÀ luồng admin duyệt GPX.
 * (Tách từ seed.ts để không trùng lặp logic.)
 */

/** Bỏ dấu tiếng Việt → slug URL */
export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Ước tính thời gian theo Naismith: 4km/h + 1h mỗi 600m leo (phút) */
export function estimateMinutes(distanceM: number, ascentM: number): number {
  return Math.round((distanceM / 4000) * 60 + (ascentM / 600) * 60);
}

/** Phân loại độ khó sơ bộ theo tổng leo/cự ly — admin hiệu chỉnh sau */
export function classifyDifficulty(
  ascentM: number,
  distanceM: number,
): 'easy' | 'standard' | 'hard' {
  if (ascentM > 1800 || distanceM > 20000) return 'hard';
  if (ascentM > 800 || distanceM > 10000) return 'standard';
  return 'easy';
}
