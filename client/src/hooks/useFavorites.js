import { useEffect, useState } from 'react';
import {
  addFavoriteRequest,
  getFavoritesRequest,
  removeFavoriteRequest,
} from "../api";

const useFavorites = (token) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!token) {
      setFavorites([]);
      return;
    }
    getFavoritesRequest(token)
      .then((res) => setFavorites(res.data || []))
      .catch((err) => console.error('Failed to fetch favorites', err));
  }, [token]);

  const addFavorite = (cocktailId) => {
    const id = String(cocktailId);
    addFavoriteRequest(token, id)
      .then(() => setFavorites((prev) => (prev.map(String).includes(id) ? prev : [...prev, id])))
      .catch((err) => console.error('Add failed', err));
  };

  const removeFavorite = (cocktailId) => {
    const id = String(cocktailId);
    removeFavoriteRequest(token, id)
      .then(() => setFavorites((prev) => prev.filter((favId) => String(favId) !== id)))
      .catch((err) => console.error('Remove failed', err));
  };

  return { favorites, addFavorite, removeFavorite };
};

export default useFavorites;
