# CINEVO - Website đặt vé xem phim tích hợp AI

Khung dự án (boilerplate) gồm **React + Vite** (frontend), **Flask** (backend), **SQLite** (database) và module **AI** tách riêng.
Giai đoạn này chỉ dựng khung: thanh toán là **giả lập**, AI trả **dữ liệu giả định**, OTP là **mã cố định** (chưa gửi email thật).

## 1. Yêu cầu cài đặt
- Python 3.10 trở lên
- Node.js 18 trở lên

## 2. Chạy backend (Flask)
Mở terminal (PowerShell) tại thư mục dự án:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

- Lần chạy đầu tiên, `run.py` tự tạo file `backend/database/cinevo.db` cùng toàn bộ bảng và dữ liệu demo.
- Backend chạy tại http://localhost:5000 (kiểm tra: http://localhost:5000/api/health).
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
→ Chọn ghế (có nút AI gợi ý ghế 1-2 người)
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

## 8. Module AI (khung)
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

## 10. Việc tiếp theo (chưa làm ở giai đoạn khung)
Thanh toán thật, gửi OTP qua email, gọi AI/LLM thật, kết nối API phim thật, form Thêm/Sửa/Xóa trong trang manager/admin, hủy vé, khuyến mãi khi thanh toán.
