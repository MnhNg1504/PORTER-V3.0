import { BadRequestException } from '@nestjs/common';
import {
  MediaService, MAX_UPLOAD_BYTES, sniffImageType, validateImageUpload,
} from '../media.service';

/** Buffer mẫu đúng magic bytes từng định dạng */
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP = Buffer.concat([
  Buffer.from('RIFF', 'ascii'),
  Buffer.from([0x24, 0x00, 0x00, 0x00]), // size (giả)
  Buffer.from('WEBPVP8 ', 'ascii'),
]);
const TEXT = Buffer.from('day khong phai anh', 'utf8');

describe('sniffImageType — magic bytes', () => {
  it('FFD8 → jpeg, 89504E47 → png, RIFF..WEBP → webp', () => {
    expect(sniffImageType(JPEG)).toBe('image/jpeg');
    expect(sniffImageType(PNG)).toBe('image/png');
    expect(sniffImageType(WEBP)).toBe('image/webp');
  });

  it('file text / RIFF nhưng không phải WEBP (vd .wav) → null', () => {
    expect(sniffImageType(TEXT)).toBeNull();
    const wav = Buffer.concat([
      Buffer.from('RIFF', 'ascii'),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from('WAVE', 'ascii'),
    ]);
    expect(sniffImageType(wav)).toBeNull();
    expect(sniffImageType(Buffer.alloc(0))).toBeNull();
  });
});

describe('validateImageUpload', () => {
  it('hợp lệ → trả đuôi an toàn theo mimetype', () => {
    expect(validateImageUpload(JPEG, 'image/jpeg', JPEG.length)).toBe('.jpg');
    expect(validateImageUpload(PNG, 'image/png', PNG.length)).toBe('.png');
    expect(validateImageUpload(WEBP, 'image/webp', WEBP.length)).toBe('.webp');
  });

  it('mimetype ngoài whitelist (gif/pdf/svg) → BadRequestException', () => {
    expect(() => validateImageUpload(TEXT, 'image/gif', 10)).toThrow(BadRequestException);
    expect(() => validateImageUpload(TEXT, 'application/pdf', 10)).toThrow(BadRequestException);
    expect(() => validateImageUpload(TEXT, 'image/svg+xml', 10)).toThrow(BadRequestException);
  });

  it('khai png nhưng ruột jpeg (giả mạo mimetype) → BadRequestException', () => {
    expect(() => validateImageUpload(JPEG, 'image/png', JPEG.length)).toThrow(BadRequestException);
    expect(() => validateImageUpload(TEXT, 'image/jpeg', TEXT.length)).toThrow(/không khớp/);
  });

  it('quá 10MB → BadRequestException', () => {
    expect(() => validateImageUpload(JPEG, 'image/jpeg', MAX_UPLOAD_BYTES + 1)).toThrow(/10MB/);
  });
});

describe('MediaService.upload — qua StoragePort (mock)', () => {
  const storage = { save: jest.fn(async (_b: Buffer, ext: string) => ({ url: `http://x/u${ext}`, key: `u${ext}` })) };
  const svc = new MediaService(storage as any);

  beforeEach(() => storage.save.mockClear());

  it('file jpeg hợp lệ → gọi storage.save với đuôi .jpg, trả {url, key}', async () => {
    const out = await svc.upload({ buffer: JPEG, mimetype: 'image/jpeg', size: JPEG.length } as any);
    expect(storage.save).toHaveBeenCalledWith(JPEG, '.jpg');
    expect(out).toEqual({ url: 'http://x/u.jpg', key: 'u.jpg' });
  });

  it('thiếu file → BadRequestException, không đụng storage', async () => {
    await expect(svc.upload(undefined)).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('file giả mạo → BadRequestException, không lưu', async () => {
    await expect(
      svc.upload({ buffer: TEXT, mimetype: 'image/png', size: TEXT.length } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.save).not.toHaveBeenCalled();
  });
});
