/**
 * POTTER 3.0 — Thời tiết THẬT tại điểm xuất phát cung (checklist §5 "Báo thời tiết").
 * Nguồn: Open-Meteo (https://open-meteo.com) — miễn phí, KHÔNG cần API key, dữ liệu thật.
 * Shape response đã verify bằng gọi thật ngày 2026-07-22 (xem __tests__/weather.test.ts).
 *
 * Lưu ý núi cao: truyền `elevation` (độ cao điểm xuất phát, từ GPX) để Open-Meteo
 * downscale nhiệt độ theo độ cao thật thay vì độ cao ô lưới (~11km).
 */

// ---- Kiểu dữ liệu ----
export type WeatherSeverity = 'ok' | 'caution' | 'danger';

export interface WeatherInfo {
  label: string; // nhãn tiếng Việt
  emoji: string;
  severity: WeatherSeverity;
}

export interface CurrentWeather {
  time: string;
  tempC: number;
  precipMm: number;
  code: number;
  windKmh: number;
  isDay: boolean;
}

export interface DailyWeather {
  date: string; // YYYY-MM-DD
  tMinC: number;
  tMaxC: number;
  precipSumMm: number;
  precipProbMax: number; // %
  code: number;
  windMaxKmh: number;
}

export interface RouteWeather {
  elevation: number; // độ cao mô hình dùng để tính (m)
  current: CurrentWeather;
  daily: DailyWeather[];
}

// ---- WMO weather code -> nhãn VN (https://open-meteo.com/en/docs #weathercode) ----
const WMO: Record<number, WeatherInfo> = {
  0: { label: 'Trời quang', emoji: '☀️', severity: 'ok' },
  1: { label: 'Nắng nhẹ', emoji: '🌤️', severity: 'ok' },
  2: { label: 'Mây rải rác', emoji: '⛅', severity: 'ok' },
  3: { label: 'Nhiều mây', emoji: '☁️', severity: 'ok' },
  45: { label: 'Sương mù', emoji: '🌫️', severity: 'caution' },
  48: { label: 'Sương muối', emoji: '🌫️', severity: 'caution' },
  51: { label: 'Mưa phùn nhẹ', emoji: '🌦️', severity: 'ok' },
  53: { label: 'Mưa phùn', emoji: '🌦️', severity: 'caution' },
  55: { label: 'Mưa phùn dày', emoji: '🌧️', severity: 'caution' },
  61: { label: 'Mưa nhỏ', emoji: '🌧️', severity: 'caution' },
  63: { label: 'Mưa vừa', emoji: '🌧️', severity: 'caution' },
  65: { label: 'Mưa to', emoji: '🌧️', severity: 'danger' },
  66: { label: 'Mưa băng nhẹ', emoji: '🌨️', severity: 'danger' },
  67: { label: 'Mưa băng', emoji: '🌨️', severity: 'danger' },
  71: { label: 'Tuyết nhẹ', emoji: '🌨️', severity: 'caution' },
  73: { label: 'Tuyết vừa', emoji: '🌨️', severity: 'danger' },
  75: { label: 'Tuyết dày', emoji: '❄️', severity: 'danger' },
  77: { label: 'Hạt tuyết', emoji: '❄️', severity: 'caution' },
  80: { label: 'Mưa rào nhẹ', emoji: '🌦️', severity: 'caution' },
  81: { label: 'Mưa rào', emoji: '🌧️', severity: 'caution' },
  82: { label: 'Mưa rào dữ dội', emoji: '⛈️', severity: 'danger' },
  85: { label: 'Mưa tuyết nhẹ', emoji: '🌨️', severity: 'caution' },
  86: { label: 'Mưa tuyết dày', emoji: '❄️', severity: 'danger' },
  95: { label: 'Giông bão', emoji: '⛈️', severity: 'danger' },
  96: { label: 'Giông kèm mưa đá', emoji: '⛈️', severity: 'danger' },
  99: { label: 'Giông mưa đá nặng', emoji: '⛈️', severity: 'danger' },
};

export function wmoInfo(code: number): WeatherInfo {
  return WMO[code] ?? { label: `Mã thời tiết ${code}`, emoji: '❓', severity: 'caution' };
}

