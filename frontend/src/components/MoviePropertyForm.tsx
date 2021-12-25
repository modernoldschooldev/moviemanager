import { useContext, useEffect } from "react";
import { Field, Formik, FormikHelpers, useFormikContext } from "formik";

import StateContext from "../state/StateContext";

import { AdminFormValuesType } from "../types/form";
import {
  ActorType,
  CategoryType,
  SeriesType,
  StudioType,
} from "../types/state";
import MoviePropertyFormSelector from "./MoviePropertyFormSelector";

const NameSelectorChanged = () => {
  const {
    setFieldValue,
    values: { nameSelection, selection },
  } = useFormikContext<AdminFormValuesType>();
  const { state } = useContext(StateContext);

  useEffect(() => {
    const id = +nameSelection;

    if (id === 0) {
      setFieldValue("name", "");
    } else {
      let names: ActorType[] | CategoryType[] | SeriesType[] | StudioType[];

      switch (selection) {
        case "actor":
          names = state!.actorsAvailable;
          break;

        case "category":
          names = state!.categories;
          break;

        case "series":
          names = state!.series;
          break;

        case "studio":
          names = state!.studios;
          break;
      }

      const nameFilter = names.filter((name) => id === name.id);

      if (nameFilter.length > 0) {
        setFieldValue("name", nameFilter[0].name);
      }
    }
  }, [nameSelection, selection, setFieldValue, state]);

  return null;
};

const PropertySelectionChanged = () => {
  const {
    setFieldValue,
    values: { selection },
  } = useFormikContext<AdminFormValuesType>();

  useEffect(() => {
    setFieldValue("name", "");
    setFieldValue("nameSelection", "");
  }, [selection, setFieldValue]);

  return null;
};

const MoviePropertyForm = () => {
  const { state } = useContext(StateContext);

  const initialValues: AdminFormValuesType = {
    action: "add",
    name: "",
    nameSelection: "",
    selection: "actor",
  };

  const onSubmit = (
    { action, name, nameSelection, selection }: AdminFormValuesType,
    helpers: FormikHelpers<AdminFormValuesType>
  ) => {
    const addHelper = async (endpoint: string) => {
      const selectionTitle =
        selection.charAt(0).toUpperCase() + selection.slice(1);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );
      await response.json();

      switch (response.status) {
        case 200:
          helpers.setStatus(`${selectionTitle} ${name} added`);
          break;

        case 409:
          helpers.setStatus(`${selectionTitle} ${name} already exists`);
          break;

        default:
          helpers.setStatus("Unknown response from backend");
          break;
      }
    };

    const removeHelper = async (endpoint: string) => {
      const selectionTitle =
        selection.charAt(0).toUpperCase() + selection.slice(1);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/${endpoint}/${nameSelection}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      await response.json();

      switch (response.status) {
        case 200:
          helpers.setStatus(`${selectionTitle} ${name} deleted`);
          break;

        case 404:
          helpers.setStatus(`${selectionTitle} ${name} not found on server`);
          break;

        default:
          helpers.setStatus("Unknown response from backend");
          break;
      }
    };

    const updateHelper = async (endpoint: string) => {
      const selectionTitle =
        selection.charAt(0).toUpperCase() + selection.slice(1);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/${endpoint}/${nameSelection}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );
      await response.json();

      switch (response.status) {
        case 200:
          helpers.setStatus(`${selectionTitle} ${name} updated`);
          break;

        case 404:
          helpers.setStatus(`${selectionTitle} ${name} not found on server`);
          break;

        case 409:
          helpers.setStatus(`${selectionTitle} ${name} already exists`);
          break;

        default:
          helpers.setStatus("Unknown response from backend");
          break;
      }
    };

    let helper;

    switch (action) {
      case "add":
        helper = addHelper;
        break;

      case "remove":
        helper = removeHelper;
        break;

      case "update":
        helper = updateHelper;
        break;
    }

    switch (selection) {
      case "actor":
        helper("actors");
        break;

      case "category":
        helper("categories");
        break;

      case "series":
        helper("series");
        break;

      case "studio":
        helper("studios");
        break;
    }

    helpers.setFieldValue("name", "");
  };

  return (
    <div className="border border-black mx-auto my-4 p-4 w-max">
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <NameSelectorChanged />
            <PropertySelectionChanged />

            <div className="flex justify-center mb-3">
              <MoviePropertyFormSelector title="Action">
                <label>
                  <Field
                    className="mx-2"
                    type="radio"
                    name="action"
                    value="add"
                  />
                  Add
                </label>

                <label>
                  <Field
                    className="mx-2"
                    type="radio"
                    name="action"
                    value="update"
                  />
                  Update
                </label>

                <label>
                  <Field
                    className="mx-2"
                    type="radio"
                    name="action"
                    value="remove"
                  />
                  Remove
                </label>
              </MoviePropertyFormSelector>

              <MoviePropertyFormSelector title="Movie Property">
                <label>
                  <Field
                    className="mx-2"
                    type="radio"
                    name="selection"
                    value="actor"
                  />
                  Actor
                </label>

                <label>
                  <Field
                    className="mx-2"
                    type="radio"
                    name="selection"
                    value="category"
                  />
                  Category
                </label>

                <label>
                  <Field
                    className="mx-2"
                    type="radio"
                    name="selection"
                    value="series"
                  />
                  Series
                </label>

                <label>
                  <Field
                    className="mx-2"
                    type="radio"
                    name="selection"
                    value="studio"
                  />
                  Studio
                </label>
              </MoviePropertyFormSelector>
            </div>

            {formik.values.action !== "add" && (
              <div className="my-3">
                <select
                  className="p-1 rounded-lg w-full"
                  name="nameSelection"
                  onChange={formik.handleChange}
                >
                  <option value="">None</option>

                  {formik.values.selection === "actor" &&
                    state?.actorsAvailable.map((actor) => (
                      <option key={actor.id} value={actor.id}>
                        {actor.name}
                      </option>
                    ))}

                  {formik.values.selection === "category" &&
                    state?.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}

                  {formik.values.selection === "series" &&
                    state?.series.map((series) => (
                      <option key={series.id} value={series.id}>
                        {series.name}
                      </option>
                    ))}

                  {formik.values.selection === "studio" &&
                    state?.studios.map((studio) => (
                      <option key={studio.id} value={studio.id}>
                        {studio.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {formik.values.action !== "remove" && (
              <div className="my-3">
                <Field
                  className="border border-black focus:bg-gray-100 px-3 rounded-xl w-full"
                  type="text"
                  name="name"
                  required
                />
              </div>
            )}

            <div className="grid my-3 mx-8">
              <button
                className="bg-green-700 hover:bg-green-600 font-semibold p-2 text-center text-white tracking-wider uppercase"
                type="submit"
              >
                {formik.values.action} {formik.values.selection}
              </button>
            </div>

            {formik.status && (
              <div className="my-6 text-center">
                <p>{formik.status}</p>
              </div>
            )}
          </form>
        )}
      </Formik>
    </div>
  );
};

export default MoviePropertyForm;
