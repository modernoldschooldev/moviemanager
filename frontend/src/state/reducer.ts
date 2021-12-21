import { Actions, ActionType, StateType } from "../types/state";

export const reducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case Actions.SetActorsAvailable:
      return {
        ...state,
        actorsAvailable: action.payload,
      };

    case Actions.SetActorsSelected:
      return {
        ...state,
        actorsSelected: action.payload,
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

    case Actions.SetSeries:
      return {
        ...state,
        series: action.payload,
      };

    case Actions.SetStudios:
      return {
        ...state,
        studios: action.payload,
      };

    default:
      return state;
  }
};
