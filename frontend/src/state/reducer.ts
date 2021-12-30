import { Actions, ActionType, StateType } from "../types/state";

export const reducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case Actions.SetActorsSelected:
      return {
        ...state,
        actorsSelected: action.payload,
      };

    default:
      return state;
  }
};
