"""Tài khoản: đăng ký, OTP, đăng nhập, chống nâng quyền, validate."""
from tests.conftest import ACCOUNTS


def test_register_always_creates_user_role_even_if_client_sends_role(client, register_payload):
    r = client.post("/api/auth/register", json={**register_payload, "role": "ADMIN", "role_id": 3, "status": "ACTIVE"})
    assert r.status_code == 201
    code = r.get_json()["otp_hint"]
    v = client.post("/api/auth/verify-otp", json={"email": register_payload["email"], "code": code}).get_json()
    assert v["user"]["role"] == "USER" and v["user"]["status"] == "ACTIVE"


def test_pending_account_cannot_login_until_verified(client, register_payload):
    client.post("/api/auth/register", json=register_payload)
    r = client.post("/api/auth/login", json={"email": register_payload["email"], "password": "abc123"})
    assert r.status_code == 403 and r.get_json()["code"] == "NOT_VERIFIED"


def test_duplicate_email_rejected(client, register_payload):
    r = client.post("/api/auth/register", json={**register_payload, "email": ACCOUNTS["user"][0]})
    assert r.status_code == 409 and r.get_json()["code"] == "EMAIL_EXISTS"


def test_wrong_password_and_unknown_user_give_same_error(client):
    a = client.post("/api/auth/login", json={"email": "user@cinevo.vn", "password": "sai"})
    b = client.post("/api/auth/login", json={"email": "khong@co.vn", "password": "sai"})
    assert a.status_code == b.status_code == 401 and a.get_json() == b.get_json()


def test_wrong_otp_rejected(client, register_payload):
    client.post("/api/auth/register", json=register_payload)
    r = client.post("/api/auth/verify-otp", json={"email": register_payload["email"], "code": "000000"})
    assert r.status_code == 400


def test_user_cannot_change_own_role_via_profile(client, auth):
    r = client.put("/api/auth/me", json={"role": "ADMIN", "full_name": "Zed"}, headers=auth("user"))
    assert r.get_json()["user"]["role"] == "USER"


def test_password_is_hashed(app):
    from app.models import User
    with app.app_context():
        u = User.query.filter_by(email="user@cinevo.vn").one()
        assert u.password_hash != "User@123" and u.password_hash.startswith(("scrypt:", "pbkdf2:"))


def test_locked_user_token_stops_working(client, auth):
    uid = client.get("/api/auth/me", headers=auth("user")).get_json()["user"]["id"]
    assert client.patch(f"/api/admin/users/{uid}/status", json={"status": "LOCKED"}, headers=auth("admin")).status_code == 200
    assert client.get("/api/auth/me", headers=auth("user")).status_code == 401
