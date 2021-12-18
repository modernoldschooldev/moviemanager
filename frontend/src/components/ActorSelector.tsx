import { useContext } from "react";

import ActorSelectorList from "./ActorSelectorList";
import MovieSection from "./MovieSection";
import StateContext from "../state/StateContext";

const ActorSelector = () => {
  const { state } = useContext(StateContext);

  return (
    <MovieSection title="Actors">
      <div className="flex h-96">
        <ActorSelectorList title="Available">
          <select className="border border-green-500 w-full" size={13}>
            {state?.actors.map((actor, index) => (
              <option key={index}>{actor}</option>
            ))}
          </select>
        </ActorSelectorList>

        <ActorSelectorList title="Selected">
          <select className="border border-green-500 w-full" size={13}>
            <option>Selected 1</option>
            <option>Selected 2</option>
            <option>Selected 3</option>
            <option>Selected 4</option>
            <option>Selected 5</option>
            <option>Selected 6</option>
            <option>Selected 7</option>
            <option>Selected 8</option>
            <option>Selected 9</option>
            <option>Selected 0</option>
          </select>
        </ActorSelectorList>
      </div>
    </MovieSection>
  );
};

export default ActorSelector;
