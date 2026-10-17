"""Gửi OTP. GIAI ĐOẠN KHUNG: chưa có nhà cung cấp email, chỉ ghi log ở development."""
import logging

from flask import current_app

log = logging.getLogger(__name__)


def deliver_otp(email: str, code: str) -> None:
    if current_app.config["IS_PRODUCTION"]:
        # TODO (Phase tích hợp email): gọi SMTP/SendGrid/SES. KHÔNG ghi mã OTP vào log ở production.
        log.warning("Chưa cấu hình gửi email OTP cho %s.", email)
    else:
        log.info("[DEV] Mã OTP của %s là %s", email, code)
