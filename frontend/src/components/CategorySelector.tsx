import { FetchBaseQueryError, skipToken } from "@reduxjs/toolkit/dist/query";
import { Field, useFormikContext } from "formik";

import Loading from "./Loading";
import MovieSection from "./MovieSection";

import { useAppSelector } from "../state/hooks";
import {
  useCategoriesQuery,
  useMovieCategoryAddMutation,
  useMovieCategoryDeleteMutation,
  useMovieQuery,
} from "../state/MovieManagerApi";

import { HTTPExceptionType, MovieType } from "../types/api";
import { MainPageFormValuesType } from "../types/form";

const CategorySelector = () => {
  const formik = useFormikContext<MainPageFormValuesType>();
  const movieId = useAppSelector((state) => state.selectBox.movieId);

  const { data: movie } = useMovieQuery(movieId ? movieId : skipToken);
  const { data: categories, isLoading } = useCategoriesQuery();

  const [movieCategoryAddTrigger] = useMovieCategoryAddMutation();
  const [movieCategoryDeleteTrigger] = useMovieCategoryDeleteMutation();

  const onUpdateCategory = async (id: string, selected: boolean) => {
    if (movieId) {
      const trigger = selected
        ? movieCategoryAddTrigger
        : movieCategoryDeleteTrigger;

      const categoryName = categories?.filter(
        (category) => category.id === +id
      )[0].name;

      try {
        const data: MovieType = await trigger({
          categoryId: id,
          movieId,
        }).unwrap();

        formik.setStatus(
          `Successfully ${
            selected ? "added" : "removed"
          } category ${categoryName} ${selected ? "to" : "from"} ${data.name}`
        );
      } catch (error) {
        const { status, data } = error as FetchBaseQueryError;

        formik.setFieldValue(
          "movieCategories",
          movie?.categories.map((category) => category.id.toString())
        );

        if (status !== 422) {
          const {
            detail: { message },
          } = data as HTTPExceptionType;

          formik.setStatus(message ? message : "Unknown server error");
        }
      }
    }
  };

  return (
    <MovieSection title="Categories">
      <div className="h-72">
        {isLoading ? (
          <Loading />
        ) : (
          <fieldset disabled={movieId === ""}>
            <div className="gap-1 grid grid-cols-3 overflow-y-auto">
              {categories?.map((category) => (
                <div key={category.id}>
                  <label>
                    <Field
                      type="checkbox"
                      name="movieCategories"
                      value={category.id.toString()}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        formik.handleChange(e);
                        onUpdateCategory(e.target.value, e.target.checked);
                      }}
                    />{" "}
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        )}
      </div>
    </MovieSection>
  );
};

export default CategorySelector;
