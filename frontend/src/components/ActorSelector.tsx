import { FetchBaseQueryError, skipToken } from "@reduxjs/toolkit/dist/query";

import { useFormikContext } from "formik";

import ActorSelectorList from "./ActorSelectorList";
import Loading from "./Loading";
import MovieSection from "./MovieSection";

import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
  useActorsQuery,
  useMovieActorAddMutation,
  useMovieActorDeleteMutation,
  useMovieQuery,
} from "../state/MovieManagerApi";
import { setAvailableId, setSelectedId } from "../state/SelectBoxSlice";

import { HTTPExceptionType, MovieType } from "../types/api";
import { MainPageFormValuesType } from "../types/form";

const ActorSelector = () => {
  const formik = useFormikContext<MainPageFormValuesType>();

  const dispatch = useAppDispatch();
  const { availableId, movieId, selectedId } = useAppSelector(
    (state) => state.selectBox
  );

  const { data: actorsAvailable, isLoading } = useActorsQuery();
  const { data: movie } = useMovieQuery(movieId ?? skipToken);

  const [movieActorAddTrigger] = useMovieActorAddMutation();
  const [movieActorDeleteTrigger] = useMovieActorDeleteMutation();

  const onUpdateActor = async (selected: boolean) => {
    const id = selected ? availableId : selectedId;
    const trigger = selected ? movieActorAddTrigger : movieActorDeleteTrigger;

    if (movieId && id) {
      const actorName = actorsAvailable?.filter((actor) => actor.id === +id)[0]
        .name;

      try {
        const data: MovieType = await trigger({
          actorId: id,
          movieId,
        }).unwrap();

        formik.setStatus(
          `Successfully ${selected ? "added" : "removed"} ${actorName} ${
            selected ? "to" : "from"
          } ${data.name}`
        );
      } catch (error) {
        const { status, data } = error as FetchBaseQueryError;

        if (status !== 422) {
          const {
            detail: { message },
          } = data as HTTPExceptionType;

          formik.setStatus(message ? message : "Unknown server error");
        }
      }
    }
  };

  return (
    <MovieSection title="Actors">
      <fieldset disabled={!movieId}>
        <div className="flex h-72">
          {isLoading ? (
            <Loading />
          ) : (
            <ActorSelectorList name="actorsAvailable" title="Available">
              <select
                className="border border-green-500 w-full"
                id="actorsAvailable"
                size={10}
                defaultValue={availableId}
                onChange={(e) => dispatch(setAvailableId(e.target.value))}
                onDoubleClick={() => onUpdateActor(true)}
                onKeyPress={(e) => {
                  e.key === "Enter" && onUpdateActor(true);
                }}
              >
                {actorsAvailable?.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name}
                  </option>
                ))}
              </select>
            </ActorSelectorList>
          )}

          <ActorSelectorList name="actorsSelected" title="Selected">
            {movieId && movie && movie.actors && movie.actors.length > 0 ? (
              <select
                className="border border-green-500 w-full"
                id="actorsSelected"
                size={10}
                defaultValue={selectedId}
                onChange={(e) => dispatch(setSelectedId(e.target.value))}
                onDoubleClick={() => onUpdateActor(false)}
                onKeyPress={(e) => {
                  e.key === "Enter" && onUpdateActor(false);
                }}
              >
                {movie?.actors.map((actor) => (
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
      </fieldset>
    </MovieSection>
  );
};

export default ActorSelector;
