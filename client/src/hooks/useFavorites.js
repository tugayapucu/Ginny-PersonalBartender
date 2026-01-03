import { useEffect, useState } from 'react';
import axios from 'axios';

const useFavorites = (token) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (token) {
      axios
        .get('http://127.0.0.1:8000/favorites/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setFavorites(res.data))
        .catch((err) => console.error('Failed to fetch favorites', err));
    }
  }, [token]);

  const addFavorite = (cocktailId) => {
    axios
      .post(`http://127.0.0.1:8000/favorites/${cocktailId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setFavorites((prev) => [...prev, cocktailId]))
      .catch((err) => console.error('Add failed', err));
  };

  const removeFavorite = (cocktailId) => {
    axios
      .delete(`http://127.0.0.1:8000/favorites/${cocktailId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setFavorites((prev) => prev.filter((id) => id !== cocktailId)))
      .catch((err) => console.error('Remove failed', err));
  };

  return { favorites, addFavorite, removeFavorite };
};

export default useFavorites;
