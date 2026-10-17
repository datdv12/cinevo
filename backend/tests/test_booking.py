"""Đặt vé: giá do server tính, chống đặt trùng ghế, quyền xem vé."""
import threading
from datetime import timedelta

from app.extensions import db
from app.models import Showtime
from app.timeutil import local_now


def book(client, headers, sid, seat_ids, foods=None, **extra):
    return client.post("/api/bookings", headers=headers,
                       json={"showtime_id": sid, "seat_ids": seat_ids, "foods": foods or [],
                             "payment_method": "QR", **extra})


def test_price_is_computed_by_server_and_client_price_ignored(client, auth, seat_info):
    sid, seats = seat_info
    standard = next(s for s in seats if s["type"] == "STANDARD")
    r = book(client, auth("user"), sid, [standard["id"]], [{"food_id": 2, "quantity": 1}],
             amount=1, total_amount=1, price=1)
    assert r.status_code == 201
    assert r.get_json()["total_amount"] == 90000 + 99000


def test_vip_surcharge(client, auth, seat_info):
    sid, seats = seat_info
    vip = next(s for s in seats if s["type"] == "VIP")
    assert book(client, auth("user"), sid, [vip["id"]]).get_json()["seat_amount"] == 110000


def test_booking_requires_login(client, seat_info):
    sid, seats = seat_info
    assert book(client, {}, sid, [seats[0]["id"]]).status_code == 401


def test_same_seat_cannot_be_booked_twice(client, auth, seat_info):
    sid, seats = seat_info
    assert book(client, auth("user"), sid, [seats[0]["id"]]).status_code == 201
    r = book(client, auth("manager"), sid, [seats[0]["id"]])
    assert r.status_code == 409 and r.get_json()["code"] == "SEAT_TAKEN"


def test_partial_overlap_rejects_whole_booking(client, auth, seat_info):
    sid, seats = seat_info
    book(client, auth("user"), sid, [seats[0]["id"]])
    assert book(client, auth("manager"), sid, [seats[0]["id"], seats[1]["id"]]).status_code == 409
    free = client.get(f"/api/showtimes/{sid}/seats").get_json()["seats"]
    assert next(s for s in free if s["id"] == seats[1]["id"])["booked"] is False   # ghế 2 không bị giữ nhầm


def test_seat_race_only_one_booking_succeeds(app, tokens, seat_info):
    """12 request đồng thời cùng một ghế -> đúng 1 vé hợp lệ."""
    sid, seats = seat_info
    results = []

    def go():
        c = app.test_client()
        results.append(book(c, {"Authorization": f"Bearer {tokens['user']}"}, sid, [seats[5]["id"]]).status_code)

    threads = [threading.Thread(target=go) for _ in range(12)]
    [t.start() for t in threads]
    [t.join() for t in threads]
    assert results.count(201) == 1 and results.count(409) == 11, results


def test_invalid_inputs_rejected(client, auth, seat_info):
    sid, seats = seat_info
    h, s = auth("user"), seats[0]["id"]
    assert book(client, h, sid, [s], [{"food_id": 1, "quantity": -5}]).status_code == 400
    assert book(client, h, sid, [s], [{"food_id": 1, "quantity": 999}]).status_code == 400
    assert book(client, h, sid, [s], ["khong-phai-dict"]).status_code == 400
    assert book(client, h, sid, [s, s]).status_code == 400            # ghế lặp
    assert book(client, h, sid, []).status_code == 400
    assert book(client, h, sid, list(range(1, 12))).status_code == 400  # quá 8 ghế
    assert book(client, h, 999999, [s]).status_code == 404
    assert client.post("/api/bookings", headers=h, json={"showtime_id": sid, "seat_ids": [s],
                       "payment_method": "BITCOIN"}).status_code == 400


def test_seat_from_other_room_rejected(client, auth, seat_info):
    sid, seats = seat_info
    other_sid = next(s["id"] for s in client.get("/api/showtimes?city=TP.HCM").get_json())
    other_seats = client.get(f"/api/showtimes/{other_sid}/seats").get_json()["seats"]
    assert book(client, auth("user"), sid, [other_seats[0]["id"]]).status_code == 400


def test_cannot_book_started_showtime(app, client, auth, seat_info):
    sid, seats = seat_info
    with app.app_context():
        db.session.get(Showtime, sid).start_time = local_now() - timedelta(minutes=1)
        db.session.commit()
    assert book(client, auth("user"), sid, [seats[0]["id"]]).status_code == 400


def test_booking_visible_only_to_owner_or_staff(client, auth, register_payload, seat_info):
    sid, seats = seat_info
    code = book(client, auth("user"), sid, [seats[0]["id"]]).get_json()["code"]
    assert client.get(f"/api/bookings/{code}", headers=auth("user")).status_code == 200
    assert client.get(f"/api/bookings/{code}", headers=auth("manager")).status_code == 200
    assert client.get(f"/api/bookings/{code}").status_code == 401
    # một USER khác không được xem
    client.post("/api/auth/register", json=register_payload)
    tok = client.post("/api/auth/verify-otp", json={"email": register_payload["email"], "code": "123456"}).get_json()["token"]
    assert client.get(f"/api/bookings/{code}", headers={"Authorization": f"Bearer {tok}"}).status_code == 404
    assert client.get("/api/bookings/my", headers={"Authorization": f"Bearer {tok}"}).get_json() == []


def test_payment_recorded_and_code_format(client, auth, seat_info):
    sid, seats = seat_info
    b = book(client, auth("user"), sid, [seats[0]["id"]]).get_json()
    assert b["code"].startswith("CV") and len(b["code"]) == 10
    assert b["payment"]["status"] == "PAID" and b["payment"]["amount"] == b["total_amount"]
