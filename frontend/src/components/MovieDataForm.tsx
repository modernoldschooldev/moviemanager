import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { Field, useFormikContext } from "formik";

import Loading from "./Loading";
import MovieDataFormRow from "./MovieDataFormRow";
import MovieSection from "./MovieSection";

import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
  useMovieDeleteMutation,
  useMoviesQuery,
  useSeriesQuery,
  useStudiosQuery,
} from "../state/MovieManagerApi";
import { reset } from "../state/SelectBoxSlice";

import { HTTPExceptionType } from "../types/api";
import { MainPageFormValuesType } from "../types/form";

const MovieDataForm = () => {
  const formik = useFormikContext<MainPageFormValuesType>();

  const dispatch = useAppDispatch();
  const movieId = useAppSelector((state) => state.selectBox.movieId);

  const { data: movies } = useMoviesQuery();
  const { data: series, isLoading: isSeriesLoading } = useSeriesQuery();
  const { data: studios, isLoading: isStudiosLoading } = useStudiosQuery();

  const [trigger] = useMovieDeleteMutation();

  const onRemoveMovie = async () => {
    if (movieId) {
      const filename = movies?.filter((movie) => movie.id === +movieId)[0]
        .filename;

      if (window.confirm(`Really remove ${filename}?`)) {
        try {
          await trigger(movieId).unwrap();

          formik.setStatus(`Successfully removed ${filename}`);
          formik.resetForm();

          dispatch(reset());
        } catch (error) {
          const { status, data } = error as FetchBaseQueryError;

          if (status !== 422) {
            const {
              detail: { message },
            } = data as HTTPExceptionType;

            formik.setStatus(message ? message : "Unknown server error");
          }
        }
      }
    }
  };

  return (
    <MovieSection title="Movie Data">
      <div className="h-64">
        <form onSubmit={formik.handleSubmit}>
          <fieldset disabled={!movieId}>
            <div>
              <MovieDataFormRow name="movieName" title="Name">
                <Field
                  className="movie-data-input"
                  type="text"
                  name="movieName"
                  id="movieName"
                />
              </MovieDataFormRow>

              <MovieDataFormRow name="movieStudioId" title="Studio">
                {isStudiosLoading ? (
                  <Loading />
                ) : (
                  <select
                    className="py-1 rounded-lg w-full"
                    id="movieStudioId"
                    {...formik.getFieldProps("movieStudioId")}
                  >
                    <option value="">None</option>
                    {studios?.map((studio) => (
                      <option key={studio.id} value={studio.id}>
                        {studio.name}
                      </option>
                    ))}
                  </select>
                )}
              </MovieDataFormRow>

              <MovieDataFormRow name="movieSeriesId" title="Series">
                {isSeriesLoading ? (
                  <Loading />
                ) : (
                  <select
                    className="py-1 rounded-lg w-full"
                    id="movieSeriesId"
                    {...formik.getFieldProps("movieSeriesId")}
                  >
                    <option value="">None</option>
                    {series?.map((series) => (
                      <option key={series.id} value={series.id}>
                        {series.name}
                      </option>
                    ))}
                  </select>
                )}
              </MovieDataFormRow>

              <MovieDataFormRow name="movieSeriesNumber" title="Series #">
                <Field
                  className="movie-data-input"
                  type="text"
                  name="movieSeriesNumber"
                  id="movieSeriesNumber"
                />
              </MovieDataFormRow>

              <div className="flex my-4">
                <button
                  className="movie-data-button bg-green-700 hover:bg-green-600"
                  type="submit"
                >
                  Update
                </button>

                <button
                  className="movie-data-button bg-red-700 hover:bg-red-600"
                  type="button"
                  onClick={onRemoveMovie}
                >
                  Remove
                </button>
              </div>

              {formik.status && (
                <div>
                  <p className="font-semibold text-center text-sm">
                    {formik.status}
                  </p>
                </div>
              )}
            </div>
          </fieldset>
        </form>
      </div>
    </MovieSection>
  );
};

export default MovieDataForm;
