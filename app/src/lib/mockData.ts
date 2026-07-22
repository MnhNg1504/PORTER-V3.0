/**
 * POTTER 3.0 — Dữ liệu MOCK nội bộ (chỉ để dựng khung UI).
 * MỌI thứ ở đây là tạm — đánh dấu TODO(api) nơi cần nối backend thật.
 * KHÔNG dùng mock cho map/GPS/GPX/elevation (những phần đó là THẬT — xem lib/gpx.ts, gpxAsset.ts).
 */

import { Difficulty } from '../theme';
export type { Difficulty };

// ---- Cấp người dùng (docs 04/05) — điều khiển bật/khoá tính năng theo cấp ----
export type UserLevel = 1 | 2 | 3;

export interface CurrentUser {
  id: string;
  name: string;
  level: UserLevel;
  reputation: number; // 0..1000
  stats: { routes: number; km: number; gain: number; days: number };
  /** Liên hệ khẩn cấp cho SOS (docs/05 §5) — khai trong Hồ sơ. TODO(api): lưu server. */
  emergencyContact?: { name: string; phone: string };
}

// TODO(api): GET /me — hồ sơ user thật + cấp + uy tín + cột mốc.
export const currentUser: CurrentUser = {
  id: 'u_me',
  name: 'Nao Chi',
  level: 2,
  reputation: 780,
  stats: { routes: 14, km: 168, gain: 9400, days: 21 },
  emergencyContact: { name: 'Minh (anh trai)', phone: '0912345678' },
};

// ---- Cung đường (Route Card đủ chỉ số — docs 02 Tab 2) ----
export interface Route {
  id: string;
  name: string;
  region: string;
  difficulty: Difficulty;
  distanceKm: number;
  gainM: number; // tổng leo
  durationText: string; // thời gian ước tính
  bestSeason: string; // mùa đẹp
  saves: number; // lượt lưu
  hot: number; // độ hot 0..100
  priceVnd: number; // giá cung hướng dẫn
  rating: number;
  reviewCount: number;
  hasSampleGpx: boolean; // có GPX mẫu để dẫn đường không
  startPoint: StartPoint; // điểm xuất phát (bắt buộc có ảnh)
}

export interface StartPoint {
  label: string;
  note: string; // mô tả mốc nhận diện
  lat: number;
  lon: number;
  photoCaption: string;
  // TODO(api): photoUrl thật từ CDN (ảnh thực địa người bán upload). Hiện dùng placeholder.
  photoUrl: string | null;
  guideName: string;
  guideRating: number;
}

// TODO(api): GET /routes — danh sách cung thật (có GPX, ảnh điểm XP, giá...).
export const mockRoutes: Route[] = [
  {
    id: 'r_taxua',
    name: 'Tà Xùa – Sống lưng khủng long',
    region: 'Sơn La',
    difficulty: 'hard',
    distanceKm: 12.4,
    gainM: 1120,
    durationText: '~8h',
    bestSeason: '🍂 Thu',
    saves: 1204,
    hot: 82,
    priceVnd: 350000,
    rating: 4.7,
    reviewCount: 88,
    hasSampleGpx: true, // <-- có GPX THẬT bundle sẵn (ta-xua.gpx)
    startPoint: {
      label: 'Bản Tà Xùa',
      note: 'Cổng gỗ đầu bản, có biển "Tà Xùa". Gửi xe tại nhà anh Sơn cuối đường bê tông.',
      lat: 21.447808,
      lon: 104.353528,
      photoCaption: 'Cổng gỗ đầu bản, có biển Tà Xùa',
      photoUrl: null,
      guideName: 'A Của',
      guideRating: 4.9,
    },
  },
  {
    id: 'r_bachmoc',
    name: 'Bạch Mộc Lương Tử (Kỳ Quan San)',
    region: 'Lào Cai',
    difficulty: 'hard',
    distanceKm: 27.5,
    gainM: 2600,
    durationText: '2 ngày',
    bestSeason: '❄️ Đông',
    saves: 980,
    hot: 76,
    priceVnd: 500000,
    rating: 4.8,
    reviewCount: 64,
    hasSampleGpx: false,
    startPoint: {
      label: 'Sàng Ma Sáo',
      note: 'Điểm tập kết nhà dân đầu bản Ky Quan San.',
      lat: 22.4,
      lon: 103.65,
      photoCaption: 'Nhà tập kết đầu bản',
      photoUrl: null,
      guideName: 'Vàng A Dơ',
      guideRating: 4.8,
    },
  },
  {
    id: 'r_laothan',
    name: 'Lảo Thẩn – Nóc nhà Y Tý',
    region: 'Lào Cai',
    difficulty: 'standard',
    distanceKm: 12.0,
    gainM: 1100,
    durationText: '~7h',
    bestSeason: '🌾 Thu',
    saves: 1520,
    hot: 88,
    priceVnd: 300000,
    rating: 4.6,
    reviewCount: 120,
    hasSampleGpx: false,
    startPoint: {
      label: 'Bản Phìn Hồ',
      note: 'Điểm gửi xe cuối bản.',
      lat: 22.62,
      lon: 103.65,
      photoCaption: 'Điểm gửi xe cuối bản',
      photoUrl: null,
      guideName: 'Lý A Sinh',
      guideRating: 4.7,
    },
  },
  {
    id: 'r_nuiham',
    name: 'Núi Hàm Lợn (dễ, gần Hà Nội)',
    region: 'Hà Nội',
    difficulty: 'easy',
    distanceKm: 6.5,
    gainM: 300,
    durationText: '~3h',
    bestSeason: '🌸 Xuân',
    saves: 640,
    hot: 55,
    priceVnd: 150000,
    rating: 4.3,
    reviewCount: 45,
    hasSampleGpx: false,
    startPoint: {
      label: 'Hồ Hàm Lợn',
      note: 'Bãi gửi xe cạnh hồ.',
      lat: 21.29,
      lon: 105.75,
      photoCaption: 'Bãi gửi xe cạnh hồ',
      photoUrl: null,
      guideName: 'CLB Hà Nội Trekking',
      guideRating: 4.5,
    },
  },
];

