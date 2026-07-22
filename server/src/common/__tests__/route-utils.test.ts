import { slugify, classifyDifficulty, estimateMinutes } from '../route-utils';

describe('slugify — bỏ dấu tiếng Việt → slug URL', () => {
  it('bỏ dấu + đ→d + dấu câu → gạch nối', () => {
    expect(slugify('Tà Xùa – Sống lưng')).toBe('ta-xua-song-lung');
    expect(slugify('Đèo Ô Quy Hồ')).toBe('deo-o-quy-ho');
    expect(slugify('Fansipan 3.143m')).toBe('fansipan-3-143m');
  });

  it('không để gạch nối thừa đầu/cuối', () => {
    expect(slugify('  Lảo Thẩn!  ')).toBe('lao-than');
    expect(slugify('---')).toBe('');
  });
});

describe('classifyDifficulty — biên 800/1800m leo, 10/20km', () => {
  it('biên tổng leo: 800 = easy, 801 = standard, 1800 = standard, 1801 = hard', () => {
    expect(classifyDifficulty(800, 0)).toBe('easy');
    expect(classifyDifficulty(801, 0)).toBe('standard');
    expect(classifyDifficulty(1800, 0)).toBe('standard');
    expect(classifyDifficulty(1801, 0)).toBe('hard');
  });

  it('biên cự ly: 10km = easy, >10km = standard, >20km = hard', () => {
    expect(classifyDifficulty(0, 10_000)).toBe('easy');
    expect(classifyDifficulty(0, 10_001)).toBe('standard');
    expect(classifyDifficulty(0, 20_000)).toBe('standard');
    expect(classifyDifficulty(0, 20_001)).toBe('hard');
  });

  it('chỉ cần MỘT tiêu chí vượt là lên hạng', () => {
    expect(classifyDifficulty(2000, 5000)).toBe('hard'); // leo nhiều, cự ly ngắn
    expect(classifyDifficulty(100, 25_000)).toBe('hard'); // leo ít, cự ly dài
  });
});

describe('estimateMinutes — Naismith 4km/h + 1h/600m leo', () => {
  it('4km phẳng = 60 phút', () => {
    expect(estimateMinutes(4000, 0)).toBe(60);
  });

  it('8km + 600m leo = 120 + 60 = 180 phút', () => {
    expect(estimateMinutes(8000, 600)).toBe(180);
  });

  it('cỡ Fansipan 24km + 3264m leo = 360 + 326.4 → 686 phút', () => {
    expect(estimateMinutes(24_000, 3264)).toBe(686);
  });

  it('0m = 0 phút', () => {
    expect(estimateMinutes(0, 0)).toBe(0);
  });
});
