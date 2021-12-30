// react router
import { BrowserRouter, Route, Routes } from "react-router-dom";

// components
import Container from "./components/Container";
import Navbar from "./components/Navbar";

import AdminPage from "./pages/AdminPage";
import ClipEditorPage from "./pages/ClipEditorPage";

const App = () => {
  return (
    <BrowserRouter>
      <Container>
        <Navbar />
        <Routes>
          <Route path="/" element={<ClipEditorPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
