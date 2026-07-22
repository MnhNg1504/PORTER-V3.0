/** Kiểu điều hướng (React Navigation) — khai báo tham số từng route. */

export type RootStackParamList = {
  Tabs: undefined;
  RouteDetail: { routeId: string };
  StartPoint: { routeId: string }; // Màn "Dẫn tới điểm xuất phát"
  RouteNavigate: { routeId: string }; // BƯỚC 2 — điều hướng cung
  Chat: { conversationId: string };
  Search: undefined; // Tìm kiếm cung (checklist §1)
};

export type TabParamList = {
  Community: undefined;
  Routes: undefined;
  MapTab: undefined; // FAB giữa "Xuất phát" mở tab này
  Messages: undefined;
  Profile: undefined;
};
