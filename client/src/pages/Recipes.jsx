// src/pages/Recipes.jsx
import React from "react";
import { Link } from "react-router-dom";
import CocktailList from "../components/CocktailList";

const Recipes = () => {
  return (
    <div className="pt-16">
      <div className="flex justify-between items-center px-6 mb-4 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold">Cocktail Recipes 🍸</h2>
        <Link
          to="/favorites"
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition"
        >
          ❤️ View Favorites
        </Link>
      </div>

      <CocktailList />
    </div>
  );
};

export default Recipes;
