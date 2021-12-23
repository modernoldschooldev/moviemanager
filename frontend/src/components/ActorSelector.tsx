import { useContext, useEffect, useState } from "react";

import ActorSelectorList from "./ActorSelectorList";
import Loading from "./Loading";
import MovieSection from "./MovieSection";

import StateContext from "../state/StateContext";

import { MovieInfoResponseType } from "../types/api";
import { MovieSectionProps } from "../types/form";
import { Actions } from "../types/state";

const ActorSelector = ({ formik }: MovieSectionProps) => {
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(StateContext);

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
      const data: MovieInfoResponseType = await response.json();

      const actorName = state?.actorsAvailable.filter(
        (actor) => actor.id === +id
      )[0].name;

      if (response.ok) {
        dispatch({
          type: Actions.SetActorsSelected,
          payload: data.actors,
        });

        formik.setStatus(
          `Successfully ${selected ? "added" : "removed"} ${actorName} ${
            selected ? "to" : "from"
          } ${data.name}`
        );
      } else {
        formik.setStatus("Error updating actor");
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
