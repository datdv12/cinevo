"""Tạo/kiểm tra JWT, decorator phân quyền, và logic OTP giả lập."""
from datetime import datetime, timedelta
from functools import wraps

import jwt
from flask import current_app, g, jsonify, request

from ..extensions import db
from ..models import OtpCode, User, STATUS_ACTIVE


def create_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "role": user.role.name,
        "exp": datetime.utcnow() + timedelta(hours=current_app.config["JWT_EXPIRES_HOURS"]),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def _user_from_request():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        data = jwt.decode(header[7:], current_app.config["SECRET_KEY"], algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    user = db.session.get(User, int(data["sub"]))
    return user if user and user.status == STATUS_ACTIVE else None


def auth_required(fn):
    """Yêu cầu đăng nhập. Người dùng hiện tại nằm ở g.current_user."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = _user_from_request()
        if not user:
            return jsonify({"message": "Vui lòng đăng nhập.", "code": "UNAUTHORIZED"}), 401
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def roles_required(*roles):
    """Yêu cầu đăng nhập VÀ có một trong các role. Kiểm tra luôn ở backend, không tin frontend."""
    def decorator(fn):
        @wraps(fn)
        @auth_required
        def wrapper(*args, **kwargs):
            if g.current_user.role.name not in roles:
                return jsonify({"message": "Bạn không có quyền truy cập.", "code": "FORBIDDEN"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ---------- OTP giả lập ----------
def issue_otp(user: User) -> str:
    code = current_app.config["MOCK_OTP_CODE"]   # TODO: sinh mã ngẫu nhiên + gửi email thật
    db.session.add(OtpCode(user_id=user.id, code=code,
                           expires_at=datetime.utcnow() + timedelta(minutes=10)))
    return code


def verify_otp(user: User, code: str) -> bool:
    otp = (OtpCode.query.filter_by(user_id=user.id, code=code, used=False)
           .order_by(OtpCode.id.desc()).first())
    if not otp or otp.expires_at < datetime.utcnow():
        return False
    otp.used = True
    return True


def mask_email(email: str) -> str:
    name, _, domain = email.partition("@")
    return f"{name[:1]}***@{domain}"
