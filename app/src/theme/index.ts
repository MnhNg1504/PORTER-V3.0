export {
  colors, darkColors, brandPalette, fonts, type, space, radius, sizing, shadow,
} from './tokens';

// Helper: nhãn & màu theo độ khó cung (Route Card, chi tiết cung).
// Màu theo brand PORTER: Dễ = forest, Chuẩn = gold, Khó = Ember.
import { colors } from './tokens';

export type Difficulty = 'easy' | 'standard' | 'hard';

export const difficultyMeta: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Dễ', color: colors.success },
  standard: { label: 'Chuẩn', color: colors.warning },
  hard: { label: 'Khó', color: colors.danger },
};

// Logo/mark thương hiệu (PNG từ bộ nhận diện) — chọn theo nền:
// nền Cream → logo-pine; nền Pine/tối → logo-cream hoặc logo-lime.
export const brandAssets = {
  logoPine: require('../../assets/brand/logo-pine.png'),
  logoCream: require('../../assets/brand/logo-cream.png'),
  logoLime: require('../../assets/brand/logo-lime.png'),
  markPine: require('../../assets/brand/mark-pine.png'),
  markCream: require('../../assets/brand/mark-cream.png'),
  markLime: require('../../assets/brand/mark-lime.png'),
} as const;
