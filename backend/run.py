"""Điểm chạy backend:  python run.py   (mặc định http://localhost:5000)"""
import os

from app import create_app
from app.extensions import db
from database.seed import is_empty, seed_demo

app = create_app()

with app.app_context():
    db.create_all()          # tạo bảng nếu chưa có
    if is_empty():           # lần chạy đầu: nạp dữ liệu demo
        seed_demo()
        print(">> Đã tạo database SQLite và dữ liệu demo.")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
