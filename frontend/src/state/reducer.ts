import { Actions, ActionType, StateType } from "../types/state";

export const reducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case Actions.SetSelectedMovieId:
      return {
        ...state,
        selectedMovieId: action.payload,
      };
    default:
      return state;
  }
};
