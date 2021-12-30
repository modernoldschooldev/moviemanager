import { Field, useFormikContext } from "formik";

import Loading from "./Loading";
import MovieSection from "./MovieSection";

import { useAppSelector } from "../state/hooks";
import { useCategoriesQuery } from "../state/MovieManagerApi";

import { MovieType } from "../types/api";
import { MainPageFormValuesType } from "../types/form";

const CategorySelector = () => {
  const formik = useFormikContext<MainPageFormValuesType>();
  const movieId = useAppSelector((state) => state.selectBox.movieId);

  const { data: categories, isLoading } = useCategoriesQuery();

  const onUpdateCategory = async (id: string, selected: boolean) => {
    if (movieId) {
      const queryString = new URLSearchParams({
        movie_id: movieId,
        category_id: id,
      });
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/movie_category?${queryString}`,
        {
          method: selected ? "POST" : "DELETE",
        }
      );
      const data: MovieType = await response.json();

      const categoryName = categories?.filter(
        (category) => category.id === +id
      )[0].name;

      switch (response.status) {
        case 200:
          formik.setStatus(
            `Successfully ${
              selected ? "added" : "removed"
            } category ${categoryName} ${selected ? "to" : "from"} ${data.name}`
          );
          break;

        case 404:
          formik.setStatus("Server could not find category");
          break;

        case 409:
          formik.setStatus(`Category ${categoryName} is already selected`);
          break;

        default:
          formik.setStatus("Unknown server error");
          break;
      }
    }
  };

  return (
    <MovieSection title="Categories">
      <div className="h-72">
        {isLoading ? (
          <Loading />
        ) : (
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
        )}
      </div>
    </MovieSection>
  );
};

export default CategorySelector;
