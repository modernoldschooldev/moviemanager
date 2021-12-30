import { useContext, useEffect } from "react";
import { useFormikContext } from "formik";

import Loading from "./Loading";
import MovieSection from "./MovieSection";

import { useAppDispatch, useAppSelector } from "../state/hooks";
import { useMoviesQuery } from "../state/MovieManagerApi";
import { setMovieId } from "../state/SelectBoxSlice";
import StateContext from "../state/StateContext";

import { MovieType } from "../types/api";
import { MainPageFormValuesType } from "../types/form";
import { Actions } from "../types/state";

const MovieList = () => {
  const { dispatch } = useContext(StateContext);
  const { setFieldValue, setStatus } =
    useFormikContext<MainPageFormValuesType>();

  const movieId = useAppSelector((state) => state.selectBox.movieId);
  const reduxDispatch = useAppDispatch();
  const { data: movies, isLoading } = useMoviesQuery();

  useEffect(() => {
    if (movies) {
      movies.length > 0 && reduxDispatch(setMovieId(movies[0].id.toString()));
    }
  }, [movies, reduxDispatch]);

  useEffect(() => {
    (async () => {
      if (movieId) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/movies/${movieId}`
        );
        const data: MovieType = await response.json();

        if (response.ok) {
          setFieldValue("movieName", data.name ?? "");
          setFieldValue(
            "movieSeriesId",
            data.series ? data.series.id.toString() : ""
          );
          setFieldValue(
            "movieSeriesNumber",
            data.series_number ? data.series_number.toString() : ""
          );
          setFieldValue(
            "movieStudioId",
            data.studio ? data.studio.id.toString() : ""
          );
          setFieldValue(
            "movieCategories",
            data.categories.map((category) => category.id.toString())
          );

          dispatch({
            type: Actions.SetActorsSelected,
            payload: data.actors,
          });

          setStatus("");
        }
      }
    })();
  }, [dispatch, movieId, setStatus, setFieldValue]);

  return (
    <MovieSection title="Movie List">
      {isLoading ? (
        <div className="h-64">
          <Loading />
        </div>
      ) : (
        <select
          className="h-64 w-full"
          size={10}
          defaultValue={movies && movies[0]?.id}
          onChange={(e) => reduxDispatch(setMovieId(e.target.value))}
        >
          {movies?.map((movie) => (
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
