import { ForbiddenException } from '@nestjs/common';
import { ChatService } from '../chat.service';

/**
 * Mock 3 repo (Conversation/Message/UserBlock) bằng object literal.
 * `blockRow` mô phỏng kết quả query bảng user_blocks: null = không chặn.
 */
function makeSvc(opts: { conv?: any; msg?: any; blockRow?: any } = {}) {
  const convs = { findOne: jest.fn(async () => opts.conv ?? null) };
  const msgs = {
    findOne: jest.fn(async () => opts.msg ?? null),
    create: jest.fn((x: any) => x),
    save: jest.fn(async (x: any) => ({ id: 'm-new', ...x })),
  };
  const blocks = {
    createQueryBuilder: jest.fn(() => ({
      where() { return this; },
      getOne: async () => opts.blockRow ?? null,
    })),
  };
  return { convs, msgs, blocks, svc: new ChatService(convs as any, msgs as any, blocks as any) };
}

const DIRECT_CONV = { id: 'c1', type: 'direct', memberIds: ['user-a', 'user-b'] };

describe('ChatService.recall — thu hồi tin nhắn (checklist §6)', () => {
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

  it('quá 30 phút → ForbiddenException', async () => {
    const { svc } = makeSvc({
      msg: { id: 'm1', sender: { id: 'user-a' }, conversation: DIRECT_CONV, createdAt: minutesAgo(31), content: 'x' },
    });
    await expect(svc.recall('m1', 'user-a')).rejects.toBeInstanceOf(ForbiddenException);
    await expect(svc.recall('m1', 'user-a')).rejects.toThrow(/30 phút/);
  });

  it('người khác thu hồi (không phải người gửi) → ForbiddenException', async () => {
    const { svc, msgs } = makeSvc({
      msg: { id: 'm1', sender: { id: 'user-a' }, conversation: DIRECT_CONV, createdAt: minutesAgo(1), content: 'x' },
    });
    await expect(svc.recall('m1', 'user-b')).rejects.toBeInstanceOf(ForbiddenException);
    expect(msgs.save).not.toHaveBeenCalled();
  });

  it('trong hạn + đúng người gửi → recalled=true, content bị xoá', async () => {
    const { svc, msgs } = makeSvc({
      msg: { id: 'm1', sender: { id: 'user-a' }, conversation: DIRECT_CONV, createdAt: minutesAgo(29), content: 'bi mat' },
    });
    const out = await svc.recall('m1', 'user-a');
    expect(out.recalled).toBe(true);
    expect(out.content).toBe('');
    expect(msgs.save).toHaveBeenCalledTimes(1);
  });
});

describe('ChatService.send — block-aware (checklist §6)', () => {
  it('2 bên có block (bất kỳ chiều nào) → ForbiddenException, KHÔNG lưu tin', async () => {
    const { svc, msgs } = makeSvc({
      conv: DIRECT_CONV,
      blockRow: { id: 'bl1', blockerId: 'user-b', blockedId: 'user-a' },
    });
    await expect(svc.send('c1', 'user-a', 'alo')).rejects.toBeInstanceOf(ForbiddenException);
    expect(msgs.save).not.toHaveBeenCalled();
  });

  it('không block → lưu tin nhắn (trim + cắt 4000 ký tự)', async () => {
    const { svc, msgs } = makeSvc({ conv: DIRECT_CONV, blockRow: null });
    await svc.send('c1', 'user-a', '  chào bạn  ');
    expect(msgs.save).toHaveBeenCalledTimes(1);
    const saved = msgs.create.mock.calls[0][0];
    expect(saved.content).toBe('chào bạn');
  });

  it('không phải thành viên hội thoại → ForbiddenException', async () => {
    const { svc } = makeSvc({ conv: DIRECT_CONV });
    await expect(svc.send('c1', 'user-la', 'xin vao')).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('ChatService.createDirect — chặn tạo hội thoại khi có block', () => {
  it('có block → ForbiddenException', async () => {
    const { svc } = makeSvc({ blockRow: { id: 'bl1' } });
    await expect(svc.createDirect('user-a', 'user-b')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
