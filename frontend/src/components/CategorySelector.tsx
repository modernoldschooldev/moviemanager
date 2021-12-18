import { useContext } from "react";

import MovieSection from "./MovieSection";
import StateContext from "../state/StateContext";

const CategorySelector = () => {
  const { state } = useContext(StateContext);

  return (
    <MovieSection title="Categories">
      <div className="h-72">
        <div className="gap-1 grid grid-cols-3 overflow-y-auto">
          {state?.categories.map((category, index) => (
            <div key={index}>
              <label>
                <input type="checkbox" /> {category}
              </label>
            </div>
          ))}
        </div>
      </div>
    </MovieSection>
  );
};

export default CategorySelector;
