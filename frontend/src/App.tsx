import { useReducer } from "react";

import MainPage from "./pages/MainPage";
import Container from "./components/Container";
import StateContext from "./state/StateContext";
import { initialState } from "./state/initialState";
import { reducer } from "./state/reducer";

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      <Container>
        <MainPage />
      </Container>
    </StateContext.Provider>
  );
};

export default App;
