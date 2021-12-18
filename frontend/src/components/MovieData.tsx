import { useContext } from "react";
import { Field } from "formik";

import MovieDataFormRow from "./MovieDataFormRow";
import MovieSection from "./MovieSection";

import StateContext from "../state/StateContext";
import { MovieSectionProps } from "../types/form";

const MovieData = ({ formik }: MovieSectionProps) => {
  const { state } = useContext(StateContext);

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
                <select
                  className="py-1 rounded-lg w-full"
                  {...formik.getFieldProps("movieStudioId")}
                >
                  <option value="">None</option>
                  {state?.movieStudios.map((studio, index) => (
                    <option key={index} value={index}>
                      {studio}
                    </option>
                  ))}
                </select>
              </MovieDataFormRow>

              <MovieDataFormRow title="Series">
                <select
                  className="py-1 rounded-lg w-full"
                  {...formik.getFieldProps("movieSeriesId")}
                >
                  <option value="">None</option>
                  {state?.movieSeries.map((series, index) => (
                    <option key={index} value={index}>
                      {series}
                    </option>
                  ))}
                </select>
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
                >
                  Remove
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </MovieSection>
  );
};

export default MovieData;
