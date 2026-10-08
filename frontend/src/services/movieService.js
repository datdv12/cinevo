import { api } from "./api";

const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return s ? `?${s}` : "";
};

export const movieService = {
  cities: () => api.get("/cities"),
  movies: (params = {}) => api.get(`/movies${qs(params)}`),
  movie: (id) => api.get(`/movies/${id}`),
  cinemas: (city) => api.get(`/cinemas${qs({ city })}`),
  showtimes: (params = {}) => api.get(`/showtimes${qs(params)}`),
  seatMap: (showtimeId) => api.get(`/showtimes/${showtimeId}/seats`),
  foods: () => api.get("/foods"),
};
