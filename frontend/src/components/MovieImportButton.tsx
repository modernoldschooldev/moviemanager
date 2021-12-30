import { useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";

import { useMoviesImportMutation } from "../state/MovieManagerApi";

import { HTTPExceptionType, MovieFileType } from "../types/api";

const MovieImportButton = () => {
  const [importStatus, setImportStatus] = useState("");
  const [trigger] = useMoviesImportMutation();

  const onImportMovies = async () => {
    try {
      const data: MovieFileType[] = await trigger().unwrap();
      const count = data.length;

      if (count === 0) {
        setImportStatus("No movies were available for import");
      } else {
        setImportStatus(`Imported ${count} movie file${count > 1 ? "s" : ""}`);
      }
    } catch (error) {
      const { status, data } = error as FetchBaseQueryError;

      if (status !== 422) {
        const {
          detail: { message },
        } = data as HTTPExceptionType;

        setImportStatus(message ? message : "Unknown server error");
      }
    }
  };

  return (
    <div className="border border-black p-4 text-center mx-auto w-max">
      <div>
        <button
          className="bg-blue-700 hover:bg-blue-600 font-semibold px-8 py-2 text-center text-lg text-white"
          type="button"
          onClick={onImportMovies}
        >
          Import Movies
        </button>
      </div>
      {importStatus && <div>{importStatus}</div>}
    </div>
  );
};

export default MovieImportButton;
