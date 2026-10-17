"""Application factory của CINEVO."""
from flask import Flask, jsonify
from flask_cors import CORS

from .config import Config
from .extensions import db
from .services.validation import ApiError


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

    @app.get("/api/config")
    def public_config():
        """Cho frontend biết tính năng nào đang bật (không chứa thông tin bí mật)."""
        return jsonify({"features": {"ai": bool(app.config["FEATURE_AI"])}})

    @app.after_request
    def security_headers(resp):
        resp.headers.setdefault("X-Content-Type-Options", "nosniff")
        resp.headers.setdefault("X-Frame-Options", "DENY")
        resp.headers.setdefault("Referrer-Policy", "no-referrer")
        if app.config["IS_PRODUCTION"]:
            resp.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        return resp

    @app.errorhandler(ApiError)
    def api_error(e):
        return jsonify({"message": e.message, "code": e.code}), e.status

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"message": "Không tìm thấy tài nguyên."}), 404

    @app.errorhandler(405)
    def not_allowed(_e):
        return jsonify({"message": "Phương thức không được hỗ trợ."}), 405

    @app.errorhandler(413)
    def too_large(_e):
        return jsonify({"message": "Dữ liệu gửi lên quá lớn."}), 413

    @app.errorhandler(500)
    def server_error(_e):
        return jsonify({"message": "Lỗi hệ thống, vui lòng thử lại."}), 500

    return app
