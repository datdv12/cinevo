# CINEVO - Website đặt vé xem phim

Gồm **React + Vite** (frontend), **Flask** (backend) và **SQLite** (database).
Hiện tại thanh toán là **giả lập** và OTP là **mã cố định** (chưa gửi email thật).

> **Chưa tích hợp AI.** Theo lộ trình hiện tại, mọi tính năng AI đang **TẮT** (`FEATURE_AI=false`): giao diện ẩn và API `/api/ai/*` không tồn tại. Code AI được giữ lại trong `backend/app/ai/` để dùng ở giai đoạn sau, không xóa.

## 1. Yêu cầu cài đặt
- Python 3.10 trở lên
- Node.js 18 trở lên

## 2. Chạy backend (Flask)
(Tùy chọn) tạo file cấu hình: sao chép `.env.example` thành `.env`. Có thể bỏ qua khi phát triển, hệ thống tự dùng giá trị an toàn.
Mở terminal (PowerShell) tại thư mục dự án:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

- Lần chạy đầu tiên, `run.py` tự tạo file `backend/database/cinevo.db` cùng toàn bộ bảng và dữ liệu demo.
- Backend chỉ lắng nghe `127.0.0.1:5000` (kiểm tra: http://localhost:5000/api/health). Muốn mở cho mạng LAN phải đặt `HOST` trong `.env`, khi đó chế độ debug tự tắt.
- Nếu PowerShell chặn `activate`, chạy một lần: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- Muốn tạo lại database từ đầu (ví dụ ngày suất chiếu demo đã cũ): `python database/seed.py --reset`.

> Suất chiếu demo được tạo cho **5 ngày kể từ lúc tạo database**. Nếu thấy hết suất chiếu, hãy chạy lệnh `--reset` ở trên.

## 3. Chạy frontend (React + Vite)
Mở terminal thứ hai:

```powershell
cd frontend
npm install
npm run dev
```

Mở http://localhost:5173. Vite tự chuyển tiếp mọi request `/api` sang backend (cấu hình trong `vite.config.js`), nên không bị lỗi CORS.

## 4. Tài khoản test
| Vai trò | Email | Mật khẩu | Vào trang |
|---|---|---|---|
| USER | user@cinevo.vn | User@123 | `/user` |
| MANAGER | manager@cinevo.vn | Manager@123 | `/manager` |
| ADMIN | admin@cinevo.vn | Admin@123 | `/admin` |

Đăng nhập tại `/user/login`. Hệ thống tự chuyển ADMIN sang `/admin`, MANAGER sang `/manager`.
Khi tự đăng ký tài khoản mới, mã OTP demo là **123456**.

## 5. Luồng khách hàng đã được đáp ứng
```
Trang chủ → Chọn khu vực → Khám phá phim → Chi tiết phim → Chọn ngày & rạp → Chọn suất chiếu
→ Chọn ghế
→ [Bấm Tiếp tục] CHƯA đăng nhập mới hiện popup "Đăng nhập Cinevo" (Đăng ký / Đăng nhập)
→ Đăng ký: Họ tên, Email, SĐT, Mật khẩu, Nhập lại mật khẩu, đồng ý điều khoản
→ Xác thực OTP 6 số → tài khoản USER / ACTIVE
→ Xác nhận đặt vé (đơn được GIỮ NGUYÊN, không phải chọn lại)
→ Chọn combo (hoặc Bỏ qua) → Thanh toán (QR / Ví điện tử / Ngân hàng)
→ Vé điện tử có mã dạng CV10260001 + QR → Vé của tôi (Sắp tới có nút Xem QR / Đã xem)
```
Chi tiết kỹ thuật của từng yêu cầu:
- **Chỉ yêu cầu đăng nhập sau bước chọn ghế**: `SeatSelectionPage` gọi `requireLogin()` (xem `context/AuthContext.jsx`). Các trang khám phá là công khai.
- **Giữ nguyên đơn hàng**: `context/BookingContext.jsx` lưu suất chiếu, ghế, combo vào `localStorage`, nên đăng nhập, đăng ký hay tải lại trang đều không mất.
- **Email trùng**: backend trả `EMAIL_EXISTS`, frontend hiện "Email này đã được sử dụng. Bạn đã có tài khoản? [Đăng nhập]".
- **Role luôn là USER**: `routes/auth.py` cố tình không đọc trường `role` từ client. Tài khoản MANAGER chỉ do ADMIN tạo (`POST /api/admin/managers`).
- **Giá tính ở server**: client chỉ gửi `showtime_id`, `seat_ids`, `foods`; backend tự tính tiền (ghế VIP +20.000đ).
- **Chống đặt trùng ghế**: ràng buộc `UNIQUE(showtime_id, seat_id)` ở bảng `booking_seats`.
- **Vé của tôi**: nhóm Sắp tới / Đã xem dựa theo giờ chiếu.

## 6. Phân quyền
| Route | Ai được vào |
|---|---|
| `/user/*` (khám phá, chọn ghế, đăng nhập) | Công khai |
| `/user/checkout`, `food`, `payment`, `booking-success`, `my-tickets`, `profile` | Đã đăng nhập |
| `/manager/*` | MANAGER, ADMIN |
| `/admin/*` | ADMIN |

Frontend chặn bằng `ProtectedRoute`, và **backend kiểm tra lại** bằng `@roles_required` ở mọi API `/api/manager/*`, `/api/admin/*`.

## 7. Cấu trúc thư mục
```
Cinevo/
├── frontend/
│   ├── src/
│   │   ├── components/   Navbar, AuthPanel, AuthModal, SeatMap, TicketCard, ResourcePage...
│   │   ├── pages/
│   │   │   ├── user/     14 trang khách hàng
│   │   │   ├── manager/  9 trang quản lý rạp
│   │   │   └── admin/    10 trang quản trị
│   │   ├── layouts/      UserLayout, ManagerLayout, AdminLayout (+ PanelLayout dùng chung)
│   │   ├── services/     api.js (fetch + JWT) và các service gọi API
│   │   ├── context/      AuthContext (đăng nhập, popup), BookingContext (đơn đang đặt)
│   │   ├── utils/        format.js (tiền, ngày giờ)
│   │   ├── App.jsx       toàn bộ Router
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── routes/       auth, movies, cinemas, showtimes, bookings, admin, manager, ai
│   │   ├── models/       User, Role, Movie, Cinema, Room, Seat, Showtime, Booking, Food, Payment, Promotion (+ ActivityLog)
│   │   ├── services/     auth_service.py (JWT, phân quyền, OTP), booking_service.py (đặt vé)
│   │   ├── ai/           recommendation_service.py, seat_recommendation.py, chatbot_service.py
│   │   ├── config.py
│   │   └── __init__.py   application factory
│   ├── database/         seed.py (dữ liệu demo) + file cinevo.db sinh ra khi chạy
│   ├── requirements.txt
│   └── run.py
├── .env.example
├── .gitignore
└── README.md
```

## 8. Module AI (TẠM TẮT, giữ code)
Mặc định `FEATURE_AI=false` (xem `.env.example`). Khi tắt: không đăng ký route AI, `/api/admin/ai-settings` trả 404, frontend ẩn chatbot, mục gợi ý phim, nút gợi ý ghế và trang Quản lý AI. Chỉ bật khi được cho phép bắt đầu giai đoạn AI.

| Class | File | Hiện tại | Nơi gắn AI thật |
|---|---|---|---|
| `MovieRecommendationService` | `ai/recommendation_service.py` | Lọc theo thể loại, xếp theo điểm | `recommend()` |
| `SeatRecommendationService` | `ai/seat_recommendation.py` | Chấm điểm vị trí, tìm 1-2 ghế liền kề gần trung tâm | `recommend()` |
| `ChatbotService` | `ai/chatbot_service.py` | Trả lời theo từ khóa | `reply()` |

API: `GET /api/ai/recommend-movies?genre=`, `GET /api/ai/recommend-seats?showtime_id=&count=`, `POST /api/ai/chat`.
Mỗi chỗ cần gọi AI thật đều có comment `TODO (AI thật)`.

## 9. Chuyển sang PostgreSQL
Dùng SQLAlchemy nên không cần sửa model. Cài `pip install psycopg2-binary`, rồi đặt `DATABASE_URL` trong `.env`
(ví dụ `postgresql+psycopg2://user:pass@localhost:5432/cinevo`).

## 10. Bảo mật và cấu hình môi trường
| Hạng mục | Cách xử lý |
|---|---|
| `SECRET_KEY` | Production **bắt buộc** khóa ≥ 32 ký tự, thiếu/yếu là không khởi động. Development tự sinh khóa ngẫu nhiên (file `backend/database/.dev_secret_key`, đã ignore) |
| Debug | Chỉ bật ở development **và** khi `HOST` là localhost |
| OTP | Development: mã cố định `123456` + gợi ý trên giao diện. Production: mã ngẫu nhiên, không trả ra API (chưa có gửi email thật) |
| Giới hạn lần thử | Đăng nhập 10 lần/5 phút (theo IP + email); OTP 5 lần/10 phút/email; đăng ký 10 lần/giờ/IP. Trả `429` + `Retry-After` |
| Dữ liệu vào | Giới hạn độ dài, kiểm tra kiểu và giá trị; JSON hỏng trả `400`; body tối đa 1 MB |
| Giờ | Mốc hệ thống lưu UTC; giờ chiếu là giờ Việt Nam (UTC+7), xem `app/timeutil.py` |
| Header | `nosniff`, `X-Frame-Options`, `Referrer-Policy`; HSTS ở production |

Còn tồn đọng (ghi nhận, xử lý ở phase sau): token JWT lưu `localStorage` và chưa thu hồi được phía server; bộ đếm giới hạn lần thử là in-memory (cần Redis khi chạy nhiều worker); `npm audit` báo `vite` và `react-router-dom` có bản vá ở phiên bản major mới, chưa nâng cấp; chưa có migration (Alembic).

## 11. Kiểm thử
```powershell
cd backend
pip install -r requirements-dev.txt
python -m pytest
```
Bộ test (`backend/tests/`) gồm tài khoản, chống nâng quyền, ma trận phân quyền, token giả, tranh chấp ghế (12 request đồng thời), giá do server tính, validate, rate limit, cấu hình production.

## 12. Git và điểm khôi phục
Dự án đã có Git. Tag `phase0-baseline` là bản trước khi gia cố. Quay lại: `git checkout phase0-baseline`.
Trước mỗi thay đổi lớn hãy `git commit` và đặt tag mới.

## 13. Việc tiếp theo (chưa làm)
Thanh toán thật, gửi OTP qua email, kết nối API phim thật, form Thêm/Sửa/Xóa trong trang manager/admin, hủy vé, khuyến mãi khi thanh toán.
