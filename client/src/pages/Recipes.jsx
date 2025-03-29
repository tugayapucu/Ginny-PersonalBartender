// src/pages/Recipes.jsx
import React from "react";
import CocktailList from "../components/CocktailList";

const Recipes = () => {
  return (
    <div className="pt-16">
      <h2 className="text-center text-4xl font-bold mb-8">Cocktail Recipes 🍸</h2>
      <CocktailList />
    </div>
  );
};

export default Recipes;
