import {
  buildForecastUrl, parseOpenMeteo, wmoInfo, assessTrekSafety, fetchRouteWeather, DailyWeather,
} from '../weather';

/**
 * Response THẬT từ Open-Meteo (capture 2026-07-22, toạ độ Tà Xùa 21.24,104.42) —
 * dùng làm contract test: nếu parse sai shape thật thì test đỏ.
 */
const REAL_RESPONSE = {
  latitude: 21.195078, longitude: 104.37437, elevation: 510.0,
  utc_offset_seconds: 25200, timezone: 'Asia/Bangkok',
  current_units: { temperature_2m: '°C', precipitation: 'mm', wind_speed_10m: 'km/h' },
  current: {
    time: '2026-07-22T15:30', interval: 900, temperature_2m: 28.9,
    precipitation: 0.0, weather_code: 3, wind_speed_10m: 7.9, is_day: 1,
  },
  daily: {
    time: ['2026-07-22', '2026-07-23', '2026-07-24'],
    temperature_2m_min: [23.1, 22.4, 22.3],
    temperature_2m_max: [29.1, 30.0, 28.0],
    precipitation_sum: [1.0, 4.6, 6.6],
    precipitation_probability_max: [100, 96, 95],
    weather_code: [51, 80, 55],
    wind_speed_10m_max: [8.8, 8.8, 10.9],
  },
};

describe('buildForecastUrl', () => {
  it('đủ tham số current/daily/timezone', () => {
    const u = new URL(buildForecastUrl(21.447808, 104.353528, { days: 7 }));
    expect(u.origin).toBe('https://api.open-meteo.com');
    expect(u.searchParams.get('latitude')).toBe('21.44781');
    expect(u.searchParams.get('current')).toContain('weather_code');
    expect(u.searchParams.get('daily')).toContain('precipitation_probability_max');
    expect(u.searchParams.get('timezone')).toBe('Asia/Bangkok');
    expect(u.searchParams.get('forecast_days')).toBe('7');
  });

  it('truyền elevation làm tròn cho vùng núi', () => {
    const u = new URL(buildForecastUrl(21.4, 104.3, { elevation: 1512.7 }));
    expect(u.searchParams.get('elevation')).toBe('1513');
  });

  it('kẹp days trong [1..16]', () => {
    expect(new URL(buildForecastUrl(0, 0, { days: 99 })).searchParams.get('forecast_days')).toBe('16');
    expect(new URL(buildForecastUrl(0, 0, { days: 0 })).searchParams.get('forecast_days')).toBe('1');
  });
});

describe('parseOpenMeteo (contract với response thật)', () => {
  const w = parseOpenMeteo(REAL_RESPONSE);

  it('current đúng giá trị thật', () => {
    expect(w.current.tempC).toBe(28.9);
    expect(w.current.code).toBe(3);
    expect(w.current.isDay).toBe(true);
    expect(w.elevation).toBe(510);
  });

  it('daily map đủ 3 ngày, đúng thứ tự field', () => {
    expect(w.daily).toHaveLength(3);
    expect(w.daily[1]).toEqual({
      date: '2026-07-23', tMinC: 22.4, tMaxC: 30.0, precipSumMm: 4.6,
      precipProbMax: 96, code: 80, windMaxKmh: 8.8,
    });
  });

  it('ném lỗi khi thiếu daily', () => {
    expect(() => parseOpenMeteo({ current: REAL_RESPONSE.current })).toThrow(/thiếu/);
  });

  it('precipitation_probability_max null -> 0 (API trả null ngoài 16 ngày)', () => {
    const clone = JSON.parse(JSON.stringify(REAL_RESPONSE));
    clone.daily.precipitation_probability_max = [null, null, null];
    expect(parseOpenMeteo(clone).daily[0].precipProbMax).toBe(0);
  });
});

describe('wmoInfo', () => {
  it('mã chuẩn: 0 quang / 95 giông danger', () => {
    expect(wmoInfo(0).severity).toBe('ok');
    expect(wmoInfo(95).severity).toBe('danger');
    expect(wmoInfo(95).label).toContain('Giông');
  });
  it('mã lạ -> caution (an toàn hơn là tiếc)', () => {
    expect(wmoInfo(42).severity).toBe('caution');
  });
});

describe('assessTrekSafety', () => {
  const day = (over: Partial<DailyWeather>): DailyWeather => ({
    date: '2026-07-23', tMinC: 20, tMaxC: 28, precipSumMm: 0,
    precipProbMax: 10, code: 1, windMaxKmh: 10, ...over,
  });

  it('trời đẹp -> ok', () => {
    expect(assessTrekSafety([day({}), day({}), day({})]).level).toBe('ok');
  });

  it('giông (code 95) -> danger + khuyến cáo không đi', () => {
    const r = assessTrekSafety([day({}), day({ code: 95 })]);
    expect(r.level).toBe('danger');
    expect(r.message).toContain('KHÔNG nên đi');
  });

  it('mưa ngày >30mm -> danger dù code nhẹ', () => {
    expect(assessTrekSafety([day({ precipSumMm: 45, code: 61 })]).level).toBe('danger');
  });

  it('gió >60km/h -> danger', () => {
    expect(assessTrekSafety([day({ windMaxKmh: 75 })]).level).toBe('danger');
  });

  it('xác suất mưa cao -> caution', () => {
    expect(assessTrekSafety([day({ precipProbMax: 85 })]).level).toBe('caution');
  });

  it('ngoài horizon không tính (ngày 4 giông nhưng chỉ xét 3)', () => {
    const r = assessTrekSafety([day({}), day({}), day({}), day({ code: 95 })], 3);
    expect(r.level).toBe('ok');
  });
});

describe('fetchRouteWeather', () => {
  it('gọi đúng URL + parse (fetch mock)', async () => {
    const spy = jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: true,
      json: async () => REAL_RESPONSE,
    } as never);
    const w = await fetchRouteWeather(21.447808, 104.353528, { elevation: 1500 });
    expect(w.current.tempC).toBe(28.9);
    const calledUrl = String(spy.mock.calls[0][0]);
    expect(calledUrl).toContain('elevation=1500');
    spy.mockRestore();
  });

  it('HTTP lỗi -> throw', async () => {
    const spy = jest.spyOn(global, 'fetch' as never).mockResolvedValue({ ok: false, status: 500 } as never);
    await expect(fetchRouteWeather(0, 0)).rejects.toThrow('HTTP 500');
    spy.mockRestore();
  });
});
