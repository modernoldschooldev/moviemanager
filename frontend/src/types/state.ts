// Reducer State
export interface StateType {
  actors: string[];
  selectedActors: string[] | null;

  categories: string[];
  selectedCategories: string[] | null;

  movies: string[];
  selectedMovieId: number | null;

  movieName: string | null;
  movieStudios: string[];
  movieStudioId: number | null;
  movieSeries: string[];
  movieSeriesId: number | null;
  movieSeriesNumber: number | null;
}

// Reducer Actions
export type ActionType =
  | SetSelectedMovieIdAction
  | AddActorAction
  | AddCategoryAction
  | AddSeriesAction
  | AddStudioAction;

export enum Actions {
  AddActor,
  AddCategory,
  AddSeries,
  AddStudio,
  SetSelectedMovieId,
}

export interface SetSelectedMovieIdAction {
  type: Actions.SetSelectedMovieId;
  payload: number | null;
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
