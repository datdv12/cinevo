"""Import toàn bộ model để SQLAlchemy nhận diện khi create_all()."""
from .role import Role, ROLE_USER, ROLE_MANAGER, ROLE_ADMIN
from .user import User, OtpCode, STATUS_ACTIVE, STATUS_PENDING, STATUS_LOCKED
from .movie import Movie
from .cinema import Cinema
from .room import Room
from .seat import Seat, SEAT_STANDARD, SEAT_VIP, VIP_SURCHARGE
from .showtime import Showtime
from .food import Food
from .booking import Booking, BookingSeat, BookingFood
from .payment import Payment, PAYMENT_METHODS
from .promotion import Promotion
from .activity_log import ActivityLog, log_activity
