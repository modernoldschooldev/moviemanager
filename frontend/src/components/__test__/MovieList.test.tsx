import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "../../test-utils";

import { server } from "../../msw";
import MockFormikContext from "./MockFormikContext";
import MovieList from "../MovieList";

beforeAll(() => server.listen());
afterAll(() => server.close());

describe("Test MovieList", () => {
  beforeEach(() =>
    render(
      <MockFormikContext>
        <MovieList />
      </MockFormikContext>
    )
  );

  // do nothing test just to display this message
  it("Renders the MovieList without errors", () => {});

  // check that a movies is in the MovieList after loading
  it("Loads the movies into the MovieList", async () => {
    expect(
      await screen.findByRole("option", {
        name: "Beauty and the Beast.mp4",
      })
    ).toBeInTheDocument();
  });
});
