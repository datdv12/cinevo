import ResourcePage from "../../components/ResourcePage";

const columns = [{ key: "id", label: "ID" }, { key: "full_name", label: "Họ tên" }, { key: "email", label: "Email" }, { key: "phone", label: "SĐT" }, { key: "role", label: "Role" }, { key: "status", label: "Trạng thái" }];

export default function UserManagement() {
  return <ResourcePage title="Quản lý người dùng" endpoint="/admin/users" columns={columns} />;
}
