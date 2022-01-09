import { MovieUpdateType } from "./api";

// Redux types
export interface MovieActorAssociationType {
  actorId: string;
  movieId: string;
}

export interface MovieCategoryAssociationType {
  categoryId: string;
  movieId: string;
}

export interface MoviePropertyType {
  id: string;
  name: string;
}

export interface MovieUpdateQueryType extends MovieUpdateType {
  id: string;
}

export interface SelectBoxSliceType {
  availableId: string | undefined;
  movieId: string | undefined;
  selectedId: string | undefined;
}
