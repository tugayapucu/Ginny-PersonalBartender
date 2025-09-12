import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import AvailableCocktails from "./pages/AvailableCocktails";
import Favorites from "./pages/Favorites";
import CocktailDetail from "./pages/CocktailDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/cocktails/:id" element={<CocktailDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/available"
          element={
            <ProtectedRoute>
              <AvailableCocktails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
