import 'reflect-metadata';
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity';
import { TrekRoute } from '../routes/route.entity';
import { GpxSubmission } from '../gpx/gpx-submission.entity';
import { Purchase } from '../purchases/purchase.entity';
import { Report } from '../moderation/report.entity';
import { UserBlock } from '../moderation/user-block.entity';
import { Conversation, Message } from '../chat/chat.entities';
import { DeviceToken } from '../notifications/device-token.entity';
import { RouteCheckpoint, Completion, CheckpointEvidence } from '../completions/completions.entities';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'potter',
  password: process.env.DB_PASSWORD ?? 'potter_dev_only',
  database: process.env.DB_NAME ?? 'potter',
  entities: [User, TrekRoute, GpxSubmission, Purchase, Report, UserBlock, Conversation, Message, DeviceToken, RouteCheckpoint, Completion, CheckpointEvidence],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: false, // LUÔN dùng migration (checklist §4)
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
};

// DataSource cho CLI: npm run migration:run / seed
export default new DataSource(dataSourceOptions);
