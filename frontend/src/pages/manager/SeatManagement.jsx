import ResourcePage from "../../components/ResourcePage";

const columns = [{ key: "id", label: "ID" }, { key: "room_id", label: "Phòng" }, { key: "label", label: "Ghế" }, { key: "type", label: "Loại ghế" }];

export default function SeatManagement() {
  return <ResourcePage title="Quản lý ghế" endpoint="/manager/seats" columns={columns} />;
}
