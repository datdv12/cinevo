// Trang chủ: chọn khu vực → khám phá phim. Không cần đăng nhập.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CitySelector from "../../components/CitySelector";
import MovieCard from "../../components/MovieCard";
import Loading from "../../components/Loading";
import { useBooking } from "../../context/BookingContext";
import { aiService } from "../../services/aiService";
import { movieService } from "../../services/movieService";

const GENRES = ["Hành động", "Hài", "Kinh dị", "Khoa học viễn tưởng", "Tình cảm"];

export default function HomePage() {
  const { city } = useBooking();
  const [showing, setShowing] = useState(null);
  const [coming, setComing] = useState([]);
  const [genre, setGenre] = useState("");
  const [ai, setAi] = useState(null);

  useEffect(() => {
    setShowing(null);
    movieService.movies({ status: "now_showing", city }).then(setShowing).catch(() => setShowing([]));
  }, [city]);
  useEffect(() => { movieService.movies({ status: "coming_soon" }).then(setComing).catch(() => {}); }, []);
  useEffect(() => { aiService.recommendMovies(genre).then(setAi).catch(() => setAi(null)); }, [genre]);

  return (
    <>
      <section className="hero">
        <h1>Chọn phim.<br />Chọn ghế.<br />Vào rạp.</h1>
        <p className="muted">Khám phá phim và suất chiếu trước, chỉ cần đăng nhập khi bạn đã chọn xong ghế.</p>
        <p className="small">Bạn xem phim ở đâu?</p>
        <CitySelector variant="chips" />
        <Link to="/user/movies" className="btn btn-red">Xem tất cả phim</Link>
      </section>

      <section>
        <h2 className="section-title">Phim đang chiếu{city && ` tại ${city}`}</h2>
        {!showing ? <Loading /> : showing.length ? (
          <div className="grid">{showing.map((m) => <MovieCard key={m.id} movie={m} />)}</div>
        ) : <div className="state-box">Chưa có suất chiếu tại khu vực này. Hãy thử khu vực khác.</div>}
      </section>

      <section>
        <h2 className="section-title">Cinevo AI gợi ý cho bạn</h2>
        <div className="chips">
          <button className={`chip ${!genre ? "active" : ""}`} onClick={() => setGenre("")}>Nổi bật</button>
          {GENRES.map((g) => <button key={g} className={`chip ${g === genre ? "active" : ""}`} onClick={() => setGenre(g)}>{g}</button>)}
        </div>
        {ai && (
          <>
            <p className="muted">{ai.message}</p>
            <div className="grid">{ai.movies.slice(0, 4).map((m) => <MovieCard key={m.id} movie={m} />)}</div>
          </>
        )}
      </section>

      {coming.length > 0 && (
        <section>
          <h2 className="section-title">Sắp chiếu</h2>
          <div className="grid">{coming.map((m) => <MovieCard key={m.id} movie={m} />)}</div>
        </section>
      )}
    </>
  );
}
