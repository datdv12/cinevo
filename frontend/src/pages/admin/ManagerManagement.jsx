import ResourcePage from "../../components/ResourcePage";

const columns = [{ key: "id", label: "ID" }, { key: "full_name", label: "Họ tên" }, { key: "email", label: "Email" }, { key: "status", label: "Trạng thái" }];

export default function ManagerManagement() {
  return <ResourcePage title="Quản lý Manager" endpoint="/admin/managers" columns={columns} />;
}
