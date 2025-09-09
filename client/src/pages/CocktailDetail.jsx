import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CocktailApi } from "../api";

const CocktailDetail = () => {
  const { id } = useParams();
  const [cocktail, setCocktail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCocktail = async () => {
      try {
        setLoading(true);
        // Use CocktailApi instead of direct axios
        const data = await CocktailApi.getCocktail(id);
        setCocktail(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCocktail();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading cocktail...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!cocktail) return <p className="text-center mt-10">Cocktail not found</p>;

  // Extract ingredients & measures
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ing = cocktail[`strIngredient${i}`];
    const measure = cocktail[`strMeasure${i}`];
    if (ing) ingredients.push(`${measure || ""} ${ing}`.trim());
  }

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-4">{cocktail.strDrink}</h2>
      <img
        src={cocktail.strDrinkThumb}
        alt={cocktail.strDrink}
        className="w-full max-w-sm mx-auto rounded mb-4"
      />
      <p className="text-gray-600 italic mb-2">{cocktail.strGlass}</p>
      <h4 className="font-bold mt-6 mb-2">Ingredients</h4>
      <ul className="list-disc list-inside mb-4 text-left">
        {ingredients.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <p className="text-left">
        {cocktail.strInstructions || "No instructions available."}
      </p>
    </div>
  );
};

export default CocktailDetail;
