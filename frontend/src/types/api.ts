export interface BaseMovieProperty {
  id: number;
  name: string;
}

export interface ActorType extends BaseMovieProperty {}
export interface CategoryType extends BaseMovieProperty {}

export interface HTTPExceptionType {
  detail: {
    message: string;
  };
}

export interface HTTPValidationErrorType {
  detail: [
    {
      loc: string[];
      msg: string;
      type: string;
    }
  ];
}

export interface MovieType {
  id: number;
  filename: string;
  name: string | null;
  actors: ActorType[];
  categories: CategoryType[];
  series: SeriesType | null;
  series_number: number | null;
  studio: StudioType | null;
}

export interface MovieFileType {
  id: number;
  filename: string;
}

export interface SeriesType extends BaseMovieProperty {}
export interface StudioType extends BaseMovieProperty {}
