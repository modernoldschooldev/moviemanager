import { configureStore } from "@reduxjs/toolkit";

import ActorSelectorSlice from "./ActorSelectorSlice";

export const store = configureStore({
  reducer: {
    actorSelector: ActorSelectorSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
