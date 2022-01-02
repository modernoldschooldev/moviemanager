import { Formik } from "formik";
import { mainPageFormInitialValues } from "../../state/formik";

const MockFormikContext: React.FC = ({ children }) => (
  <Formik initialValues={mainPageFormInitialValues} onSubmit={jest.fn()}>
    {children}
  </Formik>
);

export default MockFormikContext;
