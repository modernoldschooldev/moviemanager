import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminPage from "./pages/AdminPage";
import MainPage from "./pages/MainPage";

import Container from "./components/Container";
import NavBar from "./components/NavBar";

import { store } from "./state/store";

const App = () => (
  <BrowserRouter>
    <Provider store={store}>
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
    </Provider>
  </BrowserRouter>
);

export default App;
