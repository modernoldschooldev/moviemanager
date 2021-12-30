// formik
import { Field, Formik, FormikHelpers } from "formik";

// redux
import {
  useAddActorMutation,
  useAddCategoryMutation,
  useAddSeriesMutation,
  useAddStudioMutation,
} from "../redux/api";

// types
import { AdminFormData } from "../util/types";

const AdminPage = () => {
  const [addActor] = useAddActorMutation();
  const [addCategory] = useAddCategoryMutation();
  const [addSeries] = useAddSeriesMutation();
  const [addStudio] = useAddStudioMutation();

  const initialValues: AdminFormData = {
    name: "",
    type: "actors",
  };

  const onSubmit = async (
    { name, type }: AdminFormData,
    helpers: FormikHelpers<AdminFormData>
  ) => {
    if (!name) {
      return;
    }

    switch (type) {
      case "actors":
        await addActor(name);
        break;
      case "categories":
        await addCategory(name);
        break;
      case "series":
        await addSeries(name);
        break;
      case "studios":
        await addStudio(name);
        break;
    }

    helpers.setFieldValue("name", "");
  };

  return (
    <div className="my-4 p-2">
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {(formik) => (
          <div className="w-max mx-auto p-3 border border-black text-center">
            <form onSubmit={formik.handleSubmit}>
              <fieldset>
                <div>
                  <label>
                    <Field
                      className="mx-2"
                      type="radio"
                      name="type"
                      value="actors"
                    />
                    Actor
                  </label>

                  <label>
                    <Field
                      className="mx-2"
                      type="radio"
                      name="type"
                      value="categories"
                    />
                    Category
                  </label>

                  <label>
                    <Field
                      className="mx-2"
                      type="radio"
                      name="type"
                      value="series"
                    />
                    Series
                  </label>

                  <label>
                    <Field
                      className="mx-2"
                      type="radio"
                      name="type"
                      value="studios"
                    />
                    Studio
                  </label>
                </div>

                <div className="my-2">
                  <input
                    className="border border-black rounded-lg pl-2 py-1 w-full"
                    type="text"
                    required
                    {...formik.getFieldProps("name")}
                  />
                </div>

                <div className="grid">
                  <button
                    className="bg-green-700 hover:bg-green-600 text-white p-2 mx-4 font-bold uppercase"
                    type="submit"
                    disabled={formik.isSubmitting}
                  >
                    Add {formik.values.type}
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default AdminPage;
