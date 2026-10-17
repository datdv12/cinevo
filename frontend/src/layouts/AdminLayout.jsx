import { useFeatures } from "../context/FeaturesContext";
import PanelLayout from "./PanelLayout";

const LINKS = [
  ["", "Tổng quan"], ["/users", "Người dùng"], ["/managers", "Manager"], ["/movies", "Phim"],
  ["/transactions", "Giao dịch"], ["/promotions", "Khuyến mãi"], ["/ai", "Quản lý AI", "ai"],
  ["/roles", "Phân quyền"], ["/settings", "Cài đặt hệ thống"], ["/logs", "Nhật ký"],
];

export default function AdminLayout() {
  const { features } = useFeatures();
  // Mục có cờ (phần tử thứ 3) chỉ hiện khi tính năng đó đang bật.
  const links = LINKS.filter(([, , flag]) => !flag || features[flag]);
  return <PanelLayout title="Quản trị hệ thống" base="/admin" links={links} />;
}
