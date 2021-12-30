export interface MainPageFormValuesType {
  movieName: string;
  movieStudioId: string;
  movieSeriesId: string;
  movieSeriesNumber: string;
  movieCategories: string[];
}

export interface MoviePropertyFormValuesType {
  name: string;
  action: "add" | "remove" | "update";
  nameSelection: string;
  selection: "actor" | "category" | "series" | "studio";
}
