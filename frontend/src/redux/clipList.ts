import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ClipListState {
  selected: number | null;
}

const initialState: ClipListState = {
  selected: null,
};

const slice = createSlice({
  name: "clipList",
  initialState,
  reducers: {
    resetClip: (state) => {
      state.selected = null;
    },
    selectClip: (state, action: PayloadAction<number | null>) => {
      state.selected = action.payload;
    },
  },
});

export const { resetClip, selectClip } = slice.actions;
export default slice.reducer;
