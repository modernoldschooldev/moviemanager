// Reducer State
export interface StateType {
  actors: ActorType[];
  categories: CategoryType[];
  movieSeries: SeriesType[];
  movieStudios: string[];
  movies: MovieFileType[];
}

export interface BaseMovieProperty {
  id: number;
  name: string;
}

export interface ActorType extends BaseMovieProperty {}
export interface CategoryType extends BaseMovieProperty {}
export interface SeriesType extends BaseMovieProperty {}
export interface StudioType extends BaseMovieProperty {}

export interface MovieFileType {
  id: number;
  filename: string;
}

// Reducer Actions
export type ActionType =
  | AddStudioAction
  | SetAvailableActorsAction
  | SetCategoriesAction
  | SetMoviesAction
  | SetSeriesAction;

export enum Actions {
  AddStudio,
  SetAvailableActors,
  SetCategories,
  SetMovies,
  SetSeries,
}

export interface AddStudioAction {
  type: Actions.AddStudio;
  payload: string;
}

export interface SetAvailableActorsAction {
  type: Actions.SetAvailableActors;
  payload: ActorType[];
}

export interface SetCategoriesAction {
  type: Actions.SetCategories;
  payload: CategoryType[];
}
export interface SetMoviesAction {
  type: Actions.SetMovies;
  payload: MovieFileType[];
}

export interface SetSeriesAction {
  type: Actions.SetSeries;
  payload: SeriesType[];
}
