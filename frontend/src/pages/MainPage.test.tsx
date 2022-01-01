import "@testing-library/jest-dom/extend-expect";

import { rest } from "msw";
import { setupServer } from "msw/node";

import { render, screen } from "../test-utils";

import MainPage from "./MainPage";

// creates full URL to endpoint with base URL defined in REACT_APP_BACKEND
const backend = (path: string) =>
  new URL(path, process.env.REACT_APP_BACKEND).toString();

// create the msw mock server endpoints
const server = setupServer(
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
  })
);

// start the mock server before starting tests
beforeAll(() => server.listen());

// shutdown the mock server after all tests have run
afterAll(() => server.close());

describe("Test MainPage", () => {
  beforeEach(() => render(<MainPage />));

  // do nothing test just to display this message
  it("Renders the MainPage component without errors", () => {});

  // check that a movies is in the MovieList after loading
  it("Loads the movies into the MovieList", async () => {
    expect(
      await screen.findByRole("option", {
        name: "Beauty and the Beast.mp4",
      })
    ).toBeInTheDocument();
  });

  // check that a series is in the Series select box after loading
  it("Loads the series into the MovieDataForm series select box", async () => {
    expect(
      await screen.findByRole("option", {
        name: "Guardians of the Galaxy",
      })
    ).toBeInTheDocument();
  });

  // check that a studio is in the Studio select box after loading
  it("Loads the studios into the MovieDataForm studio select box", async () => {
    expect(
      await screen.findByRole("option", {
        name: "Disney",
      })
    ).toBeInTheDocument();
  });

  // check that an actor is in the Available Actors select box after loading
  it("Loads the actors into the ActorSelector", async () => {
    expect(
      await screen.findByRole("option", {
        name: "Elijah Wood",
      })
    ).toBeInTheDocument();
  });

  // check that a category is in the CategorySelector after loading
  it("Loads the categories into the CategorySelector", async () => {
    expect(
      await screen.findByRole("checkbox", {
        name: "sci-fi",
      })
    ).toBeInTheDocument();
  });
});
