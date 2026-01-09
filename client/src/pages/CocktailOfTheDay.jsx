import React, { useEffect, useState } from "react";
import axios from "axios";
import { getRandomCocktail } from "../api";

const CocktailOfTheDay = () => {
  const [cocktail, setCocktail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCocktail = async () => {
    try {
      setLoading(true);
      setError("");
      const randomRes = await getRandomCocktail();
      const random = randomRes.data;
      if (!random || !random.id) {
        setError("No cocktail available.");
        return;
      }
      const detailRes = await axios.get(`http://127.0.0.1:8000/cocktails/${random.id}`);
      setCocktail(detailRes.data);
    } catch (err) {
      console.error("Failed to load cocktail of the day", err);
      setError("Failed to load cocktail of the day.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCocktail();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading cocktail of the day...</p>;
  }

  if (error) {
    return <p className="text-center mt-10">{error}</p>;
  }

  if (!cocktail) {
    return <p className="text-center mt-10">No cocktail available.</p>;
  }

  const ingredients = (cocktail.ingredients || []).map((item) => {
    const parts = [item.measure, item.ingredient].filter(Boolean);
    return parts.join(" ");
  });

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-2">Cocktail of the Day</h2>
      <p className="text-xl mb-4">{cocktail.name}</p>
      <img
        src={cocktail.thumb_url}
        alt={cocktail.name}
        className="w-full max-w-sm mx-auto rounded mb-4"
      />
      <p className="text-gray-600 italic mb-2">{cocktail.glass}</p>
      <h4 className="font-bold mt-6 mb-2">Ingredients</h4>
      <ul className="list-disc list-inside mb-4 text-left">
        {ingredients.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <p className="text-left">{cocktail.instructions || "No instructions available."}</p>
    </div>
  );
};

export default CocktailOfTheDay;
