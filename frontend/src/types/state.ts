// Redux types
export interface MovieActorAssociationType {
  actorId: string;
  movieId: string;
}

export interface MovieCategoryAssociationType {
  categoryId: string;
  movieId: string;
}

export interface MovieUpdateType {
  id: string;
  name: string | null;
  series_id: number | null;
  series_number: number | null;
  studio_id: number | null;
}

export interface SelectBoxSliceType {
  availableId: string | undefined;
  movieId: string | undefined;
  selectedId: string | undefined;
}
