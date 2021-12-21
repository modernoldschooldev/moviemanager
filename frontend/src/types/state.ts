// Reducer State
export interface StateType {
  actorsAvailable: ActorType[];
  actorsSelected: ActorType[];
  categories: CategoryType[];
  series: SeriesType[];
  studios: StudioType[];
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
  | SetActorsAvailableAction
  | SetActorsSelectedAction
  | SetCategoriesAction
  | SetMoviesAction
  | SetSeriesAction
  | SetStudiosAction;

export enum Actions {
  SetActorsAvailable,
  SetActorsSelected,
  SetCategories,
  SetMovies,
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
export interface SetMoviesAction {
  type: Actions.SetMovies;
  payload: MovieFileType[];
}

export interface SetSeriesAction {
  type: Actions.SetSeries;
  payload: SeriesType[];
}

export interface SetStudiosAction {
  type: Actions.SetStudios;
  payload: StudioType[];
}
