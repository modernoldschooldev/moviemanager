import "@testing-library/jest-dom/extend-expect";
import user from "@testing-library/user-event";

import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "../../test-utils";

import { server } from "../../msw";
import MainPage from "../MainPage";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Test MainPage", () => {
  beforeEach(() => render(<MainPage />));

  // do nothing test just to display this message
  it("Renders the MainPage without errors", () => {});

  it("Fills in the form values when a movie is selected", async () => {
    // wait for all backend data to be loaded
    await waitForElementToBeRemoved(() =>
      screen.getAllByRole("heading", { name: "Loading..." })
    );

    // find the movie list and select movie with ID 2
    const moviesList = await screen.findByTestId("movies-listbox");
    user.selectOptions(moviesList, "2");

    // find the remove and update buttons and make sure they get enabled
    const removeButton = screen.getByRole("button", { name: /remove/i });
    const updateButton = screen.getByRole("button", { name: /update/i });

    await waitFor(() => expect(removeButton).toBeEnabled());
    await waitFor(() => expect(updateButton).toBeEnabled());

    // find the movie name form element and ensure it is enabled
    expect(
      await screen.findByDisplayValue("Beauty and the Beast")
    ).toBeEnabled();

    // find the studio combobox - ensure it is enabled and has value 1
    const studioCombobox: HTMLSelectElement = await screen.findByLabelText(
      "Studio"
    );
    expect(studioCombobox).toBeEnabled();
    expect(studioCombobox.value).toBe("1");

    // find series combobox - ensure it is enabled and has value ""
    const seriesCombobox: HTMLSelectElement = await screen.findByLabelText(
      "Series"
    );
    expect(seriesCombobox).toBeEnabled();
    expect(seriesCombobox.value).toBe("");

    // find fantasy category - ensure it is enabled and checked
    const category: HTMLInputElement = await screen.findByRole("checkbox", {
      name: "fantasy",
    });
    expect(category).toBeEnabled();
    expect(category.checked).toBe(true);

    // if actor appears twice, it must be in available and selected
    const actorsSelected = await screen.findAllByRole("option", {
      name: "Elijah Wood",
    });
    expect(actorsSelected.length).toBe(2);

    // find the series # - ensure it is enabled and has value ""
    const seriesNumber: HTMLInputElement = screen.getByRole("textbox", {
      name: "Series #",
    });
    expect(seriesNumber.value).toBe("");
  });
});
