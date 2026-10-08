// Thanh tiến trình đặt vé: Ghế → Xác nhận → Đồ ăn → Thanh toán.
const STEPS = ["Chọn ghế", "Xác nhận", "Đồ ăn", "Thanh toán"];

export default function StepProgress({ current }) {
  return (
    <ol className="steps" aria-label="Tiến trình đặt vé">
      {STEPS.map((s, i) => (
        <li key={s} className={i === current ? "current" : i < current ? "done" : ""}>{s}</li>
      ))}
    </ol>
  );
}
