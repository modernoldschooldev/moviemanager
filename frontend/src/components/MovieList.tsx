import { useContext } from "react";

import MovieSection from "./MovieSection";
import StateContext from "../state/StateContext";
import { MovieSectionProps } from "../types/form";

const MovieList = ({ formik }: MovieSectionProps) => {
  const { state } = useContext(StateContext);

  return (
    <MovieSection title="Movie List">
      <select
        className="h-64 w-full"
        size={10}
        {...formik.getFieldProps("movieId")}
      >
        {state?.movies.map((movie, index) => (
          <option key={index} value={index}>
            {movie}
          </option>
        ))}
      </select>
    </MovieSection>
  );
};

export default MovieList;
