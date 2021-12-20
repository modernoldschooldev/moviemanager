import { ActorType, CategoryType, SeriesType, StudioType } from "./state";

export interface MovieInfoResponseType {
  id: number;
  filename: string;
  name: string | null;
  actors: ActorType[];
  categories: CategoryType[];
  series: SeriesType | null;
  series_number: number | null;
  studio: StudioType | null;
}
