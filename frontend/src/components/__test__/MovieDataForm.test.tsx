import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "../../test-utils";

import { server } from "../../msw/server";

import MockFormikContext from "./MockFormikContext";
import MovieDataForm from "../MovieDataForm";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Test MovieDataForm", () => {
  beforeEach(() =>
    render(
      <MockFormikContext>
        <MovieDataForm />
      </MockFormikContext>
    )
  );

  // do nothing test just to display this message
  it("Renders the MovieDataForm without errors", () => {});

  it("Loads the series into the series combobox", async () => {
    expect(
      await screen.findByRole("option", {
        name: "Lord of the Rings",
      })
    ).toBeInTheDocument();
  });

  it("Loads the studios into the studios combobox", async () => {
    expect(
      await screen.findByRole("option", {
        name: "New Line Cinema",
      })
    ).toBeInTheDocument();
  });

  it("Has all form elements disabled on first load", async () => {
    expect(screen.getByRole("button", { name: /update/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /remove/i })).toBeDisabled();

    // 2 textboxes - Name and Series #
    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes.length).toBe(2);
    textboxes.forEach((textbox) => expect(textbox).toBeDisabled());

    expect(
      await screen.findByRole("combobox", { name: "Series" })
    ).toBeDisabled();
    expect(
      await screen.findByRole("combobox", { name: "Studio" })
    ).toBeDisabled();
  });
});
