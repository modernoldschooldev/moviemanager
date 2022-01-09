import {
  ActorType,
  CategoryType,
  MovieFileType,
  MovieType,
  SeriesType,
  StudioType,
} from "../types/api";

export const hobbitActors = ["Andy Serkis", "Ian McKellen", "Orlando Bloom"];

export const hobbitMovieName = "The Desolation of Smaug";
export const hobbitActorsString = hobbitActors.join(", ");
export const hobbitMovieSeries = "The Hobbit";
export const hobbitMovieFilename = `[Disney] {${hobbitMovieSeries} 2} ${hobbitMovieName} (${hobbitActorsString}).mp4`;

export const lotrActors = [
  "Andy Serkis",
  "Elijah Wood",
  "Ian McKellen",
  "John Rhys-Davies",
  "Orlando Bloom",
  "Sean Astin",
  "Viggo Mortensen",
];

export const lotrMovieName = "The Return of the King";
export const lotrActorsString = lotrActors.join(", ");
export const lotrMovieSeries = "Lord of the Rings";
export const lotrMovieFilename = `[New Line Cinema] {${lotrMovieSeries} 3} ${lotrMovieName} (${lotrActorsString}).mp4`;

export const actors: ActorType[] = [
  {
    id: 1,
    name: "Andy Serkis",
  },
  {
    id: 2,
    name: "Elijah Wood",
  },
  {
    id: 3,
    name: "Ian McKellen",
  },
  {
    id: 4,
    name: "John Rhys-Davies",
  },
  {
    id: 5,
    name: "Orlando Bloom",
  },
  {
    id: 6,
    name: "Sean Astin",
  },
  {
    id: 7,
    name: "Viggo Mortensen",
  },
  {
    id: 8,
    name: "Chris Pratt",
  },
];

export const categories: CategoryType[] = [
  {
    id: 1,
    name: "fantasy",
  },
  {
    id: 2,
    name: "action",
  },
];

export const movies: MovieFileType[] = [
  {
    id: 1,
    filename: lotrMovieFilename,
  },
];

export const series: SeriesType[] = [
  {
    id: 1,
    name: lotrMovieSeries,
  },
  {
    id: 2,
    name: hobbitMovieSeries,
  },
];

export const studios: StudioType[] = [
  {
    id: 1,
    name: "New Line Cinema",
  },
  {
    id: 2,
    name: "Disney",
  },
];

export const lotrMovie: MovieType = {
  id: movies[0].id,
  filename: lotrMovieFilename,
  name: lotrMovieName,
  actors: actors.filter((actor) => lotrActors.includes(actor.name)),
  categories: categories.filter((category) => category.name === "fantasy"),
  series: series.filter((series) => series.name === lotrMovieSeries)[0],
  series_number: 3,
  studio: studios.filter((studio) => studio.name === "New Line Cinema")[0],
};

export const hobbitMovie: MovieType = {
  id: movies[0].id,
  filename: hobbitMovieFilename,
  name: hobbitMovieName,
  actors: actors.filter((actor) => hobbitActors.includes(actor.name)),
  categories: categories.filter((category) => category.name === "fantasy"),
  series: series.filter((series) => series.name === hobbitMovieSeries)[0],
  series_number: 2,
  studio: studios.filter((studio) => studio.name === "Disney")[0],
};
