import PanelLayout from "./PanelLayout";

const LINKS = [
  ["", "Tổng quan"], ["/movies", "Phim"], ["/cinemas", "Rạp"], ["/rooms", "Phòng chiếu"],
  ["/seats", "Ghế"], ["/showtimes", "Suất chiếu"], ["/bookings", "Đặt vé"],
  ["/foods", "Đồ ăn"], ["/report", "Báo cáo"],
];

export default function ManagerLayout() {
  return <PanelLayout title="Quản lý rạp" base="/manager" links={LINKS} />;
}
