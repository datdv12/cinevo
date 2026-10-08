"""Cấu hình ứng dụng. Giá trị đọc từ file .env (xem .env.example ở thư mục gốc)."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent          # .../Cinevo/backend
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "24"))

    # SQLite mặc định. Sau này chỉ cần đổi DATABASE_URL sang PostgreSQL, ví dụ:
    # postgresql+psycopg2://user:pass@localhost:5432/cinevo
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", f"sqlite:///{(BASE_DIR / 'database' / 'cinevo.db').as_posix()}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

    # OTP giả lập: giai đoạn khung chưa gửi email thật.
    MOCK_OTP_CODE = os.getenv("MOCK_OTP_CODE", "123456")
    OTP_DEBUG_HINT = os.getenv("OTP_DEBUG_HINT", "true").lower() == "true"
