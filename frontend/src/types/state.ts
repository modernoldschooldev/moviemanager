// Reducer State
export interface StateType {
  actors: string[];
  categories: string[];
  movieSeries: string[];
  movieStudios: string[];
  movies: string[];
}

// Reducer Actions
export type ActionType =
  | AddActorAction
  | AddCategoryAction
  | AddSeriesAction
  | AddStudioAction;

export enum Actions {
  AddActor,
  AddCategory,
  AddSeries,
  AddStudio,
}

export interface AddActorAction {
  type: Actions.AddActor;
  payload: string;
}

export interface AddCategoryAction {
  type: Actions.AddCategory;
  payload: string;
}

export interface AddSeriesAction {
  type: Actions.AddSeries;
  payload: string;
}
export interface AddStudioAction {
  type: Actions.AddStudio;
  payload: string;
}
