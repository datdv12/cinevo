import { useEffect, useState } from "react";
import ErrorBox from "../../components/ErrorBox";
import Loading from "../../components/Loading";
import MovieCard from "../../components/MovieCard";
import { useBooking } from "../../context/BookingContext";
import { movieService } from "../../services/movieService";

const GENRES = [
  "Hành động",
  "Hài",
  "Kinh dị",
  "Khoa học viễn tưởng",
  "Tình cảm",
  "Tâm lý",
  "Phiêu lưu",
  "Chiến tranh",
  "Lịch sử",
  "Hoạt hình",
];

export default function MovieListPage() {
  const { city } = useBooking();
  const [tab, setTab] = useState("now_showing");
  const [genre, setGenre] = useState("");
  const [q, setQ] = useState("");
  const [movies, setMovies] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setMovies(null);
    const t = setTimeout(() => {
      movieService
        .movies({
          status: tab,
          genre: genre || undefined,
          q: q.trim() || undefined,
          city: city || undefined,
        })
        .then((data) => {
          setMovies(data);
          setError("");
        })
        .catch((err) => {
          setError(err.message || "Không thể tải danh sách phim.");
          setMovies([]);
        });
    }, 200);
    return () => clearTimeout(t);
  }, [tab, genre, q, city]);

  return (
    <section>
      <h1 className="page-title">Phim{city ? ` tại ${city}` : ""}</h1>
      <div className="toolbar">
        <div className="chips" role="tablist" aria-label="Trạng thái phim">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "now_showing"}
            className={`chip ${tab === "now_showing" ? "active" : ""}`}
            onClick={() => setTab("now_showing")}
          >
            Đang chiếu
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "coming_soon"}
            className={`chip ${tab === "coming_soon" ? "active" : ""}`}
            onClick={() => setTab("coming_soon")}
          >
            Sắp chiếu
          </button>
        </div>
        <input
          type="search"
          className="search"
          placeholder="Tìm tên phim..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Tìm phim theo tên"
        />
      </div>

      <div className="chips" role="group" aria-label="Lọc theo thể loại">
        <button
          type="button"
          className={`chip ${!genre ? "active" : ""}`}
          onClick={() => setGenre("")}
        >
          Tất cả thể loại
        </button>
        {GENRES.map((g) => (
          <button
            key={g}
            type="button"
            className={`chip ${genre === g ? "active" : ""}`}
            onClick={() => setGenre(g === genre ? "" : g)}
          >
            {g}
          </button>
        ))}
      </div>

      {error && <ErrorBox message={error} />}

      {!movies && !error ? (
        <Loading />
      ) : movies && movies.length > 0 ? (
        <div className="grid">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        !error && <div className="state-box">Không tìm thấy phim phù hợp.</div>
      )}
    </section>
  );
}
