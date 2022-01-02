import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "../../test-utils";

import { lotrActors } from "../../msw/defaults";
import { server } from "../../msw/server";

import ActorSelector from "../ActorSelector";
import MockFormikContext from "./MockFormikContext";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Test ActorSelector", () => {
  beforeEach(() =>
    render(
      <MockFormikContext>
        <ActorSelector />
      </MockFormikContext>
    )
  );

  // do nothing test just to display this message
  it("Renders the ActorSelector without errors", () => {});

  it("Loads the actors into the ActorSelector", async () => {
    for (let actor of lotrActors) {
      expect(
        await screen.findByRole("option", { name: actor })
      ).toBeInTheDocument();
    }
  });

  it("Has the available actors listbox disabled on first load", async () => {
    expect(await screen.findByRole("listbox")).toBeDisabled();
  });

  it("Shows None for selected actors on first load", () => {
    expect(screen.getByRole("heading", { name: "None" })).toBeInTheDocument();
  });
});
