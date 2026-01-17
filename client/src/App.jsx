import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import AvailableCocktails from "./pages/AvailableCocktails";
import Favorites from "./pages/Favorites";
import CocktailDetail from "./pages/CocktailDetail";
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CocktailOfTheDay from "./pages/CocktailOfTheDay";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

import { AuthProvider } from "./hooks/useAuth";

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";

    const applyTheme = (theme) => {
      if (theme === "dark") {
        document.body.classList.add("dark-mode");
      } else if (theme === "light") {
        document.body.classList.remove("dark-mode");
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        document.body.classList.toggle("dark-mode", prefersDark);
      }
    };

    applyTheme(savedTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if ((localStorage.getItem("theme") || "system") === "system") {
        document.body.classList.toggle("dark-mode", mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/cocktails/:id" element={<CocktailDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cocktail-of-the-day" element={<CocktailOfTheDay />} />
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
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
