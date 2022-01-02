import { rest } from "msw";
import { setupServer } from "msw/node";

// creates full URL to endpoint with base URL defined in REACT_APP_BACKEND
const backend = (path: string) =>
  new URL(path, process.env.REACT_APP_BACKEND).toString();

// mock server endpoints
const endpoints = [
  rest.get(backend("/actors"), (req, res, ctx) => {
    return res(
      ctx.delay(150),
      ctx.json([
        {
          id: 1,
          name: "Elijah Wood",
        },
        {
          id: 2,
          name: "Patrick Stewart",
        },
      ])
    );
  }),
  rest.get(backend("/categories"), (req, res, ctx) => {
    return res(
      ctx.delay(150),
      ctx.json([
        {
          id: 1,
          name: "action",
        },
        {
          id: 2,
          name: "fantasy",
        },
        {
          id: 3,
          name: "sci-fi",
        },
      ])
    );
  }),
  rest.get(backend("/movies/2"), (req, res, ctx) => {
    return res(
      ctx.delay(150),
      ctx.json({
        id: 2,
        filename: "Beauty and the Beast.mp4",
        name: "Beauty and the Beast",
        actors: [
          {
            id: 1,
            name: "Elijah Wood",
          },
        ],
        categories: [
          {
            id: 2,
            name: "fantasy",
          },
        ],
        series: null,
        series_number: null,
        studio: {
          id: 1,
          name: "Disney",
        },
      })
    );
  }),
  rest.get(backend("/movies"), (req, res, ctx) => {
    return res(
      ctx.delay(150),
      ctx.json([
        {
          id: 1,
          filename: "Aladdin.mp4",
        },
        {
          id: 2,
          filename: "Beauty and the Beast.mp4",
        },
        {
          id: 3,
          filename: "The Lion King.mp4",
        },
      ])
    );
  }),
  rest.get(backend("/series"), (req, res, ctx) => {
    return res(
      ctx.delay(150),
      ctx.json([
        {
          id: 1,
          name: "Lord of the Rings",
        },
        {
          id: 2,
          name: "Guardians of the Galaxy",
        },
      ])
    );
  }),
  rest.get(backend("/studios"), (req, res, ctx) => {
    return res(
      ctx.delay(150),
      ctx.json([
        {
          id: 1,
          name: "Disney",
        },
        {
          id: 2,
          name: "Fox",
        },
        {
          id: 3,
          name: "New Line Cinema",
        },
      ])
    );
  }),
];

// create the msw mock server endpoints
export const server = setupServer(...endpoints);
