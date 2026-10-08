import ResourcePage from "../../components/ResourcePage";

const columns = [{ key: "code", label: "Mã" }, { key: "description", label: "Mô tả" }, { key: "discount_percent", label: "Giảm (%)" }, { key: "active", label: "Đang chạy", render: (r) => (r.active ? "Có" : "Không") }];

export default function PromotionManagement() {
  return <ResourcePage title="Quản lý khuyến mãi" endpoint="/admin/promotions" columns={columns} />;
}
