// src/pages/Recipes.jsx
import React from "react";
import { Link } from "react-router-dom";
import { HeartIcon } from "@phosphor-icons/react";
import CocktailList from "../components/CocktailList";
import { Reveal } from "../lib/motion";

const Recipes = () => {
  return (
    <div className="py-12">
      <div className="mx-auto mb-10 flex max-w-6xl flex-col gap-4 px-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Reveal as="p" className="eyebrow mb-3">Browse the bar</Reveal>
          <Reveal as="h1" delay={0.05} className="text-4xl md:text-5xl">Cocktail recipes</Reveal>
        </div>
        <Link to="/favorites" className="btn-secondary self-start sm:self-auto">
          <HeartIcon size={18} weight="fill" className="text-danger" aria-hidden="true" />
          View favorites
        </Link>
      </div>

      <CocktailList />
    </div>
  );
};

export default Recipes;
