"""Logic tạo Booking. Giá luôn được TÍNH LẠI ở server, không tin giá từ client."""
from datetime import datetime

from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import (Booking, BookingFood, BookingSeat, Food, Payment, PAYMENT_METHODS,
                      Seat, Showtime, log_activity)


class BookingError(Exception):
    def __init__(self, message, status=400, code="BOOKING_ERROR"):
        super().__init__(message)
        self.message, self.status, self.code = message, status, code


def taken_seat_ids(showtime_id: int) -> set:
    rows = BookingSeat.query.filter_by(showtime_id=showtime_id).all()
    return {r.seat_id for r in rows}


def create_booking(user, showtime_id, seat_ids, foods, method) -> Booking:
    showtime = db.session.get(Showtime, showtime_id)
    if not showtime:
        raise BookingError("Suất chiếu không tồn tại.", 404)
    if showtime.start_time < datetime.now():
        raise BookingError("Suất chiếu đã bắt đầu.")
    if method not in PAYMENT_METHODS:
        raise BookingError("Phương thức thanh toán không hợp lệ.")
    if not seat_ids or len(set(seat_ids)) != len(seat_ids) or len(seat_ids) > 8:
        raise BookingError("Vui lòng chọn từ 1 đến 8 ghế.")

    seats = Seat.query.filter(Seat.id.in_(seat_ids), Seat.room_id == showtime.room_id).all()
    if len(seats) != len(seat_ids):
        raise BookingError("Ghế không thuộc phòng chiếu này.")
    if taken_seat_ids(showtime_id) & set(seat_ids):
        raise BookingError("Một số ghế vừa có người đặt. Vui lòng chọn ghế khác.", 409, "SEAT_TAKEN")

    booking = Booking(user_id=user.id, showtime_id=showtime_id, status="PAID")
    db.session.add(booking)
    db.session.flush()

    seat_total = 0
    for seat in seats:
        price = seat.price_for(showtime)
        seat_total += price
        db.session.add(BookingSeat(booking_id=booking.id, showtime_id=showtime_id,
                                   seat_id=seat.id, price=price))

    food_total = 0
    for item in foods or []:
        food = db.session.get(Food, item.get("food_id"))
        qty = int(item.get("quantity", 0))
        if not food or not food.available or not (0 < qty <= 20):
            raise BookingError("Combo đồ ăn không hợp lệ.")
        food_total += food.price * qty
        db.session.add(BookingFood(booking_id=booking.id, food_id=food.id,
                                   quantity=qty, unit_price=food.price))

    booking.seat_amount, booking.food_amount = seat_total, food_total
    booking.total_amount = seat_total + food_total
    booking.code = f"CV{datetime.now():%m%y}{booking.id:04d}"       # ví dụ CV10260001

    # TODO: tích hợp cổng thanh toán thật. Hiện tại luôn coi là thanh toán thành công.
    db.session.add(Payment(booking_id=booking.id, method=method, amount=booking.total_amount,
                           status="PAID", transaction_ref=f"MOCK-{booking.code}"))
    log_activity(user.id, "BOOKING_CREATED", f"{booking.code} - {booking.total_amount}đ")
    try:
        db.session.commit()
    except IntegrityError:   # hai người cùng đặt một ghế tại cùng thời điểm
        db.session.rollback()
        raise BookingError("Một số ghế vừa có người đặt. Vui lòng chọn ghế khác.", 409, "SEAT_TAKEN")
    return booking
