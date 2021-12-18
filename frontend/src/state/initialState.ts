import { StateType } from "../types/state";

export const initialState: StateType = {
  actors: [
    "Carrie Fisher",
    "Christian Bale",
    "Daniel Radcliffe",
    "Emma Watson",
    "Halle Berry",
    "Harrison Ford",
    "Judy Garland",
    "Mark Hamil",
    "Rupert Grint",
    "Sigorney Weaver",
  ],
  selectedActors: null,

  categories: ["animated", "action", "comic", "fantasy", "sci-fi"],
  selectedCategories: null,

  movies: [
    "Avatar",
    "Batman Dark Knight",
    "Catwoman",
    "Harry Potter and the Sorcerer's Stone",
    "Star Wars The Force Awakens",
    "The Wizard of Oz",
  ],
  selectedMovieId: null,

  movieName: null,
  movieStudios: ["Disney", "Fox", "Warner Brothers"],
  movieStudioId: null,
  movieSeries: ["Dark Knight Triology", "Harry Potter", "Star Wars"],
  movieSeriesId: null,
  movieSeriesNumber: null,
};
