import { useContext } from "react";
import { Field, Formik, FormikHelpers } from "formik";

import StateContext from "../state/StateContext";

import { AdminFormValuesType } from "../types/form";
import { Actions } from "../types/state";

const AdminAddForm = () => {
  const { dispatch } = useContext(StateContext);

  const initialValues: AdminFormValuesType = {
    name: "",
    selection: "actor",
  };

  const onSubmit = async (
    { name, selection }: AdminFormValuesType,
    helpers: FormikHelpers<AdminFormValuesType>
  ) => {
    switch (selection) {
      case "actor":
        dispatch({
          type: Actions.AddActor,
          payload: name,
        });
        break;

      case "category":
        dispatch({
          type: Actions.AddCategory,
          payload: name,
        });
        break;

      case "series":
        dispatch({
          type: Actions.AddSeries,
          payload: name,
        });
        break;

      case "studio":
        dispatch({
          type: Actions.AddStudio,
          payload: name,
        });
        break;

      default:
        console.error("You should not be seeing this...");
    }

    helpers.setFieldValue("name", "");
  };

  return (
    <div className="border border-black mx-auto my-4 p-4 w-max">
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
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
            </div>

            <div className="my-3">
              <Field
                className="border border-black focus:bg-gray-100 px-2 rounded-xl w-full"
                type="text"
                name="name"
                required
              />
            </div>

            <div className="grid mt-3 mx-4">
              <button
                className="bg-green-700 hover:bg-green-600 font-semibold p-2 text-center text-white tracking-wider uppercase"
                type="submit"
              >
                Add {formik.values.selection}
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AdminAddForm;
