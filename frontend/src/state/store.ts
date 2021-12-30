import { configureStore } from "@reduxjs/toolkit";

import MovieManagerApi from "./MovieManagerApi";
import SelectBoxSlice from "./SelectBoxSlice";

export const store = configureStore({
  reducer: {
    [MovieManagerApi.reducerPath]: MovieManagerApi.reducer,
    selectBox: SelectBoxSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(MovieManagerApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
