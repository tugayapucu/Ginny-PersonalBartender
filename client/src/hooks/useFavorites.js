import { useEffect, useState } from 'react';
import axios from 'axios';

const useFavorites = (token) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!token) {
      setFavorites([]);
      return;
    }
    axios
      .get('http://127.0.0.1:8000/favorites/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFavorites(res.data || []))
      .catch((err) => console.error('Failed to fetch favorites', err));
  }, [token]);

  const addFavorite = (cocktailId) => {
    const id = String(cocktailId);
    axios
      .post('http://127.0.0.1:8000/favorites/', { cocktail_id: id }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setFavorites((prev) => (prev.map(String).includes(id) ? prev : [...prev, id])))
      .catch((err) => console.error('Add failed', err));
  };

  const removeFavorite = (cocktailId) => {
    const id = String(cocktailId);
    axios
      .delete(`http://127.0.0.1:8000/favorites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setFavorites((prev) => prev.filter((favId) => String(favId) !== id)))
      .catch((err) => console.error('Remove failed', err));
  };

  return { favorites, addFavorite, removeFavorite };
};

export default useFavorites;
