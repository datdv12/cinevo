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

  useEffect(() => { movieService.movie(id).then(setMovie).catch((e) => setError(e.message)); }, [id]);

  if (error) return <ErrorBox message={error} />;
  if (!movie) return <Loading />;
  return (
    <section className="detail">
      <Poster movie={movie} className="detail-poster" />
      <div>
        <h1 className="page-title">{movie.title}</h1>
        <p className="muted">{movie.genre}</p>
        <dl className="kv">
          <dt>Thời lượng</dt><dd>{movie.duration_minutes} phút</dd>
          <dt>Độ tuổi</dt><dd>{movie.age_rating}</dd>
          <dt>Đánh giá</dt><dd>★ {movie.rating}/10</dd>
          <dt>Đạo diễn</dt><dd>{movie.director}</dd>
          {movie.release_date && <><dt>Khởi chiếu</dt><dd>{formatDate(movie.release_date)}</dd></>}
        </dl>
        <p className="desc">{movie.description}</p>
        {movie.status === "now_showing"
          ? <Link className="btn btn-red" to={`/user/showtimes/${movie.id}`}>Chọn ngày, rạp và suất chiếu</Link>
          : <span className="badge">Sắp chiếu</span>}
      </div>
    </section>
  );
}
