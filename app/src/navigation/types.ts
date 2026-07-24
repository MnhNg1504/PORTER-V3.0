/** Kiểu điều hướng (React Navigation) — khai báo tham số từng route. */

export type RootStackParamList = {
  Tabs: undefined;
  RouteDetail: { routeId: string };
  StartPoint: { routeId: string }; // Màn "Dẫn tới điểm xuất phát"
  RouteNavigate: { routeId: string }; // BƯỚC 2 — điều hướng cung
  Chat: { conversationId: string };
  Search: undefined; // Tìm kiếm cung (checklist §1)

  // ---- Luồng tiền phía MUA (module payments, docs/16) ----
  Booking: { routeId: string; waiverSigned?: boolean }; // Chọn ngày + số người + đặt cọc
  OrderStatus: { orderId: string }; // Trạng thái đơn + hủy/hoàn cọc QĐ-1
  Waiver: { routeId: string }; // Waiver ký số cho cung ≥Chuẩn (chặn thanh toán tới khi ký)

  // ---- Màn v3 bổ sung (port thêm) ----
  Onboarding: undefined; // 3 slide giới thiệu
  Login: undefined; // Đăng nhập SĐT/Google/Apple
  Notifications: undefined; // Thông báo
  Settings: undefined; // Cài đặt
  EditProfile: undefined; // Sửa hồ sơ
  GroupProgress: { routeId?: string }; // Tiến độ đoàn (an toàn đoàn)
  TripJournal: { completionId?: string }; // Nhật ký hành trình sau chuyến
  FindPorter: { routeId?: string }; // Tìm porter + ghép đoàn chia tiền
  PorterDetail: { porterId: string }; // Chi tiết porter
};

export type TabParamList = {
  Community: undefined;
  Routes: undefined;
  MapTab: undefined; // FAB giữa "Xuất phát" mở tab này
  Messages: undefined;
  Profile: undefined;
};
