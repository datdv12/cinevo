import ResourcePage from "../../components/ResourcePage";
import { formatVND } from "../../utils/format";

const columns = [{ key: "id", label: "ID" }, { key: "booking_code", label: "Mã vé" }, { key: "method", label: "Phương thức" }, { key: "amount", label: "Số tiền", render: (r) => formatVND(r.amount) }, { key: "status", label: "Trạng thái" }, { key: "transaction_ref", label: "Mã giao dịch" }];

export default function TransactionManagement() {
  return <ResourcePage title="Quản lý giao dịch" endpoint="/admin/transactions" columns={columns} />;
}
