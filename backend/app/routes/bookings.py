"""API combo đồ ăn và đặt vé. Đặt vé / xem vé yêu cầu đăng nhập."""
from flask import Blueprint, g, jsonify, request

from ..models import Booking, Food
from ..services.auth_service import auth_required
from ..services.booking_service import BookingError, create_booking

bp = Blueprint("bookings", __name__, url_prefix="/api")


@bp.get("/foods")
def foods():
    return jsonify([f.to_dict() for f in Food.query.filter_by(available=True).order_by(Food.price).all()])


@bp.post("/bookings")
@auth_required
def make_booking():
    data = request.get_json(silent=True) or {}
    try:
        booking = create_booking(g.current_user, data.get("showtime_id"), data.get("seat_ids") or [],
                                 data.get("foods") or [], data.get("payment_method"))
    except BookingError as e:
        return jsonify({"message": e.message, "code": e.code}), e.status
    return jsonify(booking.to_dict()), 201


@bp.get("/bookings/my")
@auth_required
def my_bookings():
    rows = (Booking.query.filter_by(user_id=g.current_user.id)
            .order_by(Booking.created_at.desc()).all())
    return jsonify([b.to_dict() for b in rows])


@bp.get("/bookings/<code>")
@auth_required
def booking_detail(code):
    booking = Booking.query.filter_by(code=code).first()
    is_staff = g.current_user.role.name in ("MANAGER", "ADMIN")
    if not booking or (booking.user_id != g.current_user.id and not is_staff):
        return jsonify({"message": "Không tìm thấy vé."}), 404
    return jsonify(booking.to_dict())
