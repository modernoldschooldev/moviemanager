import { useContext } from "react";
import { Field, useFormikContext } from "formik";

import Loading from "./Loading";
import MovieDataFormRow from "./MovieDataFormRow";
import MovieSection from "./MovieSection";

import { useAppSelector } from "../state/hooks";
import {
  useMoviesQuery,
  useSeriesQuery,
  useStudiosQuery,
} from "../state/MovieManagerApi";
import StateContext from "../state/StateContext";

import { MainPageFormValuesType } from "../types/form";
import { Actions } from "../types/state";

const MovieDataForm = () => {
  const { dispatch } = useContext(StateContext);
  const formik = useFormikContext<MainPageFormValuesType>();

  const movieId = useAppSelector((state) => state.selectBox.movieId);

  const { data: movies } = useMoviesQuery();
  const { data: series, isLoading: isSeriesLoading } = useSeriesQuery();
  const { data: studios, isLoading: isStudiosLoading } = useStudiosQuery();

  const onRemoveMovie = async () => {
    if (movieId) {
      const filename = movies?.filter((movie) => movie.id === +movieId)[0]
        .filename;

      if (window.confirm(`Really remove ${filename}?`)) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/movies/${movieId}`,
          {
            method: "DELETE",
          }
        );
        await response.json();

        if (response.ok) {
          formik.setStatus(`Successfully removed ${filename}`);
          formik.resetForm();

          dispatch({
            type: Actions.SetActorsSelected,
            payload: [],
          });
        } else {
          formik.setStatus(`Error removing ${filename}`);
        }
      }
    }
  };

  return (
    <MovieSection title="Movie Data">
      <div className="h-64">
        <form onSubmit={formik.handleSubmit}>
          <fieldset>
            <div>
              <MovieDataFormRow title="Name">
                <Field
                  className="movie-data-input"
                  type="text"
                  name="movieName"
                />
              </MovieDataFormRow>

              <MovieDataFormRow title="Studio">
                {isStudiosLoading ? (
                  <Loading />
                ) : (
                  <select
                    className="py-1 rounded-lg w-full"
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

              <MovieDataFormRow title="Series">
                {isSeriesLoading ? (
                  <Loading />
                ) : (
                  <select
                    className="py-1 rounded-lg w-full"
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

              <MovieDataFormRow title="Series #">
                <Field
                  className="movie-data-input"
                  type="text"
                  name="movieSeriesNumber"
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
                  <p className="font-semibold text-center">{formik.status}</p>
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
