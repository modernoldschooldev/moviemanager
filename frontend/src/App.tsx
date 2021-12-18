import { useReducer } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminPage from "./pages/AdminPage";
import MainPage from "./pages/MainPage";

import Container from "./components/Container";
import NavBar from "./components/NavBar";

import StateContext from "./state/StateContext";
import { initialState } from "./state/initialState";
import { reducer } from "./state/reducer";

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <BrowserRouter>
      <StateContext.Provider value={{ state, dispatch }}>
        <Container>
          <NavBar />
          <Routes>
            <Route
              path="*"
              element={<h2 className="text-center text-2xl">404 Not Found</h2>}
            />
            <Route path="/" element={<MainPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Container>
      </StateContext.Provider>
    </BrowserRouter>
  );
};

export default App;
