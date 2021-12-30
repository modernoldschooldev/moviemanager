import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  ActorType,
  CategoryType,
  MovieFileType,
  SeriesType,
  StudioType,
} from "../types/api";

const api = createApi({
  reducerPath: "movieManagerApi",
  tagTypes: ["actors", "categories", "movies", "series", "studios"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND,
  }),

  endpoints: (builder) => ({
    actors: builder.query<ActorType[], void>({
      query: () => "/actors",
      providesTags: ["actors"],
    }),

    categories: builder.query<CategoryType[], void>({
      query: () => "/categories",
      providesTags: ["categories"],
    }),

    movies: builder.query<MovieFileType[], void>({
      query: () => "/movies",
      providesTags: ["movies"],
    }),

    series: builder.query<SeriesType[], void>({
      query: () => "/series",
      providesTags: ["series"],
    }),

    studios: builder.query<StudioType[], void>({
      query: () => "/studios",
      providesTags: ["studios"],
    }),
  }),
});

export const {
  useActorsQuery,
  useCategoriesQuery,
  useMoviesQuery,
  useSeriesQuery,
  useStudiosQuery,
} = api;

export default api;
