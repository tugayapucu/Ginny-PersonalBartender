import { useEffect, useState } from "react";
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

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <Router>
      <Navbar />
      <div className="text-center my-4">
        <button onClick={() => setDarkMode(!darkMode)} style={{
          backgroundColor: "var(--button-bg)",
          color: "var(--button-text)",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer"
        }}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/available" element={<AvailableCocktails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cocktails/:id" element={<CocktailDetail />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
