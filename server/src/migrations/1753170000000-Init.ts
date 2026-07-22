import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schema khởi tạo POTTER 3.0 (checklist §4: chuẩn, index, quan hệ rõ ràng).
 * Geometry THẬT: PostGIS LineStringZ/Point SRID 4326. Tên cột camelCase khớp entity.
 */
export class Init1753170000000 implements MigrationInterface {
  name = 'Init1753170000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    await q.query(`CREATE TABLE "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "email" varchar NOT NULL,
      "passwordHash" varchar NOT NULL,
      "displayName" varchar NOT NULL,
      "avatarUrl" varchar,
      "role" varchar NOT NULL DEFAULT 'user',
      "tier" int NOT NULL DEFAULT 1,
      "reputation" int NOT NULL DEFAULT 0,
      "emailVerified" boolean NOT NULL DEFAULT false,
      "refreshTokenHash" varchar,
      "failedLoginCount" int NOT NULL DEFAULT 0,
      "lockedUntil" timestamptz,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE UNIQUE INDEX "idx_users_email" ON "users" ("email")`);

    await q.query(`CREATE TABLE "trek_routes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "difficulty" varchar NOT NULL,
      "geom" geometry(LineStringZ,4326) NOT NULL,
      "startPoint" geometry(Point,4326) NOT NULL,
      "startPhotoUrl" varchar,
      "distanceM" int NOT NULL,
      "ascentM" int NOT NULL,
      "descentM" int NOT NULL,
      "maxEleM" int NOT NULL,
      "minEleM" int NOT NULL,
      "durationEstMin" int NOT NULL,
      "season" varchar,
      "priceVnd" bigint NOT NULL DEFAULT 0,
      "seller_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "status" varchar NOT NULL DEFAULT 'published',
      "savedCount" int NOT NULL DEFAULT 0,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE UNIQUE INDEX "idx_routes_slug" ON "trek_routes" ("slug")`);
    await q.query(`CREATE INDEX "idx_routes_name" ON "trek_routes" ("name")`);
    await q.query(`CREATE INDEX "idx_routes_geom" ON "trek_routes" USING GIST ("geom")`);
    await q.query(`CREATE INDEX "idx_routes_start" ON "trek_routes" USING GIST ("startPoint")`);

    await q.query(`CREATE TABLE "gpx_submissions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "routeName" varchar NOT NULL,
      "rawGpx" text NOT NULL,
      "pointCount" int NOT NULL,
      "distanceM" int NOT NULL,
      "status" varchar NOT NULL DEFAULT 'pending',
      "reviewNote" varchar,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX "idx_gpx_status" ON "gpx_submissions" ("status")`);

    await q.query(`CREATE TABLE "purchases" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "buyer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "route_id" uuid NOT NULL REFERENCES "trek_routes"("id") ON DELETE CASCADE,
      "priceVnd" bigint NOT NULL,
      "status" varchar NOT NULL DEFAULT 'pending',
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "uq_purchase_buyer_route" UNIQUE ("buyer_id","route_id")
    )`);

    await q.query(`CREATE TABLE "reports" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "reporter_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "targetType" varchar NOT NULL,
      "targetId" uuid NOT NULL,
      "reason" varchar NOT NULL,
      "status" varchar NOT NULL DEFAULT 'open',
      "resolutionNote" varchar,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX "idx_reports_status" ON "reports" ("status")`);

    await q.query(`CREATE TABLE "user_blocks" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "blocker_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "blocked_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "uq_block_pair" UNIQUE ("blocker_id","blocked_id")
    )`);

    await q.query(`CREATE TABLE "conversations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "type" varchar NOT NULL DEFAULT 'direct',
      "title" varchar,
      "memberIds" uuid[] NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);

    await q.query(`CREATE TABLE "messages" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "conversation_id" uuid NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
      "sender_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "content" text NOT NULL,
      "recalled" boolean NOT NULL DEFAULT false,
      "seenBy" uuid[] NOT NULL DEFAULT '{}',
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX "idx_messages_conv" ON "messages" ("conversation_id")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const t of ['messages','conversations','user_blocks','reports','purchases','gpx_submissions','trek_routes','users']) {
      await q.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
    }
  }
}
