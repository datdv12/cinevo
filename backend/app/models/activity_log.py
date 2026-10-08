"""Model ActivityLog (nhật ký hoạt động cho trang Admin)."""
from datetime import datetime

from ..extensions import db


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    action = db.Column(db.String(60), nullable=False)
    detail = db.Column(db.String(250))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User")

    def to_dict(self):
        return {"id": self.id, "user": self.user.email if self.user else "-",
                "action": self.action, "detail": self.detail,
                "created_at": self.created_at.isoformat()}


def log_activity(user_id, action, detail=""):
    db.session.add(ActivityLog(user_id=user_id, action=action, detail=detail))
