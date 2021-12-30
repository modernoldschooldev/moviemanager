import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  ActorType,
  CategoryType,
  MovieFileType,
  MovieType,
  SeriesType,
  StudioType,
} from "../types/api";
import { MovieActorAssociationType } from "../types/state";

const api = createApi({
  reducerPath: "movieManagerApi",
  tagTypes: ["actors", "categories", "movie", "movies", "series", "studios"],
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

    movie: builder.query<MovieType, string>({
      query: (id) => `/movies/${id}`,
      providesTags: ["movie"],
    }),

    movieActorDelete: builder.mutation<MovieType, MovieActorAssociationType>({
      query: ({ actorId, movieId }) => ({
        url: `/movie_actor?movie_id=${movieId}&actor_id=${actorId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["movie", "movies"],
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
  useMovieQuery,
  useMovieActorDeleteMutation,
  useMoviesQuery,
  useSeriesQuery,
  useStudiosQuery,
} = api;

export default api;
