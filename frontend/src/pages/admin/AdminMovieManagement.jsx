import ResourcePage from "../../components/ResourcePage";

const columns = [{ key: "id", label: "ID" }, { key: "title", label: "Tên phim" }, { key: "genre", label: "Thể loại" }, { key: "rating", label: "Điểm" }, { key: "status", label: "Trạng thái" }];

export default function AdminMovieManagement() {
  return <ResourcePage title="Quản lý phim (toàn hệ thống)" endpoint="/admin/movies" columns={columns} />;
}