// "Điểm đến hot" cho carousel Tab 2
export const hotDestinations = mockRoutes.filter((r) => r.hot >= 76);

// ---- Cộng đồng (Tab 1) ----
export interface Post {
  id: string;
  author: string;
  authorLevel: UserLevel;
  timeAgo: string;
  caption: string;
  likes: number;
  comments: number;
  routeRef?: { name: string; distanceKm: number; gainM: number; difficulty: Difficulty };
}

// TODO(api): GET /feed — feed thật (theo dõi / khám phá).
export const mockPosts: Post[] = [
  {
    id: 'p1',
    author: 'Minh Trek',
    authorLevel: 2,
    timeAgo: '2h',
    caption: 'Săn mây Tà Xùa sáng nay 🌄',
    likes: 214,
    comments: 33,
    routeRef: { name: 'Tà Xùa – Sống lưng khủng long', distanceKm: 12.4, gainM: 1120, difficulty: 'hard' },
  },
  {
    id: 'p2',
    author: 'Hương Sơn Cước',
    authorLevel: 1,
    timeAgo: '5h',
    caption: 'Lần đầu chinh phục Lảo Thẩn, cảnh đẹp nghẹt thở!',
    likes: 98,
    comments: 12,
    routeRef: { name: 'Lảo Thẩn – Nóc nhà Y Tý', distanceKm: 12, gainM: 1100, difficulty: 'standard' },
  },
];

// ---- Nhắn tin (Tab 4) ----
export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isGuide: boolean; // kênh support hướng dẫn viên
  routeName?: string;
}

// TODO(api): GET /conversations — hội thoại thật (WebSocket cho realtime).
export const mockConversations: Conversation[] = [
  { id: 'c1', name: 'A Của', lastMessage: 'Tới cổng bản thì nhắn anh nhé', time: '09:12', unread: 2, isGuide: true, routeName: 'Tà Xùa' },
  { id: 'c2', name: 'Nhóm Tà Xùa T7', lastMessage: 'Điểm danh 5h sáng nhé cả nhà', time: 'Hôm qua', unread: 0, isGuide: false },
  { id: 'c3', name: 'CSKH POTTER', lastMessage: 'Cảm ơn bạn đã phản hồi', time: '3 ngày', unread: 0, isGuide: false },
];

export interface ChatMessage {
  id: string;
  fromMe: boolean;
  text: string;
}

export const mockChat: ChatMessage[] = [
  { id: 'm1', fromMe: false, text: 'Chào em, mai 5h sáng xuất phát nhé' },
  { id: 'm2', fromMe: true, text: 'Dạ vâng anh, em tới cổng bản sẽ nhắn' },
  { id: 'm3', fromMe: false, text: 'Ok, nhớ tải bản đồ offline vì sóng yếu' },
];

// ---- Huy hiệu (Tab 5) ----
export const mockBadges = ['100km đầu tiên', 'Đỉnh >2000m', 'Săn mây', 'Cung Khó đầu tiên'];
