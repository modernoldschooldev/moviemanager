import MovieSection from "./MovieSection";

const MovieList = () => {
  return (
    <MovieSection title="Movie List">
      <select className="w-full" size={10}>
        <option>Movie 1</option>
        <option>Movie 2</option>
        <option>Movie 3</option>
        <option>Movie 4</option>
        <option>Movie 5</option>
        <option>Movie 6</option>
        <option>Movie 7</option>
      </select>
    </MovieSection>
  );
};

export default MovieList;
