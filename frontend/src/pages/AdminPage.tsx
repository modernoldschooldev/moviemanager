import { useContext, useState } from "react";
import { Field, Formik, FormikHelpers } from "formik";

import StateContext from "../state/StateContext";

import { AdminFormValuesType } from "../types/form";
import { Actions } from "../types/state";

const initialValues: AdminFormValuesType = {
  name: "",
  selection: "actor",
};

const AdminPage = () => {
  const [importStatus, setImportStatus] = useState("");
  const { dispatch } = useContext(StateContext);

  const onImportMovies = async () => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND}/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (response.ok) {
      const count = data.length;

      if (count === 0) {
        setImportStatus("No movies were available for import");
      } else {
        setImportStatus(`Imported ${count} movie files`);
      }
    } else {
      setImportStatus(data.detail.message);
    }
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
    <>
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

      <div className="border border-black p-4 mx-auto w-max">
        <div className="flex justify-center">
          <button
            className="bg-blue-700 hover:bg-blue-600 font-semibold px-8 py-2 text-center text-lg text-white"
            type="button"
            onClick={onImportMovies}
          >
            Import Movies
          </button>
        </div>
        {importStatus && <div>{importStatus}</div>}
      </div>
    </>
  );
};

export default AdminPage;
