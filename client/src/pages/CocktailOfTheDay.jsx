import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "motion/react";
import { MartiniIcon } from "@phosphor-icons/react";
import { getCocktailById, getRandomCocktail } from "../api";
import { Reveal } from "../lib/motion";

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
      const detailRes = await getCocktailById(random.id);
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
    return (
      <p className="py-20 text-center text-muted">Loading cocktail of the day…</p>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="mb-6 text-muted">{error}</p>
        <button onClick={loadCocktail} className="btn-primary">
          Try again
        </button>
      </div>
    );
  }

  if (!cocktail) {
    return <p className="py-20 text-center text-muted">No cocktail available.</p>;
  }

  const ingredients = (cocktail.ingredients || []).map((item) =>
    [item.measure, item.ingredient].filter(Boolean).join(" ")
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="mb-8 text-center">
        <Reveal as="p" className="eyebrow mb-3">Cocktail of the day</Reveal>
        <Reveal as="h1" delay={0.05} className="text-4xl md:text-5xl">{cocktail.name}</Reveal>
      </div>

      <Reveal delay={0.1} className="card overflow-hidden">
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

      <div className="mt-8 text-center">
        <Link to="/recipes" className="btn-secondary">
          Browse more recipes
        </Link>
      </div>
    </div>
  );
};

export default CocktailOfTheDay;
