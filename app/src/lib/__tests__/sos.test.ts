import {
  mapsLink, speakableCoords, formatSosMessage, formatShareMessage, smsUrl, telUrl, EMERGENCY_NUMBERS,
} from '../sos';

const POS = { lat: 21.447808, lon: 104.353528, ele: 1512, accuracy: 8 };

describe('mapsLink', () => {
  it('link Google Maps 6 chữ số thập phân', () => {
    expect(mapsLink(POS)).toBe('https://maps.google.com/?q=21.447808,104.353528');
  });
});

describe('speakableCoords', () => {
  it('kèm độ cao khi có', () => {
    expect(speakableCoords(POS)).toBe('21.447808, 104.353528, cao ~1512m');
  });
  it('bỏ độ cao khi thiếu', () => {
    expect(speakableCoords({ lat: 21.4, lon: 104.3 })).toBe('21.400000, 104.300000');
  });
});

describe('formatSosMessage', () => {
  const msg = formatSosMessage(POS, { name: 'Nao Chi', routeName: 'Tà Xùa' });

  it('đủ: SOS + tên + cung + toạ độ + sai số + link maps', () => {
    expect(msg).toContain('SOS!');
    expect(msg).toContain('Tôi là Nao Chi');
    expect(msg).toContain('cung Tà Xùa');
    expect(msg).toContain('21.447808, 104.353528');
    expect(msg).toContain('sai số ~8m');
    expect(msg).toContain('https://maps.google.com/?q=21.447808,104.353528');
  });

  it('gọn khi không có tên/cung/sai số', () => {
    const m = formatSosMessage({ lat: 21.4, lon: 104.3 });
    expect(m).toContain('SOS!');
    expect(m).not.toContain('Tôi là');
    expect(m).not.toContain('sai số');
  });

  it('đủ ngắn cho 2 SMS segment (~300 ký tự)', () => {
    expect(msg.length).toBeLessThan(300);
  });
});

describe('formatShareMessage', () => {
  it('không có chữ SOS (tránh báo động nhầm)', () => {
    const m = formatShareMessage(POS, 'Tà Xùa');
    expect(m).not.toContain('SOS');
    expect(m).toContain('cung Tà Xùa');
    expect(m).toContain(mapsLink(POS));
  });
});

describe('smsUrl — khác biệt nền tảng THẬT (iOS & vs Android ?)', () => {
  it('iOS dùng &body=', () => {
    expect(smsUrl('0912345678', 'hello', 'ios')).toBe('sms:0912345678&body=hello');
  });
  it('Android dùng ?body=', () => {
    expect(smsUrl('0912345678', 'xin chào', 'android')).toBe('sms:0912345678?body=xin%20ch%C3%A0o');
  });
});

describe('telUrl + EMERGENCY_NUMBERS', () => {
  it('có đủ 112/115/113', () => {
    expect(EMERGENCY_NUMBERS.map((e) => e.number)).toEqual(['112', '115', '113']);
    expect(telUrl('112')).toBe('tel:112');
  });
});
