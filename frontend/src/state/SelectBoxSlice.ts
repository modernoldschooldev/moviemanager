import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { SelectBoxSliceType } from "../types/state";

const initialState: SelectBoxSliceType = {
  availableId: "",
  movieId: "",
  selectedId: "",
};

const slice = createSlice({
  name: "selectBox",
  initialState,
  reducers: {
    reset: () => initialState,
    setAvailableId: (state, action: PayloadAction<string>) => {
      state.availableId = action.payload;
    },
    setMovieId: (state, action: PayloadAction<string>) => {
      state.movieId = action.payload;
    },
    setSelectedId: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload;
    },
  },
});

export const { reset, setAvailableId, setMovieId, setSelectedId } =
  slice.actions;
export default slice.reducer;
