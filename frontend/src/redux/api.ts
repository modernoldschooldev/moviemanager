import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// types
import {
  Actor,
  Category,
  Clip,
  ClipActorAssociation,
  ClipCategoryAssociation,
  ClipUpdate,
  Series,
  Studio,
} from "../util/types";

export const api = createApi({
  reducerPath: "api",
  tagTypes: ["actors", "categories", "clip", "clips", "series", "studios"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND,
  }),
  endpoints: (builder) => ({
    actors: builder.query<Actor[], void>({
      query: () => "/actors",
      providesTags: ["actors"],
    }),

    addActor: builder.mutation<void, string>({
      query: (name) => ({
        url: `/actors?name=${encodeURIComponent(name)}`,
        method: "POST",
      }),
      invalidatesTags: ["actors"],
    }),

    addCategory: builder.mutation<void, string>({
      query: (name) => ({
        url: `/categories?name=${encodeURIComponent(name)}`,
        method: "POST",
      }),
      invalidatesTags: ["categories"],
    }),

    addClipActor: builder.mutation<void, ClipActorAssociation>({
      query: ({ clip_id, actor_id }) => ({
        url: `/clip_actors?clip_id=${clip_id}&actor_id=${actor_id}`,
        method: "PUT",
      }),
      invalidatesTags: ["clip", "clips"],
    }),

    addClipCategory: builder.mutation<void, ClipCategoryAssociation>({
      query: ({ clip_id, category_id }) => ({
        url: `/clip_categories?clip_id=${clip_id}&category_id=${category_id}`,
        method: "PUT",
      }),
      invalidatesTags: ["clip"],
    }),

    addSeries: builder.mutation<void, string>({
      query: (name) => ({
        url: `/series?name=${encodeURIComponent(name)}`,
        method: "POST",
      }),
      invalidatesTags: ["series"],
    }),

    addStudio: builder.mutation<void, string>({
      query: (name) => ({
        url: `/studios?name=${encodeURIComponent(name)}`,
        method: "POST",
      }),
      invalidatesTags: ["studios"],
    }),

    categories: builder.query<Category[], void>({
      query: () => "/categories",
      providesTags: ["categories"],
    }),

    clip: builder.query<Clip, number>({
      query: (id) => `/clips/${id}`,
      providesTags: ["clip"],
    }),

    clips: builder.query<Clip[], void>({
      query: () => "/clips",
      providesTags: ["clips"],
    }),

    deleteClipActor: builder.mutation<void, ClipActorAssociation>({
      query: ({ clip_id, actor_id }) => ({
        url: `/clip_actors?clip_id=${clip_id}&actor_id=${actor_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["clip", "clips"],
    }),

    deleteClipCategory: builder.mutation<void, ClipCategoryAssociation>({
      query: ({ clip_id, category_id }) => ({
        url: `/clip_categories?clip_id=${clip_id}&category_id=${category_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["clip"],
    }),

    removeClip: builder.mutation<void, number>({
      query: (id) => ({
        url: `/clips/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["clip", "clips"],
    }),

    series: builder.query<Series[], void>({
      query: () => "/series",
      providesTags: ["series"],
    }),

    studios: builder.query<Studio[], void>({
      query: () => "/studios",
      providesTags: ["studios"],
    }),

    updateClip: builder.mutation<void, ClipUpdate>({
      query: ({ id, ...params }) => ({
        url: `/clips/${id}`,
        method: "PUT",
        body: params,
      }),
      invalidatesTags: ["clip", "clips"],
    }),
  }),
});

export const {
  useActorsQuery,
  useAddActorMutation,
  useAddCategoryMutation,
  useAddClipActorMutation,
  useAddClipCategoryMutation,
  useAddSeriesMutation,
  useAddStudioMutation,
  useCategoriesQuery,
  useClipQuery,
  useClipsQuery,
  useDeleteClipActorMutation,
  useDeleteClipCategoryMutation,
  useRemoveClipMutation,
  useSeriesQuery,
  useStudiosQuery,
  useUpdateClipMutation,
} = api;
