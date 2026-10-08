"""Model Movie."""
from ..extensions import db


class Movie(db.Model):
    __tablename__ = "movies"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    genre = db.Column(db.String(120))                 # nhiều thể loại, ngăn cách bằng dấu phẩy
    duration_minutes = db.Column(db.Integer, default=120)
    age_rating = db.Column(db.String(10), default="T13")
    rating = db.Column(db.Float, default=0)           # điểm đánh giá 0-10
    director = db.Column(db.String(120))
    description = db.Column(db.Text)
    release_date = db.Column(db.Date)
    status = db.Column(db.String(20), default="now_showing")   # now_showing | coming_soon
    poster_url = db.Column(db.String(300))            # nếu trống, frontend vẽ poster bằng màu
    poster_color = db.Column(db.String(20), default="#7f1d1d")

    def to_dict(self):
        return {
            "id": self.id, "title": self.title, "genre": self.genre,
            "genres": [g.strip() for g in (self.genre or "").split(",") if g.strip()],
            "duration_minutes": self.duration_minutes, "age_rating": self.age_rating,
            "rating": self.rating, "director": self.director,
            "description": self.description,
            "release_date": self.release_date.isoformat() if self.release_date else None,
            "status": self.status, "poster_url": self.poster_url,
            "poster_color": self.poster_color,
        }
