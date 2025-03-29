import React, { useEffect, useState } from "react";
import { fetchCocktails, searchCocktails } from "../api";

const CocktailList = () => {
  const [cocktails, setCocktails] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

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

  // Handle smooth loader display
  useEffect(() => {
    let loaderTimeout;
    if (loading) {
      loaderTimeout = setTimeout(() => setShowLoader(true), 300); // only show after 300ms
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(loaderTimeout);
  }, [loading]);

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
      </div>

      {showLoader && <p className="text-center">Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cocktails.map((cocktail) => (
          <div
            key={cocktail.id}
            className="border rounded-xl shadow p-4 text-center hover:scale-105 transition"
          >
            <img
              src={cocktail.strDrinkThumb}
              alt={cocktail.strDrink}
              className="w-full h-48 object-cover rounded"
            />
            <h3 className="text-lg font-bold mt-4">{cocktail.strDrink}</h3>
            <p className="text-sm text-gray-600">{cocktail.strCategory}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CocktailList;
