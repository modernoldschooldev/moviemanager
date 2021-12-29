import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ActorSelectorSliceType } from "../types/state";

const initialState: ActorSelectorSliceType = {
  availableId: "",
  selectedId: "",
};

const slice = createSlice({
  name: "actorSelector",
  initialState,
  reducers: {
    reset: () => initialState,
    setAvailableId: (state, action: PayloadAction<string>) => {
      state.availableId = action.payload;
    },
    setSelectedId: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload;
    },
  },
});

export const { reset, setAvailableId, setSelectedId } = slice.actions;
export default slice.reducer;
