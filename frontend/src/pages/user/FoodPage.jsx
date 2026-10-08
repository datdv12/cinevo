// Chọn combo đồ ăn (tùy chọn). Có nút Bỏ qua.
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import StepProgress from "../../components/StepProgress";
import { useBooking } from "../../context/BookingContext";
import { movieService } from "../../services/movieService";
import { formatVND } from "../../utils/format";

export default function FoodPage() {
  const { booking, setFoods, totals } = useBooking();
  const navigate = useNavigate();
  const [foods, setFoodList] = useState(null);
  const [qty, setQty] = useState(() => Object.fromEntries(booking.foods.map((f) => [f.id, f.quantity])));

  useEffect(() => { movieService.foods().then(setFoodList).catch(() => setFoodList([])); }, []);
  if (!booking.showtime || !booking.seats.length) return <Navigate to="/user/movies" replace />;

  const change = (id, delta) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(10, (q[id] || 0) + delta)) }));
  const foodTotal = (foods || []).reduce((s, f) => s + f.price * (qty[f.id] || 0), 0);

  const next = (skip) => {
    setFoods(skip ? [] : foods.filter((f) => qty[f.id] > 0).map((f) => ({ id: f.id, name: f.name, price: f.price, quantity: qty[f.id] })));
    navigate("/user/payment");
  };

  return (
    <section className="narrow">
      <StepProgress current={2} />
      <h1 className="page-title">Chọn combo đồ ăn</h1>
      {!foods ? <Loading /> : (
        <div className="list">
          {foods.map((f) => (
            <article key={f.id} className="card food">
              <div><h3>{f.name}</h3><p className="muted small">{f.description}</p><b>{formatVND(f.price)}</b></div>
              <div className="qty">
                <button className="btn btn-ghost btn-sm" onClick={() => change(f.id, -1)} aria-label={`Giảm ${f.name}`}>−</button>
                <span>{qty[f.id] || 0}</span>
                <button className="btn btn-outline btn-sm" onClick={() => change(f.id, 1)} aria-label={`Thêm ${f.name}`}>+ Thêm</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="sticky-bar">
        <div><b>Vé: {formatVND(totals.seatAmount)}</b><div className="muted small">Combo: {formatVND(foodTotal)}</div></div>
        <div className="actions">
          <button className="btn btn-ghost" onClick={() => next(true)}>Bỏ qua</button>
          <button className="btn btn-red" disabled={!foodTotal} onClick={() => next(false)}>Tiếp tục</button>
        </div>
      </div>
    </section>
  );
}
