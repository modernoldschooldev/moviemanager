import { ActorType, CategoryType, SeriesType, StudioType } from "./api";

// Reducer State
export interface StateType {
  actorsAvailable: ActorType[];
  actorsSelected: ActorType[];
  categories: CategoryType[];
  series: SeriesType[];
  studios: StudioType[];
}

// Reducer Actions
export type ActionType =
  | SetActorsAvailableAction
  | SetActorsSelectedAction
  | SetCategoriesAction
  | SetSeriesAction
  | SetStudiosAction;

export enum Actions {
  SetActorsAvailable,
  SetActorsSelected,
  SetCategories,
  SetSeries,
  SetStudios,
}

export interface SetActorsAvailableAction {
  type: Actions.SetActorsAvailable;
  payload: ActorType[];
}

export interface SetActorsSelectedAction {
  type: Actions.SetActorsSelected;
  payload: ActorType[];
}

export interface SetCategoriesAction {
  type: Actions.SetCategories;
  payload: CategoryType[];
}

export interface SetSeriesAction {
  type: Actions.SetSeries;
  payload: SeriesType[];
}

export interface SetStudiosAction {
  type: Actions.SetStudios;
  payload: StudioType[];
}

// Redux types
export interface SelectBoxSliceType {
  availableId: string;
  movieId: string;
  selectedId: string;
}
