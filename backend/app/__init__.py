"""Application factory của CINEVO."""
from flask import Flask, jsonify
from flask_cors import CORS

from .config import Config
from .extensions import db


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    from . import models  # noqa: F401  (đăng ký toàn bộ model với SQLAlchemy)
    from .routes import register_blueprints

    register_blueprints(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "app": "CINEVO"})

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"message": "Không tìm thấy tài nguyên."}), 404

    @app.errorhandler(500)
    def server_error(_e):
        return jsonify({"message": "Lỗi hệ thống, vui lòng thử lại."}), 500

    return app
