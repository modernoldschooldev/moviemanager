import { useContext, useEffect, useState } from "react";

import Loading from "./Loading";
import MovieSection from "./MovieSection";

import StateContext from "../state/StateContext";

import { MovieSectionProps } from "../types/form";
import { Actions } from "../types/state";

const MovieList = ({ formik }: MovieSectionProps) => {
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(StateContext);

  useEffect(() => {
    (async () => {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/movies`);
      const data = await response.json();

      dispatch({
        type: Actions.SetMovies,
        payload: data,
      });

      setLoading(false);
    })();
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      if (formik.values.movieId) {
        const id = +formik.values.movieId;

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/movies/${id}`
        );
        const data = await response.json();

        if (response.ok) {
          // TODO: finish me!
          formik.setValues({
            ...formik.values,
            movieName: data.name,
          });
        }
      }
    })();
  }, [formik.values.movieId]);

  return (
    <MovieSection title="Movie List">
      {loading ? (
        <div className="h-64">
          <Loading />
        </div>
      ) : (
        <select
          className="h-64 w-full"
          size={10}
          {...formik.getFieldProps("movieId")}
        >
          {state?.movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.filename}
            </option>
          ))}
        </select>
      )}
    </MovieSection>
  );
};

export default MovieList;
