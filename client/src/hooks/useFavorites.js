import { useState, useEffect } from "react";
import { CocktailApi } from "../api";
import useAuth from "./useAuth";

// Custom Favorites Hook - Eliminates ALL Duplicate Logic
export default function useFavorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          // Use backend API instead of localStorage
          const favoritesData = await CocktailApi.getFavoriteCocktails();
          setFavorites(favoritesData);
        } catch (err) {
          setError(err.message);
          // fallback to localStorage if backend fails
          const saved = localStorage.getItem("favorites");
          setFavorites(saved ? JSON.parse(saved) : []);
        } finally {
          setLoading(false);
        }
      } else {
        // not authenticated - use localStorage
        const saved = localStorage.getItem("favorites");
        setFavorites(saved ? JSON.parse(saved) : []);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  // Add to favorites
  const addToFavorites = async (cocktailId) => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        // Use backend API
        await CocktailApi.addToFavorites(cocktailId);
        setFavorites((prev) => [...prev, cocktailId]);
      } else {
        // Fallback to localStorage
        const updated = [...favorites, cocktailId];
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (cocktailId) => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        // Use backend API
        await CocktailApi.removeFromFavorites(cocktailId);
        setFavorites((prev) => prev.filter((id) => id !== cocktailId));
      } else {
        // fallback to localStorage
        const updated = favorites.filter((id) => id !== cocktailId);
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite (most common use case)
  const toggleFavorite = async (cocktailId) => {
    const isFavorite = favorites.includes(cocktailId);

    if (isFavorite) {
      await removeFromFavorites(cocktailId);
    } else {
      await addToFavorites(cocktailId);
    }
  };

  // Check if cocktail is favorite
  const isFavorite = (cocktailId) => favorites.includes(cocktailId);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length,
  };
}
