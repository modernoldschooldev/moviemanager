// Reducer State
export interface StateType {
  actors: ActorType[];
  categories: string[];
  movieSeries: string[];
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
  | AddCategoryAction
  | AddSeriesAction
  | AddStudioAction
  | SetAvailableActorsAction
  | SetMoviesAction;

export enum Actions {
  AddCategory,
  AddSeries,
  AddStudio,
  SetAvailableActors,
  SetMovies,
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

export interface SetAvailableActorsAction {
  type: Actions.SetAvailableActors;
  payload: ActorType[];
}
export interface SetMoviesAction {
  type: Actions.SetMovies;
  payload: MovieFileType[];
}
