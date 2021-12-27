import { useContext, useEffect, useState } from "react";
import { useFormikContext } from "formik";

import ActorSelectorList from "./ActorSelectorList";
import Loading from "./Loading";
import MovieSection from "./MovieSection";

import StateContext from "../state/StateContext";

import { MovieType } from "../types/api";
import { MainPageFormValuesType } from "../types/form";
import { Actions } from "../types/state";

const ActorSelector = () => {
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(StateContext);
  const formik = useFormikContext<MainPageFormValuesType>();

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

  const onUpdateActor = async (id: string, selected: boolean) => {
    if (formik.values.movieId) {
      const queryString = new URLSearchParams({
        movie_id: formik.values.movieId,
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
              name="movieActorAvailableId"
              onChange={formik.handleChange}
              onDoubleClick={() =>
                formik.values.movieActorAvailableId &&
                onUpdateActor(formik.values.movieActorAvailableId, true)
              }
              onKeyPress={(e) => {
                e.key === "Enter" &&
                  formik.values.movieActorAvailableId &&
                  onUpdateActor(formik.values.movieActorAvailableId, true);
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
              name="movieActorSelectedId"
              onChange={formik.handleChange}
              onDoubleClick={() =>
                formik.values.movieActorSelectedId &&
                onUpdateActor(formik.values.movieActorSelectedId, false)
              }
              onKeyPress={(e) => {
                e.key === "Enter" &&
                  formik.values.movieActorSelectedId &&
                  onUpdateActor(formik.values.movieActorSelectedId, false);
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
