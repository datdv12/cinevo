"""API AI (dữ liệu giả định). Mỗi route chỉ gọi service tương ứng trong app/ai/."""
from flask import Blueprint, jsonify, request

from ..ai.chatbot_service import ChatbotService
from ..ai.recommendation_service import MovieRecommendationService
from ..ai.seat_recommendation import SeatRecommendationService
from ..extensions import db
from ..models import Seat, Showtime
from ..services.booking_service import taken_seat_ids

bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@bp.get("/recommend-movies")
def recommend_movies():
    return jsonify(MovieRecommendationService().recommend(request.args.get("genre"),
                                                          int(request.args.get("limit", 5))))


@bp.get("/recommend-seats")
def recommend_seats():
    st = db.session.get(Showtime, int(request.args.get("showtime_id", 0)))
    if not st:
        return jsonify({"message": "Không tìm thấy suất chiếu."}), 404
    taken = taken_seat_ids(st.id)
    seats = [{"id": s.id, "row": s.row_label, "number": s.number, "label": s.label, "booked": s.id in taken}
             for s in Seat.query.filter_by(room_id=st.room_id).all()]
    return jsonify(SeatRecommendationService().recommend(seats, int(request.args.get("count", 2))))


@bp.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}
    return jsonify(ChatbotService().reply(data.get("message", ""), data.get("history")))
