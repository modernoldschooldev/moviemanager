import { FormikProps } from "formik";

export interface AdminFormValuesType {
  name: string;
  selection: "actor" | "category" | "series" | "studio";
}
export interface MainPageFormValuesType {
  movieId: string | undefined;
  movieName: string;
  movieStudioId: string;
  movieSeriesId: string;
  movieSeriesNumber: string;
  movieActorAvailableId: string | undefined;
  movieActorSelectedId: string | undefined;
  movieCategories: string[];
}

export interface MovieSectionProps {
  formik: FormikProps<MainPageFormValuesType>;
}
