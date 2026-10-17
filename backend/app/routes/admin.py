"""API cho ADMIN (quản trị hệ thống). Chỉ role ADMIN."""
from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import func

from ..extensions import db
from ..models import (ActivityLog, Booking, Movie, Payment, Promotion, ROLE_ADMIN, ROLE_MANAGER,
                      Role, STATUS_ACTIVE, STATUS_LOCKED, User, log_activity)
from ..services.auth_service import roles_required
from ..services.validation import EMAIL_RE, PHONE_RE, ApiError, clean_str, json_body
from flask import g

bp = Blueprint("admin", __name__, url_prefix="/api/admin")
admin_only = roles_required(ROLE_ADMIN)

# Cấu hình AI giả lập (lưu trong bộ nhớ). TODO: chuyển sang bảng settings trong DB.
AI_SETTINGS = {"provider": "mock", "recommendation_enabled": True, "chatbot_enabled": True, "seat_ai_enabled": True}


@bp.get("/dashboard")
@admin_only
def dashboard():
    total = db.session.query(func.coalesce(func.sum(Payment.amount), 0)).scalar()
    return jsonify({"stats": [
        {"label": "Người dùng", "value": User.query.count()},
        {"label": "Manager", "value": User.query.join(Role).filter(Role.name == ROLE_MANAGER).count()},
        {"label": "Phim", "value": Movie.query.count()},
        {"label": "Giao dịch", "value": Payment.query.count()},
        {"label": "Tổng thu (đ)", "value": f"{total:,}".replace(",", ".")},
    ]})


@bp.get("/users")
@admin_only
def users():
    return jsonify([u.to_dict() for u in User.query.order_by(User.id).all()])


@bp.patch("/users/<int:user_id>/status")
@admin_only
def set_status(user_id):
    user = db.session.get(User, user_id)
    status = json_body().get("status")
    if not user or status not in (STATUS_ACTIVE, STATUS_LOCKED):
        raise ApiError("Dữ liệu không hợp lệ.")
    if user.id == g.current_user.id:
        return jsonify({"message": "Không thể tự khóa tài khoản của mình."}), 400
    user.status = status
    log_activity(g.current_user.id, "USER_STATUS", f"{user.email} -> {status}")
    db.session.commit()
    return jsonify(user.to_dict())


@bp.get("/managers")
@admin_only
def managers():
    return jsonify([u.to_dict() for u in User.query.join(Role).filter(Role.name == ROLE_MANAGER).all()])


@bp.post("/managers")
@admin_only
def create_manager():
    """Chỉ ADMIN mới tạo được MANAGER (đây là cách DUY NHẤT để có tài khoản MANAGER)."""
    d = json_body()
    email = clean_str(d.get("email"), "email", max_len=160, required=True).lower()
    password, phone = d.get("password"), clean_str(d.get("phone"), "số điện thoại", max_len=15)
    if not EMAIL_RE.match(email) or (phone and not PHONE_RE.match(phone)):
        raise ApiError("Email hoặc số điện thoại không hợp lệ.")
    if not isinstance(password, str) or not (6 <= len(password) <= 128):
        raise ApiError("Mật khẩu cần từ 6 đến 128 ký tự.")
    if User.query.filter_by(email=email).first():
        raise ApiError("Email đã tồn tại.", 409)
    user = User(full_name=clean_str(d.get("full_name"), "họ tên", max_len=120) or email, email=email, phone=phone or None,
                role=Role.query.filter_by(name=ROLE_MANAGER).one(), status=STATUS_ACTIVE)
    user.set_password(d["password"])
    db.session.add(user)
    log_activity(g.current_user.id, "MANAGER_CREATED", email)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@bp.get("/movies")
@admin_only
def movies():
    return jsonify([m.to_dict() for m in Movie.query.all()])


@bp.get("/transactions")
@admin_only
def transactions():
    return jsonify([p.to_dict() for p in Payment.query.order_by(Payment.id.desc()).limit(100).all()])


@bp.get("/promotions")
@admin_only
def promotions():
    return jsonify([p.to_dict() for p in Promotion.query.all()])


@bp.get("/roles")
@admin_only
def roles():
    return jsonify([r.to_dict() for r in Role.query.all()])


@bp.get("/ai-settings")
@admin_only
def ai_settings():
    if not current_app.config["FEATURE_AI"]:     # AI đang tắt: coi như endpoint không tồn tại
        raise ApiError("Không tìm thấy tài nguyên.", 404)
    return jsonify([{"key": k, "value": str(v)} for k, v in AI_SETTINGS.items()])


@bp.get("/settings")
@admin_only
def settings():
    return jsonify([{"key": "app_name", "value": "CINEVO"}, {"key": "currency", "value": "VND"},
                    {"key": "payment_mode", "value": "mock"}, {"key": "otp_mode", "value": "mock"}])


@bp.get("/activity-logs")
@admin_only
def activity_logs():
    return jsonify([a.to_dict() for a in ActivityLog.query.order_by(ActivityLog.id.desc()).limit(100).all()])
