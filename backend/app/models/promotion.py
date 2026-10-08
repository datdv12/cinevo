"""Model Promotion (khuyến mãi)."""
from ..extensions import db


class Promotion(db.Model):
    __tablename__ = "promotions"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(30), unique=True, nullable=False)
    description = db.Column(db.String(250))
    discount_percent = db.Column(db.Integer, default=10)
    active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {"id": self.id, "code": self.code, "description": self.description,
                "discount_percent": self.discount_percent, "active": self.active}
