import { DefaultRequestBody, PathParams, rest } from "msw";
import { setupServer } from "msw/node";

import {
  actors,
  categories,
  lotrActors,
  lotrMovie,
  movies,
  series,
  studios,
} from "./defaults";

import {
  ActorType,
  CategoryType,
  MovieFileType,
  MovieType,
  SeriesType,
  StudioType,
} from "../types/api";

// creates full URL to endpoint with base URL defined in REACT_APP_BACKEND
const backend = (path: string) =>
  new URL(path, process.env.REACT_APP_BACKEND).toString();

// mock server endpoints
const endpoints = [
  rest.get<DefaultRequestBody, PathParams, ActorType[]>(
    backend("/actors"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(actors));
    }
  ),
  rest.get<DefaultRequestBody, PathParams, CategoryType[]>(
    backend("/categories"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(categories));
    }
  ),
  rest.get<DefaultRequestBody, PathParams, MovieType>(
    backend("/movies/:id"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(lotrMovie));
    }
  ),
  rest.get<DefaultRequestBody, PathParams, MovieFileType[]>(
    backend("/movies"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(movies));
    }
  ),
  rest.get<DefaultRequestBody, PathParams, SeriesType[]>(
    backend("/series"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(series));
    }
  ),
  rest.get<DefaultRequestBody, PathParams, StudioType[]>(
    backend("/studios"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(studios));
    }
  ),
];

// create the msw mock server endpoints
export const server = setupServer(...endpoints);
