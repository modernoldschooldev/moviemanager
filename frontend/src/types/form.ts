import { FormikProps } from "formik";

export interface AdminFormValuesType {
  name: string;
  action: "add" | "remove" | "update";
  nameSelection: string;
  selection: "actor" | "category" | "series" | "studio";
}
export interface MainPageFormValuesType {
  movieId: string | undefined;
  movieName: string;
  movieStudioId: string;
  movieSeriesId: string;
  movieSeriesNumber: string;
  movieCategories: string[];
}

export interface MovieSectionProps {
  formik: FormikProps<MainPageFormValuesType>;
}
