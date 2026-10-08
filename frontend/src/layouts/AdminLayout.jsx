import PanelLayout from "./PanelLayout";

const LINKS = [
  ["", "Tổng quan"], ["/users", "Người dùng"], ["/managers", "Manager"], ["/movies", "Phim"],
  ["/transactions", "Giao dịch"], ["/promotions", "Khuyến mãi"], ["/ai", "Quản lý AI"],
  ["/roles", "Phân quyền"], ["/settings", "Cài đặt hệ thống"], ["/logs", "Nhật ký"],
];

export default function AdminLayout() {
  return <PanelLayout title="Quản trị hệ thống" base="/admin" links={LINKS} />;
}
