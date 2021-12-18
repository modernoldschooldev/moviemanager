import { useContext } from "react";

import MovieSection from "./MovieSection";
import StateContext from "../state/StateContext";

const MovieList = () => {
  const { state } = useContext(StateContext);

  return (
    <MovieSection title="Movie List">
      <select className="h-64 w-full" size={10}>
        {state?.movies.map((movie, index) => (
          <option key={index}>{movie}</option>
        ))}
      </select>
    </MovieSection>
  );
};

export default MovieList;
