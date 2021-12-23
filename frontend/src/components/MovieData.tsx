import { useContext, useEffect, useState } from "react";
import { Field } from "formik";

import Loading from "./Loading";
import MovieDataFormRow from "./MovieDataFormRow";
import MovieSection from "./MovieSection";

import StateContext from "../state/StateContext";

import { MovieSectionProps } from "../types/form";
import { Actions } from "../types/state";

const MovieData = ({ formik }: MovieSectionProps) => {
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(StateContext);

  const onRemoveMovie = async () => {
    if (formik.values.movieId) {
      const id = +formik.values.movieId;
      const filename = state?.movies.filter((movie) => movie.id === id)[0]
        .filename;

      if (window.confirm(`Really remove ${filename}?`)) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/movies/${id}`,
          {
            method: "DELETE",
          }
        );
        await response.json();

        if (response.ok) {
          formik.setStatus(`Successfully removed ${filename}`);
        } else {
          formik.setStatus(`Error removing ${filename}`);
        }
      }
    }
  };

  useEffect(() => {
    (async () => {
      const helper = async (endpoint: string, type: Actions) => {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/${endpoint}`
        );
        const payload = await response.json();

        dispatch({
          type,
          payload,
        });
      };

      await helper("series", Actions.SetSeries);
      await helper("studios", Actions.SetStudios);

      setLoading(false);
    })();
  }, [dispatch]);

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
                {loading ? (
                  <Loading />
                ) : (
                  <select
                    className="py-1 rounded-lg w-full"
                    {...formik.getFieldProps("movieStudioId")}
                  >
                    <option value="">None</option>
                    {state?.studios.map((studio) => (
                      <option key={studio.id} value={studio.id}>
                        {studio.name}
                      </option>
                    ))}
                  </select>
                )}
              </MovieDataFormRow>

              <MovieDataFormRow title="Series">
                {loading ? (
                  <Loading />
                ) : (
                  <select
                    className="py-1 rounded-lg w-full"
                    {...formik.getFieldProps("movieSeriesId")}
                  >
                    <option value="">None</option>
                    {state?.series.map((series) => (
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

export default MovieData;