// ---- URL builder (thuần — test được, không gọi mạng) ----
export function buildForecastUrl(
  lat: number,
  lon: number,
  opts: { days?: number; elevation?: number } = {},
): string {
  const days = Math.min(Math.max(opts.days ?? 7, 1), 16);
  const p = new URLSearchParams({
    latitude: lat.toFixed(5),
    longitude: lon.toFixed(5),
    current: 'temperature_2m,precipitation,weather_code,wind_speed_10m,is_day',
    daily: [
      'temperature_2m_min', 'temperature_2m_max', 'precipitation_sum',
      'precipitation_probability_max', 'weather_code', 'wind_speed_10m_max',
    ].join(','),
    timezone: 'Asia/Bangkok',
    forecast_days: String(days),
  });
  if (opts.elevation != null && Number.isFinite(opts.elevation)) {
    p.set('elevation', String(Math.round(opts.elevation)));
  }
  return `https://api.open-meteo.com/v1/forecast?${p.toString()}`;
}

// ---- Parse (thuần — shape theo response thật đã verify) ----
export function parseOpenMeteo(json: unknown): RouteWeather {
  const j = json as {
    elevation?: number;
    current?: {
      time: string; temperature_2m: number; precipitation: number;
      weather_code: number; wind_speed_10m: number; is_day: number;
    };
    daily?: {
      time: string[]; temperature_2m_min: number[]; temperature_2m_max: number[];
      precipitation_sum: number[]; precipitation_probability_max: (number | null)[];
      weather_code: number[]; wind_speed_10m_max: number[];
    };
  };
  if (!j || !j.current || !j.daily?.time?.length) {
    throw new Error('Open-Meteo: response thiếu current/daily');
  }
  return {
    elevation: j.elevation ?? 0,
    current: {
      time: j.current.time,
      tempC: j.current.temperature_2m,
      precipMm: j.current.precipitation,
      code: j.current.weather_code,
      windKmh: j.current.wind_speed_10m,
      isDay: j.current.is_day === 1,
    },
    daily: j.daily.time.map((date, i) => ({
      date,
      tMinC: j.daily!.temperature_2m_min[i],
      tMaxC: j.daily!.temperature_2m_max[i],
      precipSumMm: j.daily!.precipitation_sum[i],
      precipProbMax: j.daily!.precipitation_probability_max[i] ?? 0,
      code: j.daily!.weather_code[i],
      windMaxKmh: j.daily!.wind_speed_10m_max[i],
    })),
  };
}

/** Gọi thời tiết thật cho điểm xuất phát cung. Ném lỗi khi mạng/HTTP fail — UI tự xử lý. */
export async function fetchRouteWeather(
  lat: number,
  lon: number,
  opts: { days?: number; elevation?: number } = {},
): Promise<RouteWeather> {
  const res = await fetch(buildForecastUrl(lat, lon, opts));
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  return parseOpenMeteo(await res.json());
}

// ---- Đánh giá an toàn trekking (docs/04 — cảnh báo rủi ro theo thời tiết) ----
export interface TrekSafety {
  level: WeatherSeverity;
  message: string;
}

/**
 * Quy tắc thận trọng (an toàn hơn là tiếc):
 * - danger nếu bất kỳ ngày nào trong `horizonDays` có code danger, mưa ngày >30mm
 *   hoặc gió giật >60km/h.
 * - caution nếu có code caution hoặc xác suất mưa >70%.
 */
export function assessTrekSafety(daily: DailyWeather[], horizonDays = 3): TrekSafety {
  const window = daily.slice(0, horizonDays);
  let level: WeatherSeverity = 'ok';
  let worst: DailyWeather | null = null;

  for (const d of window) {
    const sev = wmoInfo(d.code).severity;
    const heavyRain = d.precipSumMm > 30;
    const strongWind = d.windMaxKmh > 60;
    if (sev === 'danger' || heavyRain || strongWind) {
      level = 'danger';
      worst = d;
      break;
    }
    if ((sev === 'caution' || d.precipProbMax > 70) && level === 'ok') {
      level = 'caution';
      worst = d;
    }
  }

  if (level === 'danger' && worst) {
    return {
      level,
      message: `⛔ ${worst.date}: ${wmoInfo(worst.code).label}, mưa ${worst.precipSumMm}mm — KHÔNG nên đi cung. Sạt lở & lũ suối rất nguy hiểm.`,
    };
  }
  if (level === 'caution' && worst) {
    return {
      level,
      message: `⚠️ ${worst.date}: ${wmoInfo(worst.code).label} (mưa ${worst.precipProbMax}%) — chuẩn bị áo mưa, giày bám, cân nhắc lùi lịch.`,
    };
  }
  return { level: 'ok', message: '✅ Thời tiết 3 ngày tới thuận lợi cho trekking.' };
}
