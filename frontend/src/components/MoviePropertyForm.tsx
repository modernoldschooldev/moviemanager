import { useEffect } from "react";
import { Field, Formik, FormikHelpers, useFormikContext } from "formik";

import MoviePropertyFormSelector from "./MoviePropertyFormSelector";

import {
  useActorsQuery,
  useCategoriesQuery,
  useSeriesQuery,
  useStudiosQuery,
} from "../state/MovieManagerApi";

import { AdminFormValuesType } from "../types/form";
import { ActorType, CategoryType, SeriesType, StudioType } from "../types/api";

const NameSelectorChanged = () => {
  const {
    setFieldValue,
    values: { nameSelection, selection },
  } = useFormikContext<AdminFormValuesType>();

  const { data: actorsAvailable } = useActorsQuery();
  const { data: categories } = useCategoriesQuery();
  const { data: series } = useSeriesQuery();
  const { data: studios } = useStudiosQuery();

  useEffect(() => {
    if (nameSelection === "") {
      setFieldValue("name", "");
    } else {
      let names: ActorType[] | CategoryType[] | SeriesType[] | StudioType[];

      switch (selection) {
        case "actor":
          names = actorsAvailable ?? [];
          break;

        case "category":
          names = categories ?? [];
          break;

        case "series":
          names = series ?? [];
          break;

        case "studio":
          names = studios ?? [];
          break;
      }

      setFieldValue(
        "name",
        names.filter((name) => +nameSelection === name.id)[0]?.name
      );
    }
  }, [
    actorsAvailable,
    categories,
    nameSelection,
    selection,
    series,
    setFieldValue,
    studios,
  ]);

  return null;
};

const RadioSelectionChanged = () => {
  const {
    setFieldValue,
    values: { action, selection },
  } = useFormikContext<AdminFormValuesType>();

  useEffect(() => {
    setFieldValue("name", "");
    setFieldValue("nameSelection", "");
  }, [action, selection, setFieldValue]);

  return null;
};

const MoviePropertyForm = () => {
  const { data: actorsAvailable } = useActorsQuery();
  const { data: categories } = useCategoriesQuery();
  const { data: series } = useSeriesQuery();
  const { data: studios } = useStudiosQuery();

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
    const helper = async (endpoint: string) => {
      // avoid trying to remove the None element
      if (action === "remove" && nameSelection === "") {
        helpers.setStatus("Please make a selection first");
        return;
      }

      const selectionTitle =
        selection.charAt(0).toUpperCase() + selection.slice(1);

      const baseURL = `${process.env.REACT_APP_BACKEND}/${endpoint}`;
      let url = `${baseURL}/${nameSelection}`;
      let method: "POST" | "DELETE" | "PUT";
      let headers = {
        "Content-Type": "application/json",
      };
      let body: string | undefined = JSON.stringify({ name });
      let verb: "added" | "removed" | "updated";

      switch (action) {
        case "add":
          url = baseURL;
          method = "POST";
          verb = "added";
          break;

        case "remove":
          method = "DELETE";
          body = undefined;
          verb = "removed";
          break;

        case "update":
          method = "PUT";
          verb = "updated";
          break;
      }

      const response = await fetch(url, {
        method,
        headers,
        body,
      });
      await response.json();

      switch (response.status) {
        case 200:
          helpers.setStatus(`${selectionTitle} ${name} ${verb}`);
          break;

        case 404:
          helpers.setStatus(`${selectionTitle} ${name} not found`);
          break;

        case 409:
          helpers.setStatus(`${selectionTitle} ${name} already exists`);
          break;

        case 412:
          helpers.setStatus(
            `${selectionTitle} ${name} is on a movie and cannot be removed`
          );
          break;

        default:
          helpers.setStatus(`Server returned HTTP ${response.status}`);
          break;
      }
    };

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
            <RadioSelectionChanged />

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
                  value={formik.values.nameSelection}
                  onChange={formik.handleChange}
                >
                  <option value="">None</option>

                  {formik.values.selection === "actor" &&
                    actorsAvailable?.map((actor) => (
                      <option key={actor.id} value={actor.id}>
                        {actor.name}
                      </option>
                    ))}

                  {formik.values.selection === "category" &&
                    categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}

                  {formik.values.selection === "series" &&
                    series?.map((series) => (
                      <option key={series.id} value={series.id}>
                        {series.name}
                      </option>
                    ))}

                  {formik.values.selection === "studio" &&
                    studios?.map((studio) => (
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
              <div className="font-semibold mt-5 text-center">
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
