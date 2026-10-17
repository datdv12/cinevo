"""API cho MANAGER (quản lý rạp). Admin cũng được truy cập. Giai đoạn khung: chủ yếu đọc dữ liệu."""
from datetime import datetime

from flask import Blueprint, jsonify, request
from sqlalchemy import func

from ..extensions import db
from ..models import (Booking, Cinema, Food, Movie, Room, Seat, Showtime, ROLE_ADMIN, ROLE_MANAGER)
from ..services.auth_service import roles_required
from ..services.validation import clean_int, clean_str, ApiError, json_body, int_arg

MOVIE_STATUSES = ("now_showing", "coming_soon")
bp = Blueprint("manager", __name__, url_prefix="/api/manager")
staff = roles_required(ROLE_MANAGER, ROLE_ADMIN)


@bp.get("/dashboard")
@staff
def dashboard():
    revenue = db.session.query(func.coalesce(func.sum(Booking.total_amount), 0)).scalar()
    return jsonify({"stats": [
        {"label": "Phim", "value": Movie.query.count()},
        {"label": "Rạp", "value": Cinema.query.count()},
        {"label": "Suất chiếu", "value": Showtime.query.count()},
        {"label": "Vé đã bán", "value": Booking.query.count()},
        {"label": "Doanh thu (đ)", "value": f"{revenue:,}".replace(",", ".")},
    ]})


@bp.get("/movies")
@staff
def movies():
    return jsonify([m.to_dict() for m in Movie.query.all()])


@bp.post("/movies")
@staff
def create_movie():
    """Mẫu thêm phim. TODO: validate đầy đủ ở giai đoạn nghiệp vụ."""
    d = json_body()
    status = d.get("status", "coming_soon")
    if status not in MOVIE_STATUSES:
        raise ApiError("Trạng thái phim không hợp lệ.")
    movie = Movie(title=clean_str(d.get("title"), "tên phim", max_len=200, required=True),
                  genre=clean_str(d.get("genre"), "thể loại", max_len=120) or None,
                  duration_minutes=clean_int(d.get("duration_minutes", 120), "thời lượng", lo=1, hi=600),
                  description=clean_str(d.get("description"), "mô tả", max_len=5000) or None, status=status)
    db.session.add(movie)
    db.session.commit()
    return jsonify(movie.to_dict()), 201


@bp.get("/cinemas")
@staff
def cinemas():
    return jsonify([c.to_dict() for c in Cinema.query.all()])


@bp.get("/rooms")
@staff
def rooms():
    return jsonify([r.to_dict() for r in Room.query.all()])


@bp.get("/seats")
@staff
def seats():
    q = Seat.query
    if (rid := int_arg("room_id")) is not None:
        q = q.filter_by(room_id=rid)
    return jsonify([s.to_dict() for s in q.limit(200).all()])


@bp.get("/showtimes")
@staff
def showtimes():
    rows = Showtime.query.order_by(Showtime.start_time).limit(100).all()
    return jsonify([{"id": s.id, "movie": s.movie.title, "cinema": s.room.cinema.name, "room": s.room.name,
                     "start_time": s.start_time.isoformat(), "base_price": s.base_price} for s in rows])


@bp.get("/bookings")
@staff
def bookings():
    rows = Booking.query.order_by(Booking.created_at.desc()).limit(100).all()
    return jsonify([{"code": b.code, "customer": b.user.full_name, "movie": b.showtime.movie.title,
                     "start_time": b.showtime.start_time.isoformat(), "seats": ", ".join(sorted(s.seat.label for s in b.seats)),
                     "total_amount": b.total_amount, "status": b.status} for b in rows])


@bp.get("/foods")
@staff
def foods():
    return jsonify([f.to_dict() for f in Food.query.all()])


@bp.get("/report")
@staff
def report():
    """Doanh thu theo phim."""
    rows = (db.session.query(Movie.title, func.count(Booking.id), func.coalesce(func.sum(Booking.total_amount), 0))
            .join(Showtime, Showtime.movie_id == Movie.id).join(Booking, Booking.showtime_id == Showtime.id)
            .group_by(Movie.title).all())
    return jsonify([{"movie": t, "bookings": n, "revenue": int(r)} for t, n, r in rows])
