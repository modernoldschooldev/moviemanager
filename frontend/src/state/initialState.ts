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

  categories: ["animated", "action", "comic", "fantasy", "sci-fi"],

  movies: [
    "Avatar",
    "Batman Dark Knight",
    "Catwoman",
    "Harry Potter and the Sorcerer's Stone",
    "Star Wars The Force Awakens",
    "The Wizard of Oz",
  ],

  movieStudios: ["Disney", "Fox", "Warner Brothers"],
  movieSeries: ["Dark Knight Triology", "Harry Potter", "Star Wars"],
};
