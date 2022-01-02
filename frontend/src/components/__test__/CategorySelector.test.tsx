import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "../../test-utils";

import { server } from "../../msw";
import CategorySelector from "../CategorySelector";
import MockFormikContext from "./MockFormikContext";

beforeAll(() => server.listen());
afterAll(() => server.close());

describe("Test CategorySelector", () => {
  beforeEach(() =>
    render(
      <MockFormikContext>
        <CategorySelector />
      </MockFormikContext>
    )
  );

  // do nothing test just to display this message
  it("Renders the CategorySelector without errors", () => {});

  it("Loads the categories into the CategorySelector", async () => {
    expect(
      await screen.findByRole("checkbox", {
        name: "sci-fi",
      })
    ).toBeInTheDocument();
  });

  it("Has all category checkboxes disabled upon first load", async () => {
    const checkBoxes = await screen.findAllByRole("checkbox");
    checkBoxes.forEach((checkbox) => expect(checkbox).toBeDisabled());
  });
});
