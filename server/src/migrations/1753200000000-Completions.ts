import { MigrationInterface, QueryRunner } from 'typeorm';

/** Checkpoint + xác minh hoàn thành cung (docs/08) */
export class Completions1753200000000 implements MigrationInterface {
  name = 'Completions1753200000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE "route_checkpoints" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "route_id" uuid NOT NULL REFERENCES "trek_routes"("id") ON DELETE CASCADE,
      "orderIdx" int NOT NULL,
      "point" geometry(Point,4326) NOT NULL,
      "eleM" int,
      "kind" varchar NOT NULL DEFAULT 'check',
      "photoUrl" varchar,
      "note" varchar,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX "idx_checkpoints_route" ON "route_checkpoints" ("route_id")`);
    await q.query(`CREATE INDEX "idx_checkpoints_point" ON "route_checkpoints" USING GIST ("point")`);

    await q.query(`CREATE TABLE "completions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "route_id" uuid NOT NULL REFERENCES "trek_routes"("id") ON DELETE CASCADE,
      "status" varchar NOT NULL DEFAULT 'active',
      "verifyScore" real,
      "certified" boolean NOT NULL DEFAULT false,
      "startedAt" timestamptz NOT NULL DEFAULT now(),
      "finishedAt" timestamptz
    )`);
    await q.query(`CREATE INDEX "idx_completions_user" ON "completions" ("user_id")`);
    await q.query(`CREATE INDEX "idx_completions_route" ON "completions" ("route_id")`);

    await q.query(`CREATE TABLE "checkpoint_evidences" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "completion_id" uuid NOT NULL REFERENCES "completions"("id") ON DELETE CASCADE,
      "checkpoint_id" uuid REFERENCES "route_checkpoints"("id") ON DELETE SET NULL,
      "photoKey" varchar NOT NULL,
      "lat" double precision NOT NULL,
      "lon" double precision NOT NULL,
      "eleM" int,
      "accuracyM" real,
      "capturedAt" timestamptz NOT NULL,
      "verdict" varchar NOT NULL,
      "reason" varchar,
      "dCheckpointM" real,
      "dRouteM" real,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX "idx_evidences_completion" ON "checkpoint_evidences" ("completion_id")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const t of ['checkpoint_evidences', 'completions', 'route_checkpoints']) {
      await q.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
    }
  }
}
