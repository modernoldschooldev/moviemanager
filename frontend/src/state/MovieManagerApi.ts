import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MovieFileType } from "../types/api";

const api = createApi({
  reducerPath: "movieManagerApi",
  tagTypes: ["movies"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND,
  }),
  endpoints: (builder) => ({
    movies: builder.query<MovieFileType[], void>({
      query: () => "/movies",
      providesTags: ["movies"],
    }),
  }),
});

export const { useMoviesQuery } = api;
export default api;
