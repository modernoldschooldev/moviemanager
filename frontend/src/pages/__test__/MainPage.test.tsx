import "@testing-library/jest-dom/extend-expect";
import user from "@testing-library/user-event";
import { DefaultRequestBody, PathParams, rest } from "msw";

import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "../../test-utils";

import { actors, lotrMovie } from "../../msw/defaults";
import { backend, server } from "../../msw/server";

import MainPage from "../MainPage";

import { HTTPExceptionType, MovieType } from "../../types/api";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Test MainPage", () => {
  beforeEach(async () => {
    render(<MainPage />);

    // wait for all backend data to be loaded
    await waitForElementToBeRemoved(() =>
      screen.getAllByRole("heading", { name: "Loading..." })
    );

    // find the movie list and select movie with ID 1
    const moviesList = await screen.findByTestId("movies-listbox");
    user.selectOptions(moviesList, "1");
  });

  //////////////////////////////////////////////////////////////////////////////

  // do nothing test just to display this message
  it("Renders the MainPage without errors", () => {});

  //////////////////////////////////////////////////////////////////////////////

  it("Fills in the form values when a movie is selected", async () => {
    // find the remove and update buttons and make sure they get enabled
    const removeButton = screen.getByRole("button", { name: /remove/i });
    const updateButton = screen.getByRole("button", { name: /update/i });

    await waitFor(() => expect(removeButton).toBeEnabled());
    await waitFor(() => expect(updateButton).toBeEnabled());

    // find the movie name form element and ensure it is enabled
    expect(
      await screen.findByDisplayValue("The Return of the King")
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
    expect(seriesCombobox.value).toBe("1");

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
    expect(seriesNumber.value).toBe("3");
  });

  //////////////////////////////////////////////////////////////////////////////

  it("Fails and then succeeds to add Elijah Wood to Return of the King", async () => {
    server.use(
      rest.post<DefaultRequestBody, PathParams, HTTPExceptionType>(
        backend("/movie_actor"),
        (req, res, ctx) => {
          return res.once(
            ctx.delay(150),
            ctx.status(409),
            ctx.json({
              detail: {
                message: "Actor Elijah Wood is already on Return of the King",
              },
            })
          );
        }
      )
    );

    const id = actors.filter((actor) => actor.name === "Elijah Wood")[0].id;
    const listbox = await screen.findByRole("listbox", { name: /available/i });
    const option = await screen.findByTestId(`actors-available-${id}`);

    user.selectOptions(listbox, option);
    user.dblClick(option);

    expect(
      await screen.findByText(
        "Actor Elijah Wood is already on Return of the King"
      )
    ).toBeInTheDocument();

    user.dblClick(option);
    expect(
      await screen.findByText(
        "Successfully added Elijah Wood to The Return of the King"
      )
    ).toBeInTheDocument();
  });

  //////////////////////////////////////////////////////////////////////////////

  it("Removes and readds the fantasy category to Return of the King", async () => {
    // setup one time endpoint overrides
    server.use(
      rest.post<DefaultRequestBody, PathParams, HTTPExceptionType>(
        backend("/movie_category"),
        (req, res, ctx) => {
          return res.once(
            ctx.delay(150),
            ctx.status(404),
            ctx.json({
              detail: {
                message: "Failed to add invalid category ID",
              },
            })
          );
        }
      ),
      rest.delete<DefaultRequestBody, PathParams, HTTPExceptionType>(
        backend("/movie_category"),
        (req, res, ctx) => {
          return res.once(
            ctx.delay(150),
            ctx.status(404),
            ctx.json({
              detail: {
                message: "Failed to remove invalid category ID",
              },
            })
          );
        }
      ),
      rest.get<DefaultRequestBody, PathParams, MovieType>(
        backend("/movies/:id"),
        (req, res, ctx) => {
          return res.once(
            ctx.delay(150),
            ctx.json({ ...lotrMovie, categories: [] })
          );
        }
      )
    );

    // find the fantasy checkbox
    const category: HTMLInputElement = await screen.findByRole("checkbox", {
      name: "fantasy",
    });

    // wait for it to become checked by formik
    await waitFor(() => expect(category.checked).toBe(true));

    // click the checkbox to remove the category
    user.click(category);

    // look for the failure text from our one time error
    expect(
      await screen.findByText("Failed to remove invalid category ID")
    ).toBeInTheDocument();

    // wait for formik to update the checkbox state
    await waitFor(() => expect(category.checked).toBe(true));

    // try to remove the category again
    user.click(category);

    // look for the success message
    expect(
      await screen.findByText(
        "Successfully removed category fantasy from The Return of the King"
      )
    ).toBeInTheDocument();

    // wait for formik to update the checkbox state
    await waitFor(() => expect(category.checked).toBe(false));

    // try to add the category
    user.click(category);

    // look for one time failure response
    expect(
      await screen.findByText("Failed to add invalid category ID")
    ).toBeInTheDocument();

    // wait for formik to update the checkbox state
    await waitFor(() => expect(category.checked).toBe(false));

    // try to add the category again
    user.click(category);

    // look for the success message
    expect(
      await screen.findByText(
        "Successfully added category fantasy to The Return of the King"
      )
    ).toBeInTheDocument();

    // wait for formik to update the checkbox state
    await waitFor(() => expect(category.checked).toBe(true));
  });
});
