import { DefaultRequestBody, PathParams, rest } from "msw";
import { setupServer } from "msw/node";

import {
  actors,
  categories,
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
export const backend = (path: string) =>
  new URL(path, process.env.REACT_APP_BACKEND).toString();

// mock server endpoints
const endpoints = [
  // get actors from backend
  rest.get<DefaultRequestBody, PathParams, ActorType[]>(
    backend("/actors"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(actors));
    }
  ),

  // get categories from backend
  rest.get<DefaultRequestBody, PathParams, CategoryType[]>(
    backend("/categories"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(categories));
    }
  ),

  // delete Elijah Wood from Return of the King
  rest.delete<DefaultRequestBody, PathParams, MovieType>(
    backend("/movie_actor"),
    (req, res, ctx) => {
      return res(
        ctx.delay(150),
        ctx.json({
          ...lotrMovie,
          actors: lotrMovie.actors.filter(
            (actor) => actor.name !== "Elijah Wood"
          ),
        })
      );
    }
  ),

  // Add Chris Pratt to Return of the King
  rest.post<DefaultRequestBody, PathParams, MovieType>(
    backend("/movie_actor"),
    (req, res, ctx) => {
      return res(
        ctx.delay(150),
        ctx.json({ ...lotrMovie, actors: [...lotrMovie.actors, actors[7]] })
      );
    }
  ),

  // Delete fantasy category from Return of the King
  rest.delete<DefaultRequestBody, PathParams, MovieType>(
    backend("/movie_category"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json({ ...lotrMovie, categories: [] }));
    }
  ),

  // Add action category to Return of the King
  rest.post<DefaultRequestBody, PathParams, MovieType>(
    backend("/movie_category"),
    (req, res, ctx) => {
      return res(
        ctx.delay(150),
        ctx.json({
          ...lotrMovie,
          categories: [...lotrMovie.categories, categories[1]],
        })
      );
    }
  ),

  // Get movie info on Return of the King
  rest.get<DefaultRequestBody, PathParams, MovieType>(
    backend("/movies/:id"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(lotrMovie));
    }
  ),

  // Get all movies
  rest.get<DefaultRequestBody, PathParams, MovieFileType[]>(
    backend("/movies"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(movies));
    }
  ),

  // Get all series
  rest.get<DefaultRequestBody, PathParams, SeriesType[]>(
    backend("/series"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(series));
    }
  ),

  // Get all studios
  rest.get<DefaultRequestBody, PathParams, StudioType[]>(
    backend("/studios"),
    (req, res, ctx) => {
      return res(ctx.delay(150), ctx.json(studios));
    }
  ),
];

// create the msw mock server endpoints
export const server = setupServer(...endpoints);
