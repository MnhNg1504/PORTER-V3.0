export { colors, type, space, radius, sizing, shadow } from './tokens';

// Helper: nhãn & màu theo độ khó cung (dùng ở Route Card, chi tiết cung).
import { colors } from './tokens';

export type Difficulty = 'easy' | 'standard' | 'hard';

export const difficultyMeta: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Dễ', color: colors.success },
  standard: { label: 'Chuẩn', color: colors.warning },
  hard: { label: 'Khó', color: colors.danger },
};
