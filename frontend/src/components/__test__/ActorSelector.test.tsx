import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "../../test-utils";

import { server } from "../../msw";
import ActorSelector from "../ActorSelector";
import MockFormikContext from "./MockFormikContext";

beforeAll(() => server.listen());
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
    expect(
      await screen.findByRole("option", {
        name: "Elijah Wood",
      })
    ).toBeInTheDocument();
  });

  it("Has the available actors listbox disabled on first load", async () => {
    expect(await screen.findByRole("listbox")).toBeDisabled();
  });

  it("Shows None for selected actors on first load", () => {
    expect(screen.getByRole("heading", { name: "None" })).toBeInTheDocument();
  });
});
