import MovieDataFormRow from "./MovieDataFormRow";
import MovieSection from "./MovieSection";

const MovieData = () => {
  return (
    <MovieSection title="Movie Data">
      <div className="h-64">
        <form>
          <fieldset>
            <div>
              <MovieDataFormRow title="Name">
                <input className="movie-data-input" type="text" />
              </MovieDataFormRow>

              <MovieDataFormRow title="Studio">
                <select className="py-1 rounded-lg w-full">
                  <option>Studio 1</option>
                  <option>Studio 2</option>
                  <option>Studio 3</option>
                  <option>Studio 4</option>
                  <option>Studio 5</option>
                </select>
              </MovieDataFormRow>

              <MovieDataFormRow title="Series">
                <select className="py-1 rounded-lg w-full">
                  <option>Series 1</option>
                  <option>Series 2</option>
                  <option>Series 3</option>
                  <option>Series 4</option>
                  <option>Series 5</option>
                </select>
              </MovieDataFormRow>

              <MovieDataFormRow title="Series #">
                <input className="movie-data-input" type="text" />
              </MovieDataFormRow>

              <div className="flex my-4">
                <button
                  className="movie-data-button bg-green-700 hover:bg-green-600"
                  type="submit"
                >
                  Update
                </button>

                <button
                  className="movie-data-button bg-red-700 hover:bg-red-600"
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </MovieSection>
  );
};

export default MovieData;
