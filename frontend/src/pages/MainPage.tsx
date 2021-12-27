import { Formik, FormikHelpers } from "formik";

import ActorSelector from "../components/ActorSelector";
import CategorySelector from "../components/CategorySelector";
import MovieDataForm from "../components/MovieDataForm";
import MovieList from "../components/MovieList";

import { MainPageFormValuesType } from "../types/form";

const initialValues: MainPageFormValuesType = {
  movieId: undefined,
  movieName: "",
  movieStudioId: "",
  movieSeriesId: "",
  movieSeriesNumber: "",
  movieActorAvailableId: undefined,
  movieActorSelectedId: undefined,
  movieCategories: [],
};

const onSubmit = async (
  values: MainPageFormValuesType,
  helpers: FormikHelpers<MainPageFormValuesType>
) => {
  if (values.movieId) {
    const body = {
      name: values.movieName ? values.movieName : null,
      series_id: values.movieSeriesId ? +values.movieSeriesId : null,
      series_number: values.movieSeriesNumber
        ? +values.movieSeriesNumber
        : null,
      studio_id: values.movieStudioId ? +values.movieStudioId : null,
    };

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND}/movies/${values.movieId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    await response.json();

    if (response.ok) {
      helpers.setStatus(`Successfully updated movie ${values.movieName}`);
    } else {
      helpers.setStatus("Error updating movie.");
    }
  }
};

const MainPage = () => (
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

export default MainPage;
