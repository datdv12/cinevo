import { Link } from "react-router-dom";
import Poster from "./Poster";

export default function MovieCard({ movie }) {
  return (
    <Link to={`/user/movies/${movie.id}`} className="movie-card">
      <Poster movie={movie} />
      <div className="movie-card-body">
        <h3>{movie.title}</h3>
        <p className="muted">{movie.genre}</p>
        <p className="muted small">{movie.duration_minutes} phút · {movie.age_rating} · ★ {movie.rating}</p>
      </div>
    </Link>
  );
}
