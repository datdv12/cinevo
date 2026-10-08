// Các API AI hiện trả dữ liệu giả định từ backend (xem backend/app/ai).
import { api } from "./api";

export const aiService = {
  recommendMovies: (genre) => api.get(`/ai/recommend-movies${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`),
  recommendSeats: (showtimeId, count) => api.get(`/ai/recommend-seats?showtime_id=${showtimeId}&count=${count}`),
  chat: (message, history = []) => api.post("/ai/chat", { message, history }),
};
