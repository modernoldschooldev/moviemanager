import MovieSection from "./MovieSection";

const ActorSelector = () => {
  return (
    <MovieSection title="Actors">
      <div className="flex h-96">
        <div className="m-2 w-1/2">
          <div>
            <h2 className="text-center text-lg font-bold">Available</h2>
          </div>

          <div>
            <select className="border border-green-500 w-full" size={13}>
              <option>Actor 1</option>
              <option>Actor 2</option>
              <option>Actor 3</option>
              <option>Actor 4</option>
              <option>Actor 5</option>
            </select>
          </div>
        </div>

        <div className="m-2 w-1/2">
          <div>
            <h2 className="text-center text-lg font-bold">Selected</h2>
          </div>
          <div>
            <select className="border border-green-500 w-full" size={13}>
              <option>Selected 1</option>
              <option>Selected 12</option>
              <option>Selected 2</option>
              <option>Selected 3</option>
              <option>Selected 4</option>
              <option>Selected 5</option>
            </select>
          </div>
        </div>
      </div>
    </MovieSection>
  );
};

export default ActorSelector;
