import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XMLParser } from 'fast-xml-parser';
import { GpxSubmission } from './gpx-submission.entity';
import { User } from '../users/user.entity';

interface GpxPoint { lat: number; lon: number; ele: number | null }

/** Parse + validate GPX thật (trkpt hoặc rtept) — cùng logic app/src/lib/gpx.ts */
export function parseGpx(raw: string): GpxPoint[] {
  const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' }).parse(raw);
  const gpx = xml?.gpx;
  if (!gpx) throw new BadRequestException('File không phải GPX hợp lệ');
  const tracks = [gpx.trk].flat().filter(Boolean);
  let pts: any[] = tracks.flatMap((t: any) =>
    [t?.trkseg].flat().filter(Boolean).flatMap((s: any) => [s?.trkpt].flat().filter(Boolean)),
  );
  if (!pts.length) pts = [[gpx.rte].flat().filter(Boolean)].flat().flatMap((r: any) => [r?.rtept].flat().filter(Boolean));
  const out: GpxPoint[] = pts
    .map((p: any) => ({
      lat: Number(p['@_lat']),
      lon: Number(p['@_lon']),
      ele: p.ele != null ? Number(p.ele) : null,
    }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
  if (out.length < 2) throw new BadRequestException('GPX không có điểm track hợp lệ');
  return out;
}

export function haversineM(a: GpxPoint, b: GpxPoint): number {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function trackStats(pts: GpxPoint[]) {
  let dist = 0, up = 0, down = 0;
  const eles = pts.filter((p) => p.ele != null).map((p) => p.ele as number);
  for (let i = 1; i < pts.length; i++) {
    dist += haversineM(pts[i - 1], pts[i]);
    const e1 = pts[i - 1].ele, e2 = pts[i].ele;
    if (e1 != null && e2 != null) {
      const d = e2 - e1;
      if (d > 0) up += d; else down -= d;
    }
  }
  return {
    distanceM: Math.round(dist),
    ascentM: Math.round(up),
    descentM: Math.round(down),
    maxEleM: eles.length ? Math.round(Math.max(...eles)) : 0,
    minEleM: eles.length ? Math.round(Math.min(...eles)) : 0,
  };
}

@Injectable()
export class GpxService {
  constructor(@InjectRepository(GpxSubmission) private subs: Repository<GpxSubmission>) {}

  /** User Cấp 2+ nộp GPX mở cung (docs/04) — vào hàng đợi kiểm duyệt */
  async submit(userId: string, routeName: string, rawGpx: string) {
    const pts = parseGpx(rawGpx);
    const stats = trackStats(pts);
    const sub = this.subs.create({
      user: { id: userId } as User,
      routeName,
      rawGpx,
      pointCount: pts.length,
      distanceM: stats.distanceM,
    });
    const saved = await this.subs.save(sub);
    return { id: saved.id, status: saved.status, pointCount: pts.length, ...stats };
  }

  mySubmissions(userId: string) {
    return this.subs.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
