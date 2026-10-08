"""Đăng ký tất cả blueprint. Mọi API nằm dưới tiền tố /api."""


def register_blueprints(app):
    from .auth import bp as auth_bp
    from .movies import bp as movies_bp
    from .cinemas import bp as cinemas_bp
    from .showtimes import bp as showtimes_bp
    from .bookings import bp as bookings_bp
    from .manager import bp as manager_bp
    from .admin import bp as admin_bp
    from .ai import bp as ai_bp

    for bp in (auth_bp, movies_bp, cinemas_bp, showtimes_bp, bookings_bp, manager_bp, admin_bp, ai_bp):
        app.register_blueprint(bp)
