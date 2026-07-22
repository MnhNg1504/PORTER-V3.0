import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async getProfile(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  /** Cộng/trừ điểm uy tín theo docs/04 (thang 0–1000); tự động đề xuất thăng cấp ở GĐ sau */
  async addReputation(id: string, delta: number) {
    await this.users
      .createQueryBuilder()
      .update()
      .set({ reputation: () => `LEAST(1000, GREATEST(0, reputation + ${Math.trunc(delta)}))` })
      .where('id = :id', { id })
      .execute();
    return this.getProfile(id);
  }
}
