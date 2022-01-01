import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminPage from "./pages/AdminPage";
import MainPage from "./pages/MainPage";

import Container from "./components/Container";
import NavBar from "./components/NavBar";

const App = () => (
  <BrowserRouter>
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
  </BrowserRouter>
);

export default App;
