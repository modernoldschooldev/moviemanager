import MovieSection from "./MovieSection";

const MovieData = () => {
  return (
    <MovieSection title="Movie Data">
      <div>
        <form>
          <fieldset>
            <div className="flex my-2">
              <div className="w-1/4">Name</div>
              <div className="w-3/4">
                <input
                  className="border border-black focus:border-blue-700 w-full outline-1 rounded px-1"
                  type="text"
                />
              </div>
            </div>

            <div className="flex my-2">
              <div className="w-1/4">Studio</div>
              <div className="w-3/4">
                <select className="w-full py-1">
                  <option>Studio 1</option>
                  <option>Studio 2</option>
                  <option>Studio 3</option>
                  <option>Studio 4</option>
                  <option>Studio 5</option>
                </select>
              </div>
            </div>

            <div className="flex my-2">
              <div className="w-1/4">Series</div>
              <div className="w-3/4">
                <select className="w-full py-1">
                  <option>Series 1</option>
                  <option>Series 2</option>
                  <option>Series 3</option>
                  <option>Series 4</option>
                  <option>Series 5</option>
                </select>
              </div>
            </div>

            <div className="flex my-2">
              <div className="w-1/4">Series #</div>
              <div className="w-3/4">
                <input
                  className="border border-black focus:border-blue-700 w-full outline-1 rounded px-1"
                  type="text"
                />
              </div>
            </div>

            <div className="flex mt-6 mb-2">
              <button
                className="inline-block w-1/2 bg-green-700 hover:bg-green-600 text-white mx-2 p-2 uppercase font-bold rounded"
                type="submit"
              >
                Update
              </button>
              <button
                className="inline-block w-1/2 bg-red-700 hover:bg-red-600 text-white mx-2 p-2 uppercase font-bold rounded"
                type="button"
              >
                Remove
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </MovieSection>
  );
};

export default MovieData;
