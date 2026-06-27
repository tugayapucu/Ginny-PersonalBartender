import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion as Motion } from "motion/react";
import { ArrowLeftIcon, MartiniIcon } from "@phosphor-icons/react";
import { getCocktailById } from "../api";
import { Reveal } from "../lib/motion";

const CocktailDetail = () => {
  const { id } = useParams();
  const [cocktail, setCocktail] = useState(null);

  useEffect(() => {
    getCocktailById(id)
      .then((res) => setCocktail(res.data))
      .catch((err) => console.error("Failed to load cocktail", err));
  }, [id]);

  if (!cocktail) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="card overflow-hidden p-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="skeleton aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-2/3" />
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ingredients = (cocktail.ingredients || []).map((item) =>
    [item.measure, item.ingredient].filter(Boolean).join(" ")
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link
        to="/recipes"
        className="group mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeftIcon
          size={16}
          weight="bold"
          className="transition-transform duration-300 group-hover:-translate-x-1"
          aria-hidden="true"
        />
        Back to recipes
      </Link>

      <Reveal className="card overflow-hidden">
        <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
          <div className="overflow-hidden rounded-xl border border-line">
            <Motion.img
              src={cocktail.thumb_url}
              alt={cocktail.name}
              className="aspect-square w-full object-cover"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div>
            {cocktail.category && <p className="eyebrow mb-3">{cocktail.category}</p>}
            <h1 className="mb-3 text-4xl md:text-5xl">{cocktail.name}</h1>
            <div className="mb-6 flex flex-wrap gap-2">
              {cocktail.glass && (
                <span className="chip">
                  <MartiniIcon size={16} weight="duotone" className="text-accent" aria-hidden="true" />
                  {cocktail.glass}
                </span>
              )}
              {cocktail.alcoholic && <span className="chip">{cocktail.alcoholic}</span>}
            </div>

            <h2 className="mb-3 text-lg font-semibold uppercase tracking-wide text-muted">
              Ingredients
            </h2>
            <ul className="space-y-2">
              {ingredients.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 border-b border-line/60 pb-2">
                  <span className="ing-marker" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-line bg-raised/40 p-6 md:p-8">
          <h2 className="mb-3 text-lg font-semibold uppercase tracking-wide text-muted">
            Instructions
          </h2>
          <p className="leading-relaxed text-ink/90">
            {cocktail.instructions || "No instructions available."}
          </p>
        </div>
      </Reveal>
    </div>
  );
};

export default CocktailDetail;
