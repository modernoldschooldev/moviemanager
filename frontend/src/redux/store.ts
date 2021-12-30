import { configureStore } from "@reduxjs/toolkit";

// async reducers
import { api } from "./api";

// reducers
import actorsListsReducer from "./actorsLists";
import categoryListReducer from "./categoryList";
import clipListReducer from "./clipList";
import clipMetaReducer from "./clipMeta";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    actorsLists: actorsListsReducer,
    categoryList: categoryListReducer,
    clipList: clipListReducer,
    clipMeta: clipMetaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
