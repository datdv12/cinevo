import { api } from "./api";

export const bookingService = {
  create: (payload) => api.post("/bookings", payload),
  mine: () => api.get("/bookings/my"),
  detail: (code) => api.get(`/bookings/${code}`),
};
