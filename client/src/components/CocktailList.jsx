import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCocktails, searchCocktails, getRandomCocktail } from "../api";

const CocktailList = () => {
  const [cocktails, setCocktails] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [randomCocktail, setRandomCocktail] = useState(null);

  // ✅ Favorites state from localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter((fid) => fid !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setLoading(true);
      const fetchData = async () => {
        try {
          const res = query.trim()
            ? await searchCocktails(query)
            : await fetchCocktails();
          setCocktails(res.data);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    let loaderTimeout;
    if (loading) {
      loaderTimeout = setTimeout(() => setShowLoader(true), 300);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(loaderTimeout);
  }, [loading]);

  const handleSurprise = async () => {
    try {
      const res = await getRandomCocktail();
      setRandomCocktail(res.data);
    } catch (err) {
      console.error("Failed to fetch random cocktail", err);
    }
  };

  return (
    <div className="px-4 max-w-4xl mx-auto">
      <div className="flex flex-col items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by cocktail name or ingredient"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md border rounded px-4 py-2"
        />
        <button
          onClick={handleSurprise}
          className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700"
        >
          🍀 Surprise Me
        </button>
      </div>

      {randomCocktail && (
        <div className="mb-10 p-4 border rounded-lg shadow text-center bg-yellow-100">
          <h2 className="text-xl font-bold mb-2">
            🎉 You got: {randomCocktail.strDrink}
          </h2>
          <img
            src={randomCocktail.strDrinkThumb}
            alt={randomCocktail.strDrink}
            className="w-full max-w-xs mx-auto rounded"
          />
          <p className="mt-2 text-sm text-gray-600">
            {randomCocktail.strCategory} — {randomCocktail.strGlass}
          </p>
        </div>
      )}

      {showLoader && <p className="text-center">Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cocktails.map((cocktail) => (
          <Link to={`/cocktails/${cocktail.id}`} key={cocktail.id}>
            <div className="border rounded-xl shadow p-4 text-center hover:scale-105 transition cursor-pointer relative">
              <img
                src={cocktail.strDrinkThumb}
                alt={cocktail.strDrink}
                className="w-full h-48 object-cover rounded"
              />
              <h3 className="text-lg font-bold mt-4">{cocktail.strDrink}</h3>
              <p className="text-sm text-gray-600">{cocktail.strCategory}</p>

              {/* ❤️ Favorite Icon */}
              <button
                onClick={(e) => {
                  e.preventDefault(); // prevent navigating
                  toggleFavorite(cocktail.id);
                }}
                className="absolute top-2 right-2 text-xl"
              >
                {favorites.includes(cocktail.id) ? "❤️" : "🤍"}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CocktailList;
