import ActorSelector from "../components/ActorSelector";
import CategorySelector from "../components/CategorySelector";
import MetadataEditor from "../components/MetadataEditor";
import MovieList from "../components/MovieList";

const MainPage = () => {
  return (
    <>
      <div className="lg:flex">
        <div className="m-2 lg:w-3/5">
          <MovieList />
        </div>
        <div className="m-2 lg:w-2/5">
          <MetadataEditor />
        </div>
      </div>

      <div className="lg:flex">
        <div className="m-2 lg:w-1/2">
          <ActorSelector />
        </div>
        <div className="m-2 lg:w-1/2">
          <CategorySelector />
        </div>
      </div>
    </>
  );
};

export default MainPage;
