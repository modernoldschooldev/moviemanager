import {
  ActorType,
  CategoryType,
  MovieFileType,
  MovieType,
  SeriesType,
  StudioType,
} from "../types/api";

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
    filename:
      "[New Line Cinema] {Lord of the Rings 3} The Return of the King (Andy Serkis, Elijah Wood, Ian McKellen, John Rhys-Davies, Orlando Bloom, Sean Astin, Viggo Mortensen).mp4",
  },
];

export const series: SeriesType[] = [
  {
    id: 1,
    name: "Lord of the Rings",
  },
];

export const studios: StudioType[] = [
  {
    id: 1,
    name: "New Line Cinema",
  },
];

export const lotrActors = [
  "Andy Serkis",
  "Elijah Wood",
  "Ian McKellen",
  "John Rhys-Davies",
  "Orlando Bloom",
  "Sean Astin",
  "Viggo Mortensen",
];

export const lotrMovie: MovieType = {
  id: movies[0].id,
  filename: movies[0].filename,
  name: "The Return of the King",
  actors: actors.filter((actor) => lotrActors.includes(actor.name)),
  categories: categories.filter((category) => category.name === "fantasy"),
  series: series.filter((series) => series.name === "Lord of the Rings")[0],
  series_number: 3,
  studio: studios.filter((studio) => studio.name === "New Line Cinema")[0],
};
