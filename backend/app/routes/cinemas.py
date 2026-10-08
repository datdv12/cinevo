"""API rạp và khu vực (công khai)."""
from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import Cinema

bp = Blueprint("cinemas", __name__, url_prefix="/api")


@bp.get("/cities")
def cities():
    rows = db.session.query(Cinema.city).distinct().order_by(Cinema.city).all()
    return jsonify([r[0] for r in rows])


@bp.get("/cinemas")
def list_cinemas():
    query = Cinema.query
    if city := request.args.get("city"):
        query = query.filter_by(city=city)
    return jsonify([c.to_dict() for c in query.order_by(Cinema.name).all()])
