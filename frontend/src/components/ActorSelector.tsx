import ActorSelectorList from "./ActorSelectorList";
import MovieSection from "./MovieSection";

const ActorSelector = () => {
  return (
    <MovieSection title="Actors">
      <div className="flex h-96">
        <ActorSelectorList title="Available">
          <select className="border border-green-500 w-full" size={13}>
            <option>Actor 1</option>
            <option>Actor 2</option>
            <option>Actor 3</option>
            <option>Actor 4</option>
            <option>Actor 5</option>
            <option>Actor 6</option>
            <option>Actor 7</option>
            <option>Actor 8</option>
            <option>Actor 9</option>
            <option>Actor 0</option>
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
