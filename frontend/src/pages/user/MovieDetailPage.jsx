import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorBox from "../../components/ErrorBox";
import Loading from "../../components/Loading";
import Poster from "../../components/Poster";
import { movieService } from "../../services/movieService";
import { formatDate } from "../../utils/format";

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    movieService
      .movie(id)
      .then(setMovie)
      .catch((e) => setError(e.message || "Không thể tải thông tin phim."));
  }, [id]);

  if (error) {
    return (
      <section>
        <div style={{ marginBottom: "1rem" }}>
          <Link to="/user/movies" className="link small">← Quay lại danh sách phim</Link>
        </div>
        <ErrorBox message={error} />
      </section>
    );
  }

  if (!movie) return <Loading />;

  return (
    <section>
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/user/movies" className="link small">← Quay lại danh sách phim</Link>
      </div>
      <div className="detail">
        <Poster movie={movie} className="detail-poster" />
        <div>
          <h1 className="page-title">{movie.title}</h1>
          <p className="muted">{movie.genre}</p>
          <dl className="kv">
            <dt>Thời lượng</dt>
            <dd>{movie.duration_minutes} phút</dd>
            <dt>Độ tuổi</dt>
            <dd>{movie.age_rating}</dd>
            <dt>Đánh giá</dt>
            <dd>★ {movie.rating}/10</dd>
            <dt>Đạo diễn</dt>
            <dd>{movie.director || "Đang cập nhật"}</dd>
            {(movie.actors || movie.cast) && (
              <>
                <dt>Diễn viên</dt>
                <dd>
                  {Array.isArray(movie.actors || movie.cast)
                    ? (movie.actors || movie.cast).join(", ")
                    : (movie.actors || movie.cast)}
                </dd>
              </>
            )}
            {movie.release_date && (
              <>
                <dt>Khởi chiếu</dt>
                <dd>{formatDate(movie.release_date)}</dd>
              </>
            )}
          </dl>
          <p className="desc">{movie.description}</p>
          {movie.status === "now_showing" ? (
            <Link className="btn btn-red" to={`/user/showtimes/${movie.id}`}>
              Chọn ngày, rạp và suất chiếu
            </Link>
          ) : (
            <span className="badge">Sắp chiếu</span>
          )}
        </div>
      </div>

      {(movie.trailer_url || movie.trailer) && (
        <div style={{ marginTop: "2rem" }}>
          <h2 className="section-title">Trailer</h2>
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: "var(--radius)",
              background: "var(--panel)",
            }}
          >
            <iframe
              src={movie.trailer_url || movie.trailer}
              title={`Trailer ${movie.title}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
