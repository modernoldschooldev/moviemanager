import { ActorType } from "./api";

// Reducer State
export interface StateType {
  actorsSelected: ActorType[];
}

// Reducer Actions
export type ActionType = SetActorsSelectedAction;

export enum Actions {
  SetActorsSelected,
}

export interface SetActorsSelectedAction {
  type: Actions.SetActorsSelected;
  payload: ActorType[];
}

// Redux types
export interface SelectBoxSliceType {
  availableId: string;
  movieId: string;
  selectedId: string;
}
