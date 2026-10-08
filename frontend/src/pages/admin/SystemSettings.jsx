import ResourcePage from "../../components/ResourcePage";

const columns = [{ key: "key", label: "Tên" }, { key: "value", label: "Giá trị" }];

export default function SystemSettings() {
  return <ResourcePage title="Cài đặt hệ thống" endpoint="/admin/settings" columns={columns} />;
}
