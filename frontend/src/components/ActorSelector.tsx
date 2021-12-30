import { useContext, useEffect, useState } from "react";
import { useFormikContext } from "formik";

import ActorSelectorList from "./ActorSelectorList";
import Loading from "./Loading";
import MovieSection from "./MovieSection";

import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setAvailableId, setSelectedId } from "../state/SelectBoxSlice";
import StateContext from "../state/StateContext";

import { MovieType } from "../types/api";
import { MainPageFormValuesType } from "../types/form";
import { Actions } from "../types/state";

const ActorSelector = () => {
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(StateContext);
  const formik = useFormikContext<MainPageFormValuesType>();

  const { availableId, movieId, selectedId } = useAppSelector(
    (state) => state.selectBox
  );
  const reduxDispatch = useAppDispatch();

  const onUpdateActor = async (selected: boolean) => {
    if (movieId) {
      const id = selected ? availableId : selectedId;

      const queryString = new URLSearchParams({
        movie_id: movieId,
        actor_id: id,
      });

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/movie_actor?${queryString}`,
        {
          method: selected ? "POST" : "DELETE",
        }
      );
      const data: MovieType = await response.json();

      const actorName = state?.actorsAvailable.filter(
        (actor) => actor.id === +id
      )[0].name;

      switch (response.status) {
        case 200:
          dispatch({
            type: Actions.SetActorsSelected,
            payload: data.actors,
          });

          formik.setStatus(
            `Successfully ${selected ? "added" : "removed"} ${actorName} ${
              selected ? "to" : "from"
            } ${data.name}`
          );
          break;

        case 404:
          formik.setStatus("Server could not find actor");
          break;

        case 409:
          formik.setStatus(`Actor ${actorName} is already selected`);
          break;

        default:
          formik.setStatus("Unknown server error");
          break;
      }
    }
  };

  useEffect(() => {
    (async () => {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/actors`);
      const data = await response.json();

      dispatch({
        type: Actions.SetActorsAvailable,
        payload: data,
      });

      setLoading(false);
    })();
  }, [dispatch]);

  return (
    <MovieSection title="Actors">
      <div className="flex h-72">
        {loading ? (
          <Loading />
        ) : (
          <ActorSelectorList title="Available">
            <select
              className="border border-green-500 w-full"
              size={10}
              onChange={(e) => reduxDispatch(setAvailableId(e.target.value))}
              onDoubleClick={() => onUpdateActor(true)}
              onKeyPress={(e) => {
                e.key === "Enter" && onUpdateActor(true);
              }}
            >
              {state?.actorsAvailable.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name}
                </option>
              ))}
            </select>
          </ActorSelectorList>
        )}

        <ActorSelectorList title="Selected">
          {state!.actorsSelected.length > 0 ? (
            <select
              className="border border-green-500 w-full"
              size={10}
              onChange={(e) => reduxDispatch(setSelectedId(e.target.value))}
              onDoubleClick={() => onUpdateActor(false)}
              onKeyPress={(e) => {
                e.key === "Enter" && onUpdateActor(false);
              }}
            >
              {state?.actorsSelected.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="border border-green-500">
              <h3 className="font-bold text-center text-lg">None</h3>
            </div>
          )}
        </ActorSelectorList>
      </div>
    </MovieSection>
  );
};

export default ActorSelector;
