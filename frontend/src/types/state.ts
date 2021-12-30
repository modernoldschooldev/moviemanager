// Redux types
export interface MovieActorAssociationType {
  actorId: string;
  movieId: string;
}

export interface MovieCategoryAssociationType {
  categoryId: string;
  movieId: string;
}

export interface SelectBoxSliceType {
  availableId: string;
  movieId: string;
  selectedId: string;
}
