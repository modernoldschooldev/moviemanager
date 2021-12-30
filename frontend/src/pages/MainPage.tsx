import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { Formik, FormikHelpers } from "formik";

import ActorSelector from "../components/ActorSelector";
import CategorySelector from "../components/CategorySelector";
import MovieDataForm from "../components/MovieDataForm";
import MovieList from "../components/MovieList";

import { useAppSelector } from "../state/hooks";
import { useMovieUpdateMutation } from "../state/MovieManagerApi";

import { HTTPExceptionType } from "../types/api";
import { MainPageFormValuesType } from "../types/form";

const initialValues: MainPageFormValuesType = {
  movieName: "",
  movieStudioId: "",
  movieSeriesId: "",
  movieSeriesNumber: "",
  movieCategories: [],
};

const MainPage = () => {
  const movieId = useAppSelector((state) => state.selectBox.movieId);
  const [trigger] = useMovieUpdateMutation();

  const onSubmit = async (
    values: MainPageFormValuesType,
    helpers: FormikHelpers<MainPageFormValuesType>
  ) => {
    if (movieId) {
      const params = {
        id: movieId,
        name: values.movieName ? values.movieName : null,
        series_id: values.movieSeriesId ? +values.movieSeriesId : null,
        series_number: values.movieSeriesNumber
          ? +values.movieSeriesNumber
          : null,
        studio_id: values.movieStudioId ? +values.movieStudioId : null,
      };

      try {
        await trigger(params).unwrap();
        helpers.setStatus(`Successfully updated movie ${values.movieName}`);
      } catch (error) {
        const { status, data } = error as FetchBaseQueryError;

        if (status !== 422) {
          const {
            detail: { message },
          } = data as HTTPExceptionType;

          helpers.setStatus(message ? message : "Unknown server error");
        }
      }
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {() => (
        <>
          <div className="lg:flex">
            <div className="m-2 lg:w-3/5">
              <MovieList />
            </div>
            <div className="m-2 lg:w-2/5">
              <MovieDataForm />
            </div>
          </div>

          <div className="lg:flex">
            <div className="m-2 lg:w-1/2">
              <ActorSelector />
            </div>
            <div className="m-2 lg:w-1/2">
              <CategorySelector />
            </div>
          </div>
        </>
      )}
    </Formik>
  );
};

export default MainPage;
