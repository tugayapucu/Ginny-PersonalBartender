import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CocktailApi } from "../api";
import useFavorites from "../hooks/useFavorites";

const Favorites = () => {
  const { favorites, removeFromFavorites } = useFavorites();
  const [cocktails, setCocktails] = useState([]);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const cocktailPromises = favorites.map((id) =>
          CocktailApi.getCocktail(id)
        );
        const data = await Promise.all(cocktailPromises);
        setCocktails(data);
      } catch (err) {
        console.error("Failed to load favorite cocktails", err);
      }
    };

    if (favorites.length > 0) fetchFavs();
    else setCocktails([]);
  }, [favorites]);

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">
        ❤️ My Favorite Cocktails
      </h2>
      {cocktails.length === 0 ? (
        <p className="text-center text-gray-500">No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cocktails.map((cocktail) => (
            <div
              key={cocktail.id}
              className="border rounded-xl shadow p-4 text-center relative"
            >
              <Link to={`/cocktails/${cocktail.id}`}>
                <img
                  src={cocktail.strDrinkThumb}
                  alt={cocktail.strDrink}
                  className="w-full h-48 object-cover rounded"
                />
                <h3 className="text-lg font-bold mt-2">{cocktail.strDrink}</h3>
              </Link>
              <button
                onClick={() => removeFromFavorites(cocktail.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 text-sm"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
