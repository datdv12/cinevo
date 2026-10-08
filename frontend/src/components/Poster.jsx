// Poster phim: dùng ảnh nếu có, ngược lại vẽ bằng màu + tên phim (không cần file ảnh).
export default function Poster({ movie, className = "" }) {
  if (movie.poster_url) return <img className={`poster ${className}`} src={movie.poster_url} alt={movie.title} />;
  return (
    <div className={`poster poster-fallback ${className}`} style={{ "--poster": movie.poster_color }} aria-label={movie.title}>
      <span>{movie.title}</span>
    </div>
  );
}
