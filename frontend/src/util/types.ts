export interface Actor {
  id: number;
  name: string;
}

export interface AdminFormData {
  name: string;
  type: "actors" | "categories" | "series" | "studios";
}

export interface Category {
  id: number;
  name: string;
}

export interface Clip {
  id: number;
  actors: Actor[] | null;
  categories: Category[] | null;
  filename: string;
  name: string | null;
  series: Series | null;
  series_num: number | null;
  studio: Studio;
}

export interface ClipActorAssociation {
  actor_id: number;
  clip_id: number;
}

export interface ClipCategoryAssociation {
  category_id: number;
  clip_id: number;
}

export interface ClipUpdate {
  id: number;
  name: string | null;
  series_id: number | null;
  series_num: number | null;
  studio_id: number | null;
}

export interface Series {
  id: number;
  name: string;
}

export interface Studio {
  id: number;
  name: string;
}
