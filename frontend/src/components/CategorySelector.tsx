import { useContext } from "react";
import { Field } from "formik";

import MovieSection from "./MovieSection";
import StateContext from "../state/StateContext";
import { MovieSectionProps } from "../types/form";

const CategorySelector = ({ formik }: MovieSectionProps) => {
  const { state } = useContext(StateContext);

  return (
    <MovieSection title="Categories">
      <div className="h-72">
        <div className="gap-1 grid grid-cols-3 overflow-y-auto">
          {state?.categories.map((category, index) => (
            <div key={index}>
              <label>
                <Field
                  type="checkbox"
                  name="movieCategories"
                  value={index.toString()}
                />{" "}
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
    </MovieSection>
  );
};

export default CategorySelector;
