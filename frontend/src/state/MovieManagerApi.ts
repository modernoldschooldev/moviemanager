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
  MoviePropertyType,
  MovieUpdateQueryType,
} from "../types/state";

const api = createApi({
  reducerPath: "movieManagerApi",
  tagTypes: ["actors", "categories", "movie", "movies", "series", "studios"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND,
  }),

  endpoints: (builder) => ({
    // add new actor to backend
    actorAdd: builder.mutation<ActorType, MoviePropertyType>({
      query: ({ id, ...body }) => ({
        url: "/actors",
        method: "POST",
        body,
      }),
      invalidatesTags: ["actors"],
    }),

    // delete actor from backend
    actorDelete: builder.mutation<void, MoviePropertyType>({
      query: ({ id }) => ({
        url: `/actors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["actors"],
    }),

    // update actor on backend
    actorUpdate: builder.mutation<ActorType, MoviePropertyType>({
      query: ({ id, ...body }) => ({
        url: `/actors/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["actors", "movie", "movies"],
    }),

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

    // add new category to backend
    categoryAdd: builder.mutation<CategoryType, MoviePropertyType>({
      query: ({ id, ...body }) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["categories"],
    }),

    // delete category from backend
    categoryDelete: builder.mutation<void, MoviePropertyType>({
      query: ({ id }) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["categories"],
    }),

    // update category on backend
    categoryUpdate: builder.mutation<CategoryType, MoviePropertyType>({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["categories", "movie"],
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

    // updates a movie's information in the database
    movieUpdate: builder.mutation<MovieType, MovieUpdateQueryType>({
      query: ({ id, ...body }) => ({
        url: `/movies/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["movie", "movies"],
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

    // add new series to backend
    seriesAdd: builder.mutation<SeriesType, MoviePropertyType>({
      query: ({ id, ...body }) => ({
        url: "/series",
        method: "POST",
        body,
      }),
      invalidatesTags: ["series"],
    }),

    // delete series from backend
    seriesDelete: builder.mutation<void, MoviePropertyType>({
      query: ({ id }) => ({
        url: `/series/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["series"],
    }),

    // update series on backend
    seriesUpdate: builder.mutation<SeriesType, MoviePropertyType>({
      query: ({ id, ...body }) => ({
        url: `/series/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["series", "movie", "movies"],
    }),

    // add new studio to backend
    studioAdd: builder.mutation<StudioType, MoviePropertyType>({
      query: ({ id, ...body }) => ({
        url: "/studios",
        method: "POST",
        body,
      }),
      invalidatesTags: ["studios"],
    }),

    // delete studio from backend
    studioDelete: builder.mutation<void, MoviePropertyType>({
      query: ({ id }) => ({
        url: `/studios/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["studios"],
    }),

    // update studio on backend
    studioUpdate: builder.mutation<StudioType, MoviePropertyType>({
      query: ({ id, ...body }) => ({
        url: `/studios/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["studios", "movie", "movies"],
    }),

    // fetch studios from backend
    studios: builder.query<StudioType[], void>({
      query: () => "/studios",
      providesTags: ["studios"],
    }),
  }),
});

export const {
  useActorAddMutation,
  useActorDeleteMutation,
  useActorUpdateMutation,
  useActorsQuery,
  useCategoriesQuery,
  useCategoryAddMutation,
  useCategoryDeleteMutation,
  useCategoryUpdateMutation,
  useMovieQuery,
  useMovieDeleteMutation,
  useMovieActorAddMutation,
  useMovieActorDeleteMutation,
  useMovieCategoryAddMutation,
  useMovieCategoryDeleteMutation,
  useMovieUpdateMutation,
  useMoviesQuery,
  useMoviesImportMutation,
  useSeriesQuery,
  useSeriesAddMutation,
  useSeriesDeleteMutation,
  useSeriesUpdateMutation,
  useStudioAddMutation,
  useStudioDeleteMutation,
  useStudioUpdateMutation,
  useStudiosQuery,
} = api;

export default api;
