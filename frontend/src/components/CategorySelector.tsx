import { useContext, useEffect, useState } from "react";
import { Field } from "formik";

import Loading from "./Loading";
import MovieSection from "./MovieSection";

import StateContext from "../state/StateContext";

import { MovieSectionProps } from "../types/form";
import { Actions } from "../types/state";

const CategorySelector = ({ formik }: MovieSectionProps) => {
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(StateContext);

  const onUpdateCategory = async (id: string, selected: boolean) => {
    if (formik.values.movieId) {
      const queryString = new URLSearchParams({
        movie_id: formik.values.movieId,
        category_id: id,
      });
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/movie_category?${queryString}`,
        {
          method: selected ? "POST" : "DELETE",
        }
      );
      await response.json();
    }
  };

  useEffect(() => {
    (async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/categories`
      );
      const data = await response.json();

      dispatch({
        type: Actions.SetCategories,
        payload: data,
      });

      setLoading(false);
    })();
  }, [dispatch]);

  return (
    <MovieSection title="Categories">
      <div className="h-72">
        {loading ? (
          <Loading />
        ) : (
          <div className="gap-1 grid grid-cols-3 overflow-y-auto">
            {state?.categories.map((category) => (
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
