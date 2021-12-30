import { useEffect } from "react";
import { Field, Formik, FormikHelpers, useFormikContext } from "formik";

import MoviePropertyFormSelector from "./MoviePropertyFormSelector";

import {
  useActorAddMutation,
  useActorDeleteMutation,
  useActorsQuery,
  useActorUpdateMutation,
  useCategoriesQuery,
  useCategoryAddMutation,
  useCategoryDeleteMutation,
  useCategoryUpdateMutation,
  useSeriesAddMutation,
  useSeriesDeleteMutation,
  useSeriesQuery,
  useSeriesUpdateMutation,
  useStudioAddMutation,
  useStudioDeleteMutation,
  useStudiosQuery,
  useStudioUpdateMutation,
} from "../state/MovieManagerApi";

import { AdminFormValuesType } from "../types/form";
import {
  ActorType,
  CategoryType,
  HTTPExceptionType,
  SeriesType,
  StudioType,
} from "../types/api";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";

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

  const [actorAddTrigger] = useActorAddMutation();
  const [actorDeleteTrigger] = useActorDeleteMutation();
  const [actorUpdateTrigger] = useActorUpdateMutation();

  const [categoryAddTrigger] = useCategoryAddMutation();
  const [categoryDeleteTrigger] = useCategoryDeleteMutation();
  const [categoryUpdateTrigger] = useCategoryUpdateMutation();

  const [seriesAddTrigger] = useSeriesAddMutation();
  const [seriesDeleteTrigger] = useSeriesDeleteMutation();
  const [seriesUpdateTrigger] = useSeriesUpdateMutation();

  const [studioAddTrigger] = useStudioAddMutation();
  const [studioDeleteTrigger] = useStudioDeleteMutation();
  const [studioUpdateTrigger] = useStudioUpdateMutation();

  const initialValues: AdminFormValuesType = {
    action: "add",
    name: "",
    nameSelection: "",
    selection: "actor",
  };

  const onSubmit = async (
    { action, name, nameSelection, selection }: AdminFormValuesType,
    helpers: FormikHelpers<AdminFormValuesType>
  ) => {
    // avoid trying to remove the None element
    if (action === "remove" && nameSelection === "") {
      helpers.setStatus("Please make a selection first");
      return;
    }

    const selectionTitle =
      selection.charAt(0).toUpperCase() + selection.slice(1);

    let trigger;
    let verb: "added" | "removed" | "updated";
    const params = {
      id: nameSelection,
      name,
    };

    switch (action) {
      case "add":
        verb = "added";

        switch (selection) {
          case "actor":
            trigger = actorAddTrigger;
            break;

          case "category":
            trigger = categoryAddTrigger;
            break;

          case "series":
            trigger = seriesAddTrigger;
            break;

          case "studio":
            trigger = studioAddTrigger;
            break;
        }
        break;

      case "remove":
        verb = "removed";

        switch (selection) {
          case "actor":
            trigger = actorDeleteTrigger;
            break;

          case "category":
            trigger = categoryDeleteTrigger;
            break;

          case "series":
            trigger = seriesDeleteTrigger;
            break;

          case "studio":
            trigger = studioDeleteTrigger;
            break;
        }
        break;

      case "update":
        verb = "updated";

        switch (selection) {
          case "actor":
            trigger = actorUpdateTrigger;
            break;

          case "category":
            trigger = categoryUpdateTrigger;
            break;

          case "series":
            trigger = seriesUpdateTrigger;
            break;

          case "studio":
            trigger = studioUpdateTrigger;
            break;
        }
        break;
    }

    try {
      await trigger(params).unwrap();

      helpers.setStatus(`${selectionTitle} ${name} ${verb}`);
      helpers.setFieldValue("name", "");

      if (action === "remove") {
        helpers.setFieldValue("nameSelection", "");
      }
    } catch (error) {
      const { status, data } = error as FetchBaseQueryError;

      if (status !== 422) {
        const {
          detail: { message },
        } = data as HTTPExceptionType;

        helpers.setStatus(message ? message : "Unknown server error");
      }
    }
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
