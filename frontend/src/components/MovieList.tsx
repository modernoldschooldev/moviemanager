import { useEffect } from "react";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useFormikContext } from "formik";

import Loading from "./Loading";
import MovieSection from "./MovieSection";

import { useAppDispatch, useAppSelector } from "../state/hooks";
import { useMovieQuery, useMoviesQuery } from "../state/MovieManagerApi";
import { setMovieId } from "../state/SelectBoxSlice";

import { MainPageFormValuesType } from "../types/form";

const MovieList = () => {
  const { setFieldValue, setStatus } =
    useFormikContext<MainPageFormValuesType>();

  const dispatch = useAppDispatch();
  const movieId = useAppSelector((state) => state.selectBox.movieId);

  const { data: movie } = useMovieQuery(movieId ? movieId : skipToken);
  const { data: movies, isLoading } = useMoviesQuery();

  useEffect(() => {
    (async () => {
      if (movie) {
        setFieldValue("movieName", movie.name ?? "");

        setFieldValue(
          "movieSeriesId",
          movie.series ? movie.series.id.toString() : ""
        );

        setFieldValue(
          "movieSeriesNumber",
          movie.series_number ? movie.series_number.toString() : ""
        );

        setFieldValue(
          "movieStudioId",
          movie.studio ? movie.studio.id.toString() : ""
        );

        setFieldValue(
          "movieCategories",
          movie.categories.map((category) => category.id.toString())
        );
      }
    })();
  }, [movie, setStatus, setFieldValue]);

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
          defaultValue={movieId ? movieId : undefined}
          onChange={(e) => {
            dispatch(setMovieId(e.target.value));
            setStatus("");
          }}
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
