import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CocktailDetail = () => {
  const { id } = useParams();
  const [cocktail, setCocktail] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/cocktails/${id}`)
      .then((res) => setCocktail(res.data))
      .catch((err) => console.error("Failed to load cocktail", err));
  }, [id]);

  if (!cocktail) return <p className="text-center mt-10">Loading cocktail...</p>;

  const ingredients = (cocktail.ingredients || []).map((item) => {
    const parts = [item.measure, item.ingredient].filter(Boolean);
    return parts.join(" ");
  });

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-4">{cocktail.name}</h2>
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

export default CocktailDetail;
