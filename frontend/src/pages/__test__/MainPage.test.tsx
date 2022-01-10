import "@testing-library/jest-dom/extend-expect";
import user from "@testing-library/user-event";

import { DefaultRequestBody, PathParams, rest } from "msw";

import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "../../test-utils";

import {
  actors,
  categories,
  hobbitMovie,
  lotrActors,
  lotrMovie,
} from "../../msw/defaults";
import { backend, server } from "../../msw/server";

import MainPage from "../MainPage";

import {
  HTTPExceptionType,
  MessageType,
  MovieFileType,
  MovieType,
  MovieUpdateType,
} from "../../types/api";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Test MainPage", () => {
  const actorName = "Elijah Wood";
  const movieName = "The Return of the King";

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

  // do nothing test just to display this message
  it("Renders the MainPage without errors", () => {});

  describe("Test Movie Selection", () => {
    it("Fills in form values when Return of the King is selected", async () => {
      // find the remove and update buttons
      const removeButton = screen.getByRole("button", { name: /remove/i });
      const updateButton = screen.getByRole("button", { name: /update/i });

      // wait for them to be enabled
      await waitFor(() => expect(removeButton).toBeEnabled());
      await waitFor(() => expect(updateButton).toBeEnabled());

      // find the movie name form element and ensure it is enabled
      expect(await screen.findByDisplayValue(movieName)).toBeEnabled();

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
  });

  describe("Test ActorSelector Changes", () => {
    const getActor = (name: string) => {
      return actors.filter((actor) => actor.name === name)[0];
    };

    const addAvailableActor = async (name: string) => {
      // find the ID of the actor in the mock data
      const id = getActor(name).id;

      // find the listbox and the actor option
      const listbox = await screen.findByRole("listbox", { name: "Available" });
      const option = await screen.findByTestId(`actors-available-${id}`);

      // select the item from the listbox and double-click to add
      user.selectOptions(listbox, option);
      user.dblClick(option);
    };

    const removeSelectedActor = async (name: string) => {
      // find the ID of the actor in the mock data
      const id = getActor(name).id;

      // find the listbox and the actor option
      const listbox = await screen.findByRole("listbox", { name: "Selected" });
      const option = await screen.findByTestId(`actors-selected-${id}`);

      // select the item from the listbox and double-click to remove
      user.selectOptions(listbox, option);
      user.dblClick(option);
    };

    it("Fails to add duplicate Elijah Wood to Return of the King", async () => {
      const message = `Actor ${actorName} is already on ${movieName}`;

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
                  message,
                },
              })
            );
          }
        )
      );

      // wait for the user to add the actor
      await addAvailableActor(actorName);

      // wait for the error message
      expect(await screen.findByText(message)).toBeInTheDocument();
    });

    it("Successfully adds Chris Pratt to Return of the King", async () => {
      const actorName = "Chris Pratt";
      const message = `Successfully added ${actorName} to ${movieName}`;

      // add one time override to fake the actor being added
      server.use(
        rest.get<DefaultRequestBody, PathParams, MovieType>(
          backend("/movies/:id"),
          (req, res, ctx) => {
            return res(
              ctx.delay(150),
              ctx.json({
                ...lotrMovie,
                actors: [...lotrMovie.actors, getActor(actorName)],
              })
            );
          }
        )
      );

      // wait for the user to add the actor
      await addAvailableActor(actorName);

      // wait for the success message
      expect(await screen.findByText(message)).toBeInTheDocument();

      // wait for the actor to be added to the selected actors listbox
      expect(
        await screen.findByTestId(`actors-selected-${getActor(actorName).id}`)
      ).toBeInTheDocument();
    });

    it("Fails to remove Elijah Wood from Return of the King", async () => {
      const message = `Failed to remove actor ${actorName} from ${movieName}`;

      server.use(
        rest.delete<DefaultRequestBody, PathParams, HTTPExceptionType>(
          backend("/movie_actor"),
          (req, res, ctx) => {
            return res(
              ctx.delay(150),
              ctx.status(404),
              ctx.json({
                detail: { message },
              })
            );
          }
        )
      );

      // wait for the user to remove the actor
      await removeSelectedActor(actorName);

      // wait for the failure message
      expect(await screen.findByText(message)).toBeInTheDocument();

      // the actor should still be in the selected actors listbox
      expect(
        await screen.findByTestId(`actors-selected-${getActor(actorName).id}`)
      ).toBeInTheDocument();
    });

    it("Successfully removes Elijah Wood from Return of the King", async () => {
      const message = `Successfully removed ${actorName} from The Return of the King`;

      // add one time override to fake the actor being removed
      server.use(
        rest.get<DefaultRequestBody, PathParams, MovieType>(
          backend("/movies/:id"),
          (req, res, ctx) => {
            return res(
              ctx.delay(150),
              ctx.json({
                ...lotrMovie,
                actors: lotrMovie.actors.filter(
                  (actor) => actor.name !== actorName
                ),
              })
            );
          }
        )
      );

      // wait for the user to remove the actor
      await removeSelectedActor(actorName);

      // wait for the success message
      expect(await screen.findByText(message)).toBeInTheDocument();

      // wait for the actor to be removed from the selected actors listbox
      await waitForElementToBeRemoved(
        await screen.findByTestId(`actors-selected-${getActor(actorName).id}`)
      );
    });
  });

  describe("Test CategorySelector Changes", () => {
    const getCategoryCheckbox = async (
      name: string,
      checked: boolean = true
    ) => {
      // find the checkbox
      const category: HTMLInputElement = await screen.findByRole("checkbox", {
        name,
      });

      // wait for the checkbox status to update
      await waitFor(() => expect(category.checked).toBe(checked));

      return category;
    };

    it("Fails to remove the fantasy category from Return of the King", async () => {
      const categoryName = "fantasy";
      const message = `Failed to remove category ${categoryName} from ${movieName}`;

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
                  message,
                },
              })
            );
          }
        )
      );

      const checkbox = await getCategoryCheckbox(categoryName);

      // click the checkbox to remove the category
      user.click(checkbox);

      // look for the failure text from our one time error
      expect(await screen.findByText(message)).toBeInTheDocument();

      // wait for formik to update the checkbox state
      await waitFor(() => expect(checkbox.checked).toBe(true));
    });

    it("Successfully removes fantasy category from Return of the King", async () => {
      const categoryName = "fantasy";
      const message = `Successfully removed category ${categoryName} from ${movieName}`;

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

      const checkbox = await getCategoryCheckbox(categoryName);

      // click the checkbox to remove the category
      user.click(checkbox);

      // look for the success message
      expect(await screen.findByText(message)).toBeInTheDocument();

      // wait for formik to update the checkbox state
      await waitFor(() => expect(checkbox.checked).toBe(false));
    });

    it("Fails to add action category to Return of the King", async () => {
      const categoryName = "action";
      const message = `Failed to add category ${categoryName} to ${movieName}`;

      server.use(
        rest.post<DefaultRequestBody, PathParams, HTTPExceptionType>(
          backend("/movie_category"),
          (req, res, ctx) => {
            return res.once(
              ctx.delay(150),
              ctx.status(404),
              ctx.json({
                detail: {
                  message,
                },
              })
            );
          }
        )
      );

      const checkbox = await getCategoryCheckbox(categoryName, false);

      // click the checkbox to add the category
      user.click(checkbox);

      // look for failure response
      expect(await screen.findByText(message)).toBeInTheDocument();

      // wait for formik to update the checkbox state
      await waitFor(() => expect(checkbox.checked).toBe(false));
    });

    it("Successfully adds action cateogry to Return of the King", async () => {
      const categoryName = "action";
      const message = `Successfully added category ${categoryName} to ${movieName}`;

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
                  categories.filter(
                    (category) => category.name === categoryName
                  )[0],
                ],
              })
            );
          }
        )
      );

      const checkbox = await getCategoryCheckbox(categoryName, false);

      // click the checkbox to add the category
      user.click(checkbox);

      // look for the success message
      expect(await screen.findByText(message)).toBeInTheDocument();

      // wait for formik to update the checkbox state
      await waitFor(() => expect(checkbox.checked).toBe(true));
    });
  });

  describe("Test MovieDataForm Changes", () => {
    let nameField: HTMLInputElement;
    let studioSelector: HTMLSelectElement;
    let seriesSelector: HTMLSelectElement;
    let seriesNumberField: HTMLInputElement;
    let updateButton: HTMLButtonElement;
    let removeButton: HTMLButtonElement;

    // get all MovieDataForm fields before each test
    beforeEach(() => {
      nameField = screen.getByRole("textbox", { name: "Name" });
      studioSelector = screen.getByRole("combobox", { name: "Studio" });
      seriesSelector = screen.getByRole("combobox", { name: "Series" });
      seriesNumberField = screen.getByRole("textbox", { name: "Series #" });
      updateButton = screen.getByRole("button", { name: /update/i });
      removeButton = screen.getByRole("button", { name: /remove/i });
    });

    it("Successfully changes Return of the King -> Desolation of Smaug", async () => {
      // mock the backend endpoints
      server.use(
        rest.get<DefaultRequestBody, PathParams, MovieFileType[]>(
          backend("/movies"),
          (req, res, ctx) => {
            return res(
              ctx.delay(150),
              ctx.json([
                {
                  id: 1,
                  filename: hobbitMovie.filename,
                },
              ])
            );
          }
        ),
        rest.get<DefaultRequestBody, PathParams, MovieType>(
          backend("/movies/:id"),
          (req, res, ctx) => {
            return res(ctx.delay(150), ctx.json(hobbitMovie));
          }
        ),
        rest.put<MovieUpdateType, PathParams, MovieType>(
          backend("/movies/:id"),
          (req, res, ctx) => {
            return res(ctx.delay(150), ctx.json(hobbitMovie));
          }
        )
      );

      // replace the movie name
      user.clear(nameField);
      user.type(nameField, hobbitMovie.name!);
      expect(nameField.value).toBe(hobbitMovie.name);

      // update the movie studio
      const studioId = hobbitMovie.studio!.id.toString();
      user.selectOptions(studioSelector, studioId);
      expect(studioSelector.value).toBe(studioId);

      // update the movie series
      const seriesId = hobbitMovie.series!.id.toString();
      user.selectOptions(seriesSelector, seriesId);
      expect(seriesSelector.value).toBe(seriesId);

      // update the movie series number
      const seriesNumber = hobbitMovie.series_number!.toString();
      user.clear(seriesNumberField);
      user.type(seriesNumberField, seriesNumber);
      expect(seriesNumberField.value).toBe(seriesNumber);

      // click the update button
      user.click(updateButton);

      await screen.findByText(`Successfully updated movie ${hobbitMovie.name}`);
      await screen.findByRole("option", { name: hobbitMovie.filename });
    });

    it("Successfully removes Return of the King", async () => {
      // mock the backend endpoints
      server.use(
        rest.get<DefaultRequestBody, PathParams, MovieFileType[]>(
          backend("/movies"),
          (req, res, ctx) => {
            return res(ctx.delay(150), ctx.json([]));
          }
        ),
        rest.delete<DefaultRequestBody, PathParams, MessageType>(
          backend("/movies/:id"),
          (req, res, ctx) => {
            return res(
              ctx.delay(150),
              ctx.json({
                message: `Successfully removed movie ${hobbitMovie.name}`,
              })
            );
          }
        )
      );

      // Thanks to wgoodall01 and Francois Zaninotto for this idea
      // https://stackoverflow.com/questions/48728167/simulate-clicking-ok-or-cancel-in-a-confirmation-window-using-enzyme

      // grab the movie list entry and selected actors listbox
      // so we can await their removal later
      const movieListOption = await screen.findByRole("option", {
        name: lotrMovie.filename,
      });

      // mock the window.confirm function to always return true
      const confirmSpy = jest.spyOn(window, "confirm");
      confirmSpy.mockImplementation(jest.fn(() => true));

      // click remove to remove the movie
      user.click(removeButton);

      // make sure the window.confirm function was called
      expect(window.confirm).toBeCalled();
      confirmSpy.mockRestore();

      // make sure the movie was removed from the MovieList
      await waitForElementToBeRemoved(movieListOption);

      // check that form elements are disabled and empty

      // name textbox
      await waitFor(() => {
        expect(nameField.value).toBe("");
        expect(nameField).toBeDisabled();
      });

      // studio combobox
      await waitFor(() => {
        expect(studioSelector.value).toBe("");
        expect(studioSelector).toBeDisabled();
      });

      // series combobox
      await waitFor(() => {
        expect(seriesSelector.value).toBe("");
        expect(seriesSelector).toBeDisabled();
      });

      // series number textbox
      await waitFor(() => {
        expect(seriesNumberField.value).toBe("");
        expect(seriesNumberField).toBeDisabled();
      });

      // update/remove buttons
      await waitFor(() => {
        expect(removeButton).toBeDisabled();
        expect(updateButton).toBeDisabled();
      });

      // category checkboxes
      const checkboxes: HTMLInputElement[] = await screen.findAllByRole(
        "checkbox"
      );

      for (let checkbox of checkboxes) {
        await waitFor(() => {
          expect(checkbox.checked).toBe(false);
          expect(checkbox).toBeDisabled();
        });
      }

      // available actors listbox
      await waitFor(() => {
        expect(
          screen.getByRole("listbox", { name: "Available" })
        ).toBeDisabled();
      });

      // selected actors should be replaced with a None heading
      await screen.findByRole("heading", { name: "None" });

      // if we found the None heading, then the actors listbox must be gone
      expect(screen.queryByRole("listbox", { name: "Selected" })).toBeNull();
    });
  });
});
