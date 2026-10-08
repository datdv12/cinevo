// Sơ đồ ghế: nhóm theo hàng, đánh dấu ghế đã đặt / đang chọn / AI gợi ý / VIP.
export default function SeatMap({ seats, selectedIds, suggestedIds = [], onToggle }) {
  const rows = seats.reduce((acc, s) => ((acc[s.row] ||= []).push(s), acc), {});
  return (
    <div className="seatmap">
      <div className="screen">MÀN HÌNH</div>
      {Object.keys(rows).sort().map((row) => (
        <div className="seat-row" key={row}>
          <span className="row-label">{row}</span>
          {rows[row].map((s) => {
            const selected = selectedIds.includes(s.id);
            const cls = ["seat", s.type === "VIP" && "vip", s.booked && "booked", selected && "selected",
              !selected && suggestedIds.includes(s.id) && "suggested"].filter(Boolean).join(" ");
            return (
              <button key={s.id} className={cls} disabled={s.booked} onClick={() => onToggle(s)}
                aria-pressed={selected} aria-label={`Ghế ${s.label}${s.booked ? ", đã đặt" : ""}`}>
                {s.number}
              </button>
            );
          })}
          <span className="row-label">{row}</span>
        </div>
      ))}
      <div className="legend">
        <span><i className="seat sm" />Thường</span><span><i className="seat sm vip" />VIP</span>
        <span><i className="seat sm selected" />Đang chọn</span><span><i className="seat sm suggested" />AI gợi ý</span>
        <span><i className="seat sm booked" />Đã đặt</span>
      </div>
    </div>
  );
}
