// react hooks
import { useEffect } from "react";

// redux
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  useClipQuery,
  useRemoveClipMutation,
  useSeriesQuery,
  useStudiosQuery,
  useUpdateClipMutation,
} from "../redux/api";
import { reset as resetActors } from "../redux/actorsLists";
import {
  reset as resetForm,
  setName,
  setSeriesId,
  setSeriesNumber,
  setStudioId,
} from "../redux/clipMeta";
import { selectClip } from "../redux/clipList";

// components
import SectionHeader from "./SectionHeader";

const ClipEditorForm = () => {
  const id = useAppSelector((state) => state.clipList.selected);
  const { data: clip } = useClipQuery(id ?? skipToken);

  const { name, studioId, seriesId, seriesNumber } = useAppSelector(
    (state) => state.clipMeta
  );

  const series = useSeriesQuery();
  const studios = useStudiosQuery();

  const [removeClip] = useRemoveClipMutation();
  const [updateClip] = useUpdateClipMutation();

  const dispatch = useAppDispatch();

  const onUpdateClip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (id) {
      await updateClip({
        id,
        name: name ? name : null,
        studio_id: studioId !== 0 ? studioId : null,
        series_id: seriesId !== 0 ? seriesId : null,
        series_num: seriesNumber ? +seriesNumber : null,
      });
    }
  };

  const onRemoveClip = async () => {
    if (id) {
      if (window.confirm(`Really remove ${clip?.filename}?`)) {
        dispatch(resetForm());
        dispatch(resetActors());
        dispatch(selectClip(null));
        await removeClip(id);
      }
    }
  };

  useEffect(() => {
    let name = "";
    let seriesNumber: number | "" = "";
    let studio = 0;
    let series = 0;

    if (clip) {
      if (clip.name) {
        name = clip.name;
      }

      if (clip.series) {
        series = clip.series.id;
      }

      if (clip.series_num) {
        seriesNumber = clip.series_num;
      }

      if (clip.studio) {
        studio = clip.studio.id;
      }
    }

    dispatch(setName(name));
    dispatch(setSeriesId(series));
    dispatch(setStudioId(studio));
    dispatch(setSeriesNumber(seriesNumber));
  }, [clip, dispatch]);

  return (
    <section className="border-2 border-black p-2 mx-2">
      <SectionHeader title="Clip Metadata" />

      <div className="border border-blue-500 p-2">
        <form onSubmit={onUpdateClip}>
          <fieldset disabled={!id || !clip}>
            <div className="flex my-2">
              <div className="w-1/5">
                <label htmlFor="name">Name</label>
              </div>

              <div className="w-4/5">
                <input
                  className="clip-input"
                  type="text"
                  value={name}
                  onChange={(e) => dispatch(setName(e.target.value))}
                />
              </div>
            </div>

            <div className="flex my-2">
              <div className="w-1/5">
                <label htmlFor="studio">Studio</label>
              </div>

              <div className="w-4/5">
                <select
                  className="w-full py-1"
                  value={studioId}
                  onChange={(e) => dispatch(setStudioId(+e.target.value))}
                >
                  <option value="0">None</option>
                  {studios.data?.map((studio) => {
                    return (
                      <option key={studio.id} value={studio.id}>
                        {studio.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex my-2">
              <div className="w-1/5">
                <label htmlFor="series">Series</label>
              </div>

              <div className="w-4/5">
                <select
                  className="w-full py-1"
                  value={seriesId}
                  onChange={(e) => dispatch(setSeriesId(+e.target.value))}
                >
                  <option value="0">None</option>
                  {series.data?.map((series) => {
                    return (
                      <option key={series.id} value={series.id}>
                        {series.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex my-2">
              <div className="w-1/5">
                <label htmlFor="studio">Series #</label>
              </div>

              <div className="w-4/5">
                <input
                  className="clip-input"
                  type="text"
                  value={seriesNumber}
                  onChange={(e) => dispatch(setSeriesNumber(+e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mx-2 my-4">
              <div>
                <button
                  className="clip-button bg-green-700 hover:bg-green-600"
                  type="submit"
                >
                  Update
                </button>
              </div>
              <div>
                <button
                  className="clip-button bg-red-700 hover:bg-red-600"
                  type="button"
                  onClick={onRemoveClip}
                >
                  Remove
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </section>
  );
};

export default ClipEditorForm;
