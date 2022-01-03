import "@testing-library/jest-dom/extend-expect";
import user from "@testing-library/user-event";
import { DefaultRequestBody, PathParams, rest } from "msw";

import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "../../test-utils";

import { actors, categories, lotrActors, lotrMovie } from "../../msw/defaults";
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
    // find the remove and update buttons
    const removeButton = screen.getByRole("button", { name: /remove/i });
    const updateButton = screen.getByRole("button", { name: /update/i });

    // wait for them to be enabled
    await waitFor(() => expect(removeButton).toBeEnabled());
    await waitFor(() => expect(updateButton).toBeEnabled());

    // find the movie name form element and ensure it is enabled
    expect(
      await screen.findByDisplayValue("The Return of the King")
    ).toBeEnabled();

    // find the studio combobox
    const studioCombobox: HTMLSelectElement = await screen.findByLabelText(
      "Studio"
    );

    // wait for the combobox to be enabled and have value 1
    await waitFor(() => {
      expect(studioCombobox).toBeEnabled();
      expect(studioCombobox.value).toBe("1");
    });

    // find series combobox
    const seriesCombobox: HTMLSelectElement = await screen.findByLabelText(
      "Series"
    );

    // wait for it to be enabled and have value 1
    await waitFor(() => {
      expect(seriesCombobox).toBeEnabled();
      expect(seriesCombobox.value).toBe("1");
    });

    // find fantasy category
    const category: HTMLInputElement = await screen.findByRole("checkbox", {
      name: "fantasy",
    });

    // wait for it to be enabled and checked
    await waitFor(() => {
      expect(category).toBeEnabled();
      expect(category.checked).toBe(true);
    });

    // find actor IDs for all actors in Return of the King
    const ids = actors
      .filter((actor) => lotrActors.includes(actor.name))
      .map((actor) => actor.id);

    // ensure that each actor is in the selector actors listbox
    for (let id of ids) {
      expect(
        await screen.findByTestId(`actors-selected-${id}`)
      ).toBeInTheDocument();
    }

    // find the series # - ensure it is enabled and has value ""
    const seriesNumber: HTMLInputElement = screen.getByRole("textbox", {
      name: "Series #",
    });
    expect(seriesNumber.value).toBe("3");
  });

  //////////////////////////////////////////////////////////////////////////////

  const addAvailableActor = async (name: string) => {
    // find the ID of the actor in the mock data
    const id = actors.filter((actor) => actor.name === name)[0].id;

    // find the listbox and the actor option
    const listbox = await screen.findByRole("listbox", { name: "Available" });
    const option = await screen.findByTestId(`actors-available-${id}`);

    // select the item from the listbox and double-click to add
    user.selectOptions(listbox, option);
    user.dblClick(option);
  };

  it("Fails to add duplicate Elijah Wood to Return of the King", async () => {
    const name = "Elijah Wood";

    // add temp endpoint to fake error
    server.use(
      rest.post<DefaultRequestBody, PathParams, HTTPExceptionType>(
        backend("/movie_actor"),
        (req, res, ctx) => {
          return res(
            ctx.delay(150),
            ctx.status(409),
            ctx.json({
              detail: {
                message: `Actor ${name} is already on Return of the King`,
              },
            })
          );
        }
      )
    );

    // wait for the user to add the actor
    await addAvailableActor(name);

    // wait for the error message
    expect(
      await screen.findByText(`Actor ${name} is already on Return of the King`)
    ).toBeInTheDocument();
  });

  it("Successfully adds Elijah Wood to Return of the King", async () => {
    const name = "Elijah Wood";

    // wait for the user to add the actor
    await addAvailableActor(name);

    // wait for the success message
    expect(
      await screen.findByText(
        `Successfully added ${name} to The Return of the King`
      )
    ).toBeInTheDocument();
  });

  //////////////////////////////////////////////////////////////////////////////

  const getCategoryCheckbox = async (name: string, checked: boolean = true) => {
    // find the checkbox
    const category: HTMLInputElement = await screen.findByRole("checkbox", {
      name,
    });

    // wait for the checkbox status to update
    await waitFor(() => expect(category.checked).toBe(checked));

    return category;
  };

  it("Fails to remove the fantasy category from Return of the King", async () => {
    // add one time endpoint to fake error from server
    server.use(
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
      )
    );

    const category = await getCategoryCheckbox("fantasy");

    // click the checkbox to remove the category
    user.click(category);

    // look for the failure text from our one time error
    expect(
      await screen.findByText("Failed to remove invalid category ID")
    ).toBeInTheDocument();

    // wait for formik to update the checkbox state
    await waitFor(() => expect(category.checked).toBe(true));
  });

  it("Successfully removes fantasy category from Return of the King", async () => {
    // add one time override to fake the category being removed
    server.use(
      rest.get<DefaultRequestBody, PathParams, MovieType>(
        backend("/movies/:id"),
        (req, res, ctx) => {
          return res(
            ctx.delay(150),
            ctx.json({ ...lotrMovie, categories: [] })
          );
        }
      )
    );

    const category = await getCategoryCheckbox("fantasy");

    // click the checkbox to remove the category
    user.click(category);

    // look for the success message
    expect(
      await screen.findByText(
        "Successfully removed category fantasy from The Return of the King"
      )
    ).toBeInTheDocument();

    // wait for formik to update the checkbox state
    await waitFor(() => expect(category.checked).toBe(false));
  });

  it("Fails to add action category to Return of the King", async () => {
    const name = "action";

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
      )
    );

    const category = await getCategoryCheckbox(name, false);

    // click the checkbox to add the category
    user.click(category);

    // look for failure response
    expect(
      await screen.findByText("Failed to add invalid category ID")
    ).toBeInTheDocument();

    // wait for formik to update the checkbox state
    await waitFor(() => expect(category.checked).toBe(false));
  });

  it("Successfully adds action cateogry to Return of the King", async () => {
    const name = "action";

    // add one time override to fake the category being added
    server.use(
      rest.get<DefaultRequestBody, PathParams, MovieType>(
        backend("/movies/:id"),
        (req, res, ctx) => {
          return res(
            ctx.delay(150),
            ctx.json({
              ...lotrMovie,
              categories: [
                ...lotrMovie.categories,
                categories.filter((category) => category.name === name)[0],
              ],
            })
          );
        }
      )
    );

    const category = await getCategoryCheckbox(name, false);

    // click the checkbox to add the category
    user.click(category);

    // look for the success message
    expect(
      await screen.findByText(
        `Successfully added category ${name} to The Return of the King`
      )
    ).toBeInTheDocument();

    // wait for formik to update the checkbox state
    await waitFor(() => expect(category.checked).toBe(true));
  });
});
