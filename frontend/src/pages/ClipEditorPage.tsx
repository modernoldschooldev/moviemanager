// components
import ActorList from "../components/ActorList";
import CategoryList from "../components/CategoryList";
import ClipEditorForm from "../components/ClipEditorForm";
import ClipList from "../components/ClipList";

const ClipEditorPage = () => {
  return (
    <>
      <div className="md:flex">
        <div className="my-2 md:w-3/5">
          <ClipList />
        </div>

        <div className="my-2 md:w-2/5">
          <ClipEditorForm />
        </div>
      </div>

      <div className="md:flex">
        <div className="my-2 md:w-3/5">
          <ActorList />
        </div>

        <div className="my-2 md:w-2/5">
          <CategoryList />
        </div>
      </div>
    </>
  );
};

export default ClipEditorPage;
