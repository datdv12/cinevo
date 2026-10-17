"""API phim (công khai, không cần đăng nhập)."""
from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import Cinema, Movie, Room, Showtime
from ..timeutil import local_now

bp = Blueprint("movies", __name__, url_prefix="/api/movies")


@bp.get("")
def list_movies():
    """?status=now_showing|coming_soon &genre= &q= &city="""
    query = Movie.query
    if status := request.args.get("status"):
        query = query.filter(Movie.status == status)
    if genre := request.args.get("genre"):
        query = query.filter(Movie.genre.ilike(f"%{genre}%"))
    if q := request.args.get("q"):
        query = query.filter(Movie.title.ilike(f"%{q}%"))
    if city := request.args.get("city"):   # chỉ giữ phim có suất chiếu sắp tới tại khu vực
        ids = (db.session.query(Showtime.movie_id).join(Room).join(Cinema)
               .filter(Cinema.city == city, Showtime.start_time >= local_now()))
        query = query.filter(Movie.status == "coming_soon") if request.args.get("status") == "coming_soon" \
            else query.filter(Movie.id.in_(ids))
    return jsonify([m.to_dict() for m in query.order_by(Movie.rating.desc()).all()])


@bp.get("/<int:movie_id>")
def get_movie(movie_id):
    movie = db.session.get(Movie, movie_id)
    if not movie:
        return jsonify({"message": "Không tìm thấy phim."}), 404
    return jsonify(movie.to_dict())
