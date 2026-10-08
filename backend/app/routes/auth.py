"""Đăng ký / OTP / đăng nhập. Role khi tự đăng ký luôn là USER."""
import re

from flask import Blueprint, g, jsonify, request

from ..extensions import db
from ..models import ROLE_USER, Role, STATUS_ACTIVE, STATUS_PENDING, User, log_activity
from ..services.auth_service import (auth_required, create_token, issue_otp, mask_email, verify_otp)
from flask import current_app

bp = Blueprint("auth", __name__, url_prefix="/api/auth")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^(0|\+84)\d{9,10}$")


def _err(message, status=400, code=None):
    return jsonify({"message": message, "code": code}), status


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    # LƯU Ý BẢO MẬT: cố tình KHÔNG đọc data["role"]. Client không thể tự chọn MANAGER/ADMIN.
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""

    if len(full_name) < 2:
        return _err("Vui lòng nhập họ và tên.")
    if not EMAIL_RE.match(email):
        return _err("Email không hợp lệ.")
    if not PHONE_RE.match(phone):
        return _err("Số điện thoại không hợp lệ.")
    if len(password) < 6:
        return _err("Mật khẩu cần ít nhất 6 ký tự.")
    if password != data.get("confirm_password"):
        return _err("Mật khẩu nhập lại không khớp.")
    if not data.get("accept_terms"):
        return _err("Bạn cần đồng ý với điều khoản sử dụng.")

    user = User.query.filter_by(email=email).first()
    if user and user.status != STATUS_PENDING:
        return _err("Email này đã được sử dụng.", 409, "EMAIL_EXISTS")
    if not user:   # tài khoản PENDING cũ được phép đăng ký lại (cập nhật thông tin)
        user = User(email=email, role=Role.query.filter_by(name=ROLE_USER).one())
        db.session.add(user)
    user.full_name, user.phone, user.status = full_name, phone, STATUS_PENDING
    user.set_password(password)
    db.session.flush()
    hint = issue_otp(user)
    db.session.commit()

    body = {"message": "Đã gửi mã xác thực.", "email": email, "masked_email": mask_email(email)}
    if current_app.config["OTP_DEBUG_HINT"]:
        body["otp_hint"] = hint    # chỉ để demo. Production phải bỏ.
    return jsonify(body), 201


@bp.post("/verify-otp")
def verify():
    data = request.get_json(silent=True) or {}
    user = User.query.filter_by(email=(data.get("email") or "").strip().lower()).first()
    if not user or not verify_otp(user, str(data.get("code") or "")):
        return _err("Mã xác thực không đúng hoặc đã hết hạn.", 400, "OTP_INVALID")
    user.status = STATUS_ACTIVE
    log_activity(user.id, "REGISTER_VERIFIED", user.email)
    db.session.commit()
    return jsonify({"token": create_token(user), "user": user.to_dict()})


@bp.post("/resend-otp")
def resend():
    data = request.get_json(silent=True) or {}
    user = User.query.filter_by(email=(data.get("email") or "").strip().lower(),
                                status=STATUS_PENDING).first()
    if user:
        issue_otp(user)
        db.session.commit()
    return jsonify({"message": "Nếu email hợp lệ, mã mới đã được gửi."})


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(data.get("password") or ""):
        return _err("Email hoặc mật khẩu không đúng.", 401, "BAD_CREDENTIALS")
    if user.status == STATUS_PENDING:
        issue_otp(user)
        db.session.commit()
        return _err("Tài khoản chưa xác thực. Vui lòng nhập mã OTP.", 403, "NOT_VERIFIED")
    if user.status != STATUS_ACTIVE:
        return _err("Tài khoản đã bị khóa.", 403, "LOCKED")
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
    data = request.get_json(silent=True) or {}
    user = g.current_user
    if "full_name" in data and len(data["full_name"].strip()) >= 2:
        user.full_name = data["full_name"].strip()
    if "phone" in data and PHONE_RE.match(data["phone"].strip()):
        user.phone = data["phone"].strip()
    db.session.commit()
    return jsonify({"user": user.to_dict()})
