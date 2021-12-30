import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CategoryListState {
  selected: number[];
}

const initialState: CategoryListState = {
  selected: [],
};

const slice = createSlice({
  name: "categoryList",
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<number>) => {
      state.selected.push(action.payload);
    },
    removeCategory: (state, action: PayloadAction<number>) => {
      state.selected = state.selected.filter(
        (category) => category !== action.payload
      );
    },
    reset: () => initialState,
    setCategories: (state, action: PayloadAction<number[]>) => {
      state.selected = action.payload;
    },
  },
});

export const { addCategory, removeCategory, reset, setCategories } =
  slice.actions;
export default slice.reducer;
