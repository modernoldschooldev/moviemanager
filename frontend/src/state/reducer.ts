import { Actions, ActionType, StateType } from "../types/state";

export const reducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case Actions.AddSeries:
      return {
        ...state,
        movieSeries: [...state.movieSeries, action.payload],
      };

    case Actions.AddStudio:
      return {
        ...state,
        movieStudios: [...state.movieStudios, action.payload],
      };

    case Actions.SetAvailableActors:
      return {
        ...state,
        actors: action.payload,
      };

    case Actions.SetCategories:
      return {
        ...state,
        categories: action.payload,
      };

    case Actions.SetMovies:
      return {
        ...state,
        movies: action.payload,
      };

    default:
      return state;
  }
};
