// redux
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { setAvailable, setSelected } from "../redux/actorsLists";
import {
  useActorsQuery,
  useAddClipActorMutation,
  useClipQuery,
  useDeleteClipActorMutation,
} from "../redux/api";
import { useAppDispatch, useAppSelector } from "../redux/hooks";

// components
import SectionHeader from "./SectionHeader";

const ActorList = () => {
  const { data: actors } = useActorsQuery();

  const { available, selected } = useAppSelector((state) => state.actorsLists);

  const id = useAppSelector((state) => state.clipList.selected);
  const { data: clip } = useClipQuery(id ?? skipToken);

  const [addClipActor] = useAddClipActorMutation();
  const [deleteClipActor] = useDeleteClipActorMutation();

  const dispatch = useAppDispatch();

  const updateActor = async (actor_id: number, enabled: boolean) => {
    if (id) {
      const params = {
        clip_id: id,
        actor_id,
      };

      if (enabled) {
        await addClipActor(params);
      } else {
        await deleteClipActor(params);
      }
    }
  };

  return (
    <section className="border-2 border-solid border-black mx-2 p-2">
      <SectionHeader title="Actors" />

      <form>
        <div className="h-[25rem] border border-blue-500 border-solid p-2">
          <div className="h-full p-2 grid grid-cols-2">
            <div>
              <div>
                <h2 className="text-center">Available</h2>
              </div>
              <div className="mr-2">
                <select
                  size={13}
                  className="w-full border border-green-600"
                  onChange={(e) => {
                    dispatch(setAvailable(+e.target.value));
                  }}
                  onDoubleClick={() => updateActor(available, true)}
                  onKeyPress={(event) => {
                    event.code === "Enter" && updateActor(available, true);
                  }}
                >
                  {actors?.map((actor) => (
                    <option key={actor.id} value={actor.id}>
                      {actor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div>
                <h2 className="text-center">Selected</h2>
              </div>
              <div className="ml-2">
                {id && clip?.actors?.length! > 0 ? (
                  <select
                    size={13}
                    className="w-full border border-green-600"
                    onChange={(e) => {
                      dispatch(setSelected(+e.target.value));
                    }}
                    onDoubleClick={() => updateActor(selected, false)}
                    onKeyPress={(event) => {
                      event.code === "Enter" && updateActor(selected, false);
                    }}
                  >
                    {clip?.actors?.map((actor) => (
                      <option key={actor.id} value={actor.id}>
                        {actor.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="border border-green-600 text-center">
                    <h3>None</h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default ActorList;
