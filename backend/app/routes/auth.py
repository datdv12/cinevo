"""Đăng ký / OTP / đăng nhập. Role khi tự đăng ký luôn là USER."""
from flask import Blueprint, current_app, g, jsonify

from ..extensions import db
from ..models import ROLE_USER, Role, STATUS_ACTIVE, STATUS_PENDING, User, log_activity
from ..services.auth_service import (auth_required, create_token, issue_otp, mask_email, verify_otp)
from ..services.rate_limit import email_key, ip_and_email_key, rate_limit
from ..services.validation import (EMAIL_RE, PHONE_RE, ApiError, clean_str, json_body)

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _otp_hint_body(code):
    return {"otp_hint": code} if current_app.config["OTP_DEBUG_HINT"] else {}


@bp.post("/register")
@rate_limit("register", 10, 3600)
def register():
    data = json_body()
    # LƯU Ý BẢO MẬT: cố tình KHÔNG đọc role/role_id/status từ client. Client không thể tự chọn MANAGER/ADMIN.
    full_name = clean_str(data.get("full_name"), "họ và tên", min_len=2, max_len=120, required=True)
    email = clean_str(data.get("email"), "email", max_len=160, required=True).lower()
    phone = clean_str(data.get("phone"), "số điện thoại", max_len=15, required=True)
    password = data.get("password")
    if not isinstance(password, str) or not (6 <= len(password) <= 128):
        raise ApiError("Mật khẩu cần từ 6 đến 128 ký tự.")
    if not EMAIL_RE.match(email):
        raise ApiError("Email không hợp lệ.")
    if not PHONE_RE.match(phone):
        raise ApiError("Số điện thoại không hợp lệ.")
    if password != data.get("confirm_password"):
        raise ApiError("Mật khẩu nhập lại không khớp.")
    if data.get("accept_terms") is not True:
        raise ApiError("Bạn cần đồng ý với điều khoản sử dụng.")

    user = User.query.filter_by(email=email).first()
    if user and user.status != STATUS_PENDING:
        raise ApiError("Email này đã được sử dụng.", 409, "EMAIL_EXISTS")
    if not user:   # tài khoản PENDING cũ được phép đăng ký lại (cập nhật thông tin)
        user = User(email=email, role=Role.query.filter_by(name=ROLE_USER).one())
        db.session.add(user)
    user.full_name, user.phone, user.status = full_name, phone, STATUS_PENDING
    user.set_password(password)
    db.session.flush()
    code = issue_otp(user)
    db.session.commit()

    return jsonify({"message": "Đã gửi mã xác thực.", "email": email,
                    "masked_email": mask_email(email), **_otp_hint_body(code)}), 201


@bp.post("/verify-otp")
@rate_limit("otp-email", 5, 600, key=email_key)     # tối đa 5 lần thử / 10 phút / email
@rate_limit("otp-ip", 30, 600)
def verify():
    data = json_body()
    user = User.query.filter_by(email=clean_str(data.get("email"), "email", max_len=160).lower()).first()
    code = data.get("code")
    if not user or not isinstance(code, str) or not verify_otp(user, code):
        raise ApiError("Mã xác thực không đúng hoặc đã hết hạn.", 400, "OTP_INVALID")
    user.status = STATUS_ACTIVE
    log_activity(user.id, "REGISTER_VERIFIED", user.email)
    db.session.commit()
    return jsonify({"token": create_token(user), "user": user.to_dict()})


@bp.post("/resend-otp")
@rate_limit("otp-resend", 3, 600, key=email_key)
def resend():
    data = json_body()
    user = User.query.filter_by(email=clean_str(data.get("email"), "email", max_len=160).lower(),
                                status=STATUS_PENDING).first()
    if user:
        issue_otp(user)
        db.session.commit()
    return jsonify({"message": "Nếu email hợp lệ, mã mới đã được gửi."})


@bp.post("/login")
@rate_limit("login", 10, 300, key=ip_and_email_key)   # tối đa 10 lần / 5 phút cho mỗi cặp IP + email
@rate_limit("login-ip", 60, 300)
def login():
    data = json_body()
    email = clean_str(data.get("email"), "email", max_len=160).lower()
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    if not user or not isinstance(password, str) or not user.check_password(password):
        raise ApiError("Email hoặc mật khẩu không đúng.", 401, "BAD_CREDENTIALS")
    if user.status == STATUS_PENDING:
        code = issue_otp(user)
        db.session.commit()
        return jsonify({"message": "Tài khoản chưa xác thực. Vui lòng nhập mã OTP.", "code": "NOT_VERIFIED",
                        **_otp_hint_body(code)}), 403
    if user.status != STATUS_ACTIVE:
        raise ApiError("Tài khoản đã bị khóa.", 403, "LOCKED")
    log_activity(user.id, "LOGIN", user.email)
    db.session.commit()
    return jsonify({"token": create_token(user), "user": user.to_dict()})


@bp.get("/me")
@auth_required
def me():
    return jsonify({"user": g.current_user.to_dict()})


@bp.put("/me")
@auth_required
def update_me():
    data = json_body()
    user = g.current_user
    if "full_name" in data:
        user.full_name = clean_str(data["full_name"], "họ và tên", min_len=2, max_len=120, required=True)
    if "phone" in data:
        phone = clean_str(data["phone"], "số điện thoại", max_len=15, required=True)
        if not PHONE_RE.match(phone):
            raise ApiError("Số điện thoại không hợp lệ.")
        user.phone = phone
    db.session.commit()
    return jsonify({"user": user.to_dict()})
