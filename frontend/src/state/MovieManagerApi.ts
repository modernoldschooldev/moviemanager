import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  ActorType,
  CategoryType,
  MovieFileType,
  MovieType,
  SeriesType,
  StudioType,
} from "../types/api";
import {
  MovieActorAssociationType,
  MovieCategoryAssociationType,
} from "../types/state";

const api = createApi({
  reducerPath: "movieManagerApi",
  tagTypes: ["actors", "categories", "movie", "movies", "series", "studios"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND,
  }),

  endpoints: (builder) => ({
    // fetch actors from backend
    actors: builder.query<ActorType[], void>({
      query: () => "/actors",
      providesTags: ["actors"],
    }),

    // fetch categories from backend
    categories: builder.query<CategoryType[], void>({
      query: () => "/categories",
      providesTags: ["categories"],
    }),

    // fetch movie info from backend
    movie: builder.query<MovieType, string>({
      query: (id) => `/movies/${id}`,
      providesTags: ["movie"],
    }),

    // removes a movie from the backend
    movieDelete: builder.mutation<void, string>({
      query: (id) => ({
        url: `/movies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["movies"],
    }),

    // add an actor to a movie
    movieActorAdd: builder.mutation<MovieType, MovieActorAssociationType>({
      query: ({ actorId, movieId }) => ({
        url: `/movie_actor?movie_id=${movieId}&actor_id=${actorId}`,
        method: "POST",
      }),
      invalidatesTags: ["movie", "movies"],
    }),

    // delete an actor from a movie
    movieActorDelete: builder.mutation<MovieType, MovieActorAssociationType>({
      query: ({ actorId, movieId }) => ({
        url: `/movie_actor?movie_id=${movieId}&actor_id=${actorId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["movie", "movies"],
    }),

    // add an category to a movie
    movieCategoryAdd: builder.mutation<MovieType, MovieCategoryAssociationType>(
      {
        query: ({ categoryId, movieId }) => ({
          url: `/movie_category?movie_id=${movieId}&category_id=${categoryId}`,
          method: "POST",
        }),
        invalidatesTags: ["movie"],
      }
    ),

    // delete an category from a movie
    movieCategoryDelete: builder.mutation<
      MovieType,
      MovieCategoryAssociationType
    >({
      query: ({ categoryId, movieId }) => ({
        url: `/movie_category?movie_id=${movieId}&category_id=${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["movie"],
    }),

    // fetch movies from backend
    movies: builder.query<MovieFileType[], void>({
      query: () => "/movies",
      providesTags: ["movies"],
    }),

    // import movies from backend
    moviesImport: builder.mutation<MovieFileType[], void>({
      query: () => ({
        url: "/movies",
        method: "POST",
      }),
      invalidatesTags: ["movies"],
    }),

    // fetch series from backend
    series: builder.query<SeriesType[], void>({
      query: () => "/series",
      providesTags: ["series"],
    }),

    // fetch studios from backend
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
  useMovieDeleteMutation,
  useMovieActorAddMutation,
  useMovieActorDeleteMutation,
  useMovieCategoryAddMutation,
  useMovieCategoryDeleteMutation,
  useMoviesQuery,
  useMoviesImportMutation,
  useSeriesQuery,
  useStudiosQuery,
} = api;

export default api;
