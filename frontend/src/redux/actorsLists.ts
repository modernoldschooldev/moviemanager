import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ActorsListsState {
  available: number;
  selected: number;
}

const initialState: ActorsListsState = {
  available: 0,
  selected: 0,
};

const slice = createSlice({
  name: "actorsLists",
  initialState,
  reducers: {
    reset: () => initialState,
    setAvailable: (state, action: PayloadAction<number>) => {
      state.available = action.payload;
    },
    setSelected: (state, action: PayloadAction<number>) => {
      state.selected = action.payload;
    },
  },
});

export const { reset, setAvailable, setSelected } = slice.actions;
export default slice.reducer;
