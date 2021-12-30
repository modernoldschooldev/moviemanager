import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ClipMetaState {
  name: string;
  studioId: number;
  seriesId: number;
  seriesNumber: number | "";
}

const initialState: ClipMetaState = {
  name: "",
  studioId: 0,
  seriesId: 0,
  seriesNumber: "",
};

const slice = createSlice({
  name: "clipMeta",
  initialState,
  reducers: {
    reset: () => initialState,
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setStudioId: (state, action: PayloadAction<number>) => {
      state.studioId = action.payload;
    },
    setSeriesId: (state, action: PayloadAction<number>) => {
      state.seriesId = action.payload;
    },
    setSeriesNumber: (state, action: PayloadAction<number | "">) => {
      state.seriesNumber = action.payload;
    },
  },
});

export const { reset, setName, setStudioId, setSeriesId, setSeriesNumber } =
  slice.actions;
export default slice.reducer;
