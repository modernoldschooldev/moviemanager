import { FormikProps } from "formik";

export interface MainPageFormValuesType {
  movieId: string | undefined;
  movieName: string;
  movieStudioId: string | undefined;
  movieSeriesId: string | undefined;
  movieSeriesNumber: string;
  movieActorAvailableId: string | undefined;
  movieActorSelectedId: string | undefined;
  movieCategories: string[];
}

export interface MovieSectionProps {
  formik: FormikProps<MainPageFormValuesType>;
}
