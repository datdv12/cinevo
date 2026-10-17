"""Điểm chạy backend:  python run.py   (mặc định http://127.0.0.1:5000)

HOST/PORT/FLASK_DEBUG/APP_ENV đọc từ .env. Debug tự tắt nếu HOST không phải localhost hoặc APP_ENV=production.
"""
from app import create_app
from app.config import get_run_settings
from app.extensions import db
from database.seed import is_empty, seed_demo

app = create_app()

with app.app_context():
    db.create_all()          # tạo bảng nếu chưa có
    if is_empty():           # lần chạy đầu: nạp dữ liệu demo
        seed_demo()
        print(">> Đã tạo database SQLite và dữ liệu demo.")

if __name__ == "__main__":
    host, port, debug = get_run_settings()
    app.run(host=host, port=port, debug=debug)
