import { useContext, useEffect, useState } from "react";

import Loading from "./Loading";
import MovieSection from "./MovieSection";

import StateContext from "../state/StateContext";

import { MovieFileType, MovieInfoResponseType } from "../types/api";
import { MovieSectionProps } from "../types/form";
import { Actions } from "../types/state";

const MovieList = ({ formik }: MovieSectionProps) => {
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(StateContext);
  const {
    setFieldValue,
    setStatus,
    values: { movieId },
  } = formik;

  useEffect(() => {
    (async () => {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/movies`);
      const data: MovieFileType[] = await response.json();

      dispatch({
        type: Actions.SetMovies,
        payload: data,
      });

      data.length > 0 && setFieldValue("movieId", data[0].id);

      setLoading(false);
    })();
  }, [dispatch, setFieldValue]);

  useEffect(() => {
    (async () => {
      if (movieId) {
        const id = +movieId;

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/movies/${id}`
        );
        const data: MovieInfoResponseType = await response.json();

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
      {loading ? (
        <div className="h-64">
          <Loading />
        </div>
      ) : (
        <select
          className="h-64 w-full"
          size={10}
          name="movieId"
          onChange={formik.handleChange}
        >
          {state?.movies.map((movie, index) => (
            <option key={movie.id} value={movie.id} selected={index === 0}>
              {movie.filename}
            </option>
          ))}
        </select>
      )}
    </MovieSection>
  );
};

export default MovieList;
