export interface AdminFormValuesType {
  name: string;
  action: "add" | "remove" | "update";
  nameSelection: string;
  selection: "actor" | "category" | "series" | "studio";
}
export interface MainPageFormValuesType {
  movieName: string;
  movieStudioId: string;
  movieSeriesId: string;
  movieSeriesNumber: string;
  movieCategories: string[];
}
