// Reducer State
export interface StateType {
  actors: string[];
  selectedActors: string[] | null;

  categories: string[];
  selectedCategories: string[] | null;

  movies: string[];
  selectedMovieId: number | null;

  movieName: string | null;
  movieStudioId: number | null;
  movieSeriesId: number | null;
  movieSeriesNumber: number | null;
}

// Reducer Actions
export type ActionType = SetSelectedMovieIdAction;

export enum Actions {
  SetSelectedMovieId,
}

export interface SetSelectedMovieIdAction {
  type: Actions.SetSelectedMovieId;
  payload: number | null;
}
