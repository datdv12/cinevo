"""Model User + OtpCode."""
from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db

STATUS_PENDING = "PENDING"   # đã đăng ký, chưa xác thực OTP
STATUS_ACTIVE = "ACTIVE"
STATUS_LOCKED = "LOCKED"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    status = db.Column(db.String(20), default=STATUS_PENDING, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    role = db.relationship("Role")

    def set_password(self, raw: str):
        self.password_hash = generate_password_hash(raw)

    def check_password(self, raw: str) -> bool:
        return check_password_hash(self.password_hash, raw)

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role.name if self.role else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class OtpCode(db.Model):
    """Mã OTP xác thực email (giai đoạn khung: mã giả lập, chưa gửi mail thật)."""
    __tablename__ = "otp_codes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    code = db.Column(db.String(10), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
