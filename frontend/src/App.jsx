// Định tuyến chính. Khách khám phá phim tự do; các bước sau khi chọn ghế yêu cầu đăng nhập.
// /user/*  -> khách hàng | /manager/* -> quản lý rạp | /admin/* -> quản trị viên
import { Navigate, Route, Routes } from "react-router-dom";
import AuthModal from "./components/AuthModal";
import FeatureGate from "./components/FeatureGate";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import UserLayout from "./layouts/UserLayout";

import HomePage from "./pages/user/HomePage";
import MovieListPage from "./pages/user/MovieListPage";
import MovieDetailPage from "./pages/user/MovieDetailPage";
import CinemaListPage from "./pages/user/CinemaListPage";
import ShowtimePage from "./pages/user/ShowtimePage";
import SeatSelectionPage from "./pages/user/SeatSelectionPage";
import FoodPage from "./pages/user/FoodPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import PaymentPage from "./pages/user/PaymentPage";
import BookingSuccessPage from "./pages/user/BookingSuccessPage";
import MyTicketsPage from "./pages/user/MyTicketsPage";
import ProfilePage from "./pages/user/ProfilePage";
import LoginPage from "./pages/user/LoginPage";
import RegisterPage from "./pages/user/RegisterPage";

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import MovieManagement from "./pages/manager/MovieManagement";
import CinemaManagement from "./pages/manager/CinemaManagement";
import RoomManagement from "./pages/manager/RoomManagement";
import SeatManagement from "./pages/manager/SeatManagement";
import ShowtimeManagement from "./pages/manager/ShowtimeManagement";
import BookingManagement from "./pages/manager/BookingManagement";
import FoodManagement from "./pages/manager/FoodManagement";
import ReportPage from "./pages/manager/ReportPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ManagerManagement from "./pages/admin/ManagerManagement";
import AdminMovieManagement from "./pages/admin/AdminMovieManagement";
import TransactionManagement from "./pages/admin/TransactionManagement";
import PromotionManagement from "./pages/admin/PromotionManagement";
import AIManagement from "./pages/admin/AIManagement";
import RoleManagement from "./pages/admin/RoleManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import ActivityLog from "./pages/admin/ActivityLog";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />

        {/* ===== KHÁCH HÀNG ===== */}
        <Route path="/user" element={<UserLayout />}>
          {/* Công khai: khám phá phim, rạp, suất chiếu, chọn ghế */}
          <Route index element={<HomePage />} />
          <Route path="movies" element={<MovieListPage />} />
          <Route path="movies/:id" element={<MovieDetailPage />} />
          <Route path="cinemas" element={<CinemaListPage />} />
          <Route path="showtimes/:movieId" element={<ShowtimePage />} />
          <Route path="seats/:showtimeId" element={<SeatSelectionPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          {/* Cần đăng nhập: từ bước xác nhận đặt vé trở đi */}
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="food" element={<FoodPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="booking-success/:code" element={<BookingSuccessPage />} />
            <Route path="my-tickets" element={<MyTicketsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ===== QUẢN LÝ RẠP (MANAGER, ADMIN) ===== */}
        <Route path="/manager" element={<ProtectedRoute roles={["MANAGER", "ADMIN"]}><ManagerLayout /></ProtectedRoute>}>
          <Route index element={<ManagerDashboard />} />
          <Route path="movies" element={<MovieManagement />} />
          <Route path="cinemas" element={<CinemaManagement />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="seats" element={<SeatManagement />} />
          <Route path="showtimes" element={<ShowtimeManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="foods" element={<FoodManagement />} />
          <Route path="report" element={<ReportPage />} />
        </Route>

        {/* ===== QUẢN TRỊ (chỉ ADMIN) ===== */}
        <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="managers" element={<ManagerManagement />} />
          <Route path="movies" element={<AdminMovieManagement />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
          <Route path="ai" element={<FeatureGate feature="ai" fallback="/admin"><AIManagement /></FeatureGate>} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="logs" element={<ActivityLog />} />
        </Route>

        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
      <AuthModal />
    </>
  );
}
