// redux
import { useAppDispatch } from "../redux/hooks";
import { useClipsQuery } from "../redux/api";
import { selectClip } from "../redux/clipList";

// components
import SectionHeader from "./SectionHeader";

const ClipList = () => {
  const { data: clips, isLoading, isError, error, isSuccess } = useClipsQuery();

  const dispatch = useAppDispatch();

  return (
    <section className="border-2 border-black border-solid p-2 mx-2">
      <SectionHeader title="Clips" />

      <div className="border border-blue-500 p-2">
        {isLoading && <h2>Loading...</h2>}
        {isError && <h2>Error: {error}</h2>}
        {isSuccess && (
          <select
            className="w-full"
            id="clips"
            name="clips"
            size={10}
            onChange={(e) => {
              dispatch(selectClip(+e.target.value));
            }}
          >
            {clips?.map((clip) => (
              <option key={clip.id} value={clip.id}>
                {clip.filename}
              </option>
            ))}
          </select>
        )}
      </div>
    </section>
  );
};

export default ClipList;
