import MovieSection from "./MovieSection";

const MovieList = () => {
  return (
    <MovieSection title="Movie List">
      <select className="h-64 w-full" size={10}>
        <option>Movie 1</option>
        <option>Movie 2</option>
        <option>Movie 3</option>
        <option>Movie 4</option>
        <option>Movie 5</option>
        <option>Movie 6</option>
        <option>Movie 7</option>
        <option>Movie 8</option>
        <option>Movie 9</option>
        <option>Movie 0</option>
        <option>Movie A</option>
        <option>Movie B</option>
        <option>Movie C</option>
        <option>Movie D</option>
      </select>
    </MovieSection>
  );
};

export default MovieList;
