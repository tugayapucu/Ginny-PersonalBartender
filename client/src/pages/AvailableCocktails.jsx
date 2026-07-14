import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartIcon, XIcon } from "@phosphor-icons/react";
import {
  getAvailableCocktails,
  getSuggestionsRequest,
} from "../api";
import useAuth from "../hooks/useAuth";
import useFavorites from "../hooks/useFavorites";
import { Reveal, Stagger } from "../lib/motion";

function AvailableCocktails() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [cocktails, setCocktails] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const { token } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useFavorites(token);

  const toggleFavorite = (cocktailId) => {
    const isFavorite = favorites.map(String).includes(String(cocktailId));
    if (isFavorite) {
      removeFavorite(cocktailId);
    } else {
      addFavorite(cocktailId);
    }
  };

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((current) => [...current, trimmed]);
      setInput("");
    }
  };

  const handleRemove = (ingredient) => {
    setIngredients((current) =>
      current.filter((item) => item !== ingredient)
    );
  };

  useEffect(() => {
    if (ingredients.length === 0) {
      setCocktails([]);
      setSuggestions([]);
      return;
    }

    const fetchData = async () => {
      try {
        const [availableResponse, suggestionsResponse] = await Promise.all([
          getAvailableCocktails(ingredients),
          getSuggestionsRequest(ingredients),
        ]);
        setCocktails(availableResponse.data);
        setSuggestions(suggestionsResponse.data.items || []);
      } catch (error) {
        console.error("Failed to load available cocktails", error);
      }
    };

    fetchData();
  }, [ingredients]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="mb-8">
        <Reveal as="p" className="eyebrow mb-3">
          Your pantry, your drinks
        </Reveal>
        <Reveal as="h1" delay={0.05} className="text-4xl md:text-5xl">
          What can I make?
        </Reveal>
        <Reveal as="p" delay={0.1} className="mt-3 max-w-xl text-muted">
          Add the ingredients you have on hand and we&apos;ll find every
          cocktail you can make right now.
        </Reveal>
      </div>

      <div className="card p-5">
        <label htmlFor="available-input" className="field-label">
          Add an ingredient
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="available-input"
            data-testid="available-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="e.g. Tequila, Lime juice…"
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            className="input flex-1"
          />
          <button
            type="button"
            onClick={handleAdd}
            data-testid="available-add-btn"
            className="btn-primary"
          >
            Add
          </button>
          {ingredients.length > 0 && (
            <button
              type="button"
              onClick={() => setIngredients([])}
              className="btn-ghost"
            >
              Clear all
            </button>
          )}
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          data-testid="ingredients-list"
        >
          {ingredients.map((ingredient) => (
            <span key={ingredient} className="chip capitalize">
              {ingredient}
              <button
                type="button"
                aria-label={`Remove ${ingredient}`}
                onClick={() => handleRemove(ingredient)}
                className="text-muted transition-colors hover:text-danger"
              >
                <XIcon size={14} weight="bold" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <section className="mt-8" data-testid="available-results">
        {ingredients.length === 0 ? (
          <p
            className="py-12 text-center text-muted"
            data-testid="available-empty"
          >
            Add ingredients above to see what you can make.
          </p>
        ) : cocktails.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {cocktails.map((cocktail, index) => {
              const isFavorite = favorites
                .map(String)
                .includes(String(cocktail.id));

              return (
                <Stagger index={index} key={cocktail.id}>
                  <article
                    className="card-interactive group relative h-full overflow-hidden p-3"
                    data-testid="available-item"
                  >
                    <Link to={`/cocktails/${cocktail.id}`}>
                      <div className="overflow-hidden rounded-xl">
                        <img
                          src={cocktail.thumb_url}
                          alt={cocktail.name}
                          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <h3 className="mt-4 text-base font-semibold leading-snug">
                        {cocktail.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {cocktail.category} · {cocktail.alcoholic}
                      </p>
                      {cocktail.glass && (
                        <p className="mt-1 text-xs text-muted">
                          {cocktail.glass}
                        </p>
                      )}
                    </Link>
                    <button
                      type="button"
                      aria-label={
                        isFavorite
                          ? `Remove ${cocktail.name} from favorites`
                          : `Add ${cocktail.name} to favorites`
                      }
                      onClick={() => toggleFavorite(cocktail.id)}
                      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-canvas/70 backdrop-blur transition hover:scale-110 active:scale-90"
                    >
                      <HeartIcon
                        size={18}
                        weight={isFavorite ? "fill" : "regular"}
                        className={isFavorite ? "text-danger" : "text-ink"}
                        aria-hidden="true"
                      />
                    </button>
                  </article>
                </Stagger>
              );
            })}
          </div>
        ) : (
          <p
            className="py-12 text-center text-muted"
            data-testid="available-empty"
          >
            No cocktails match all your ingredients exactly.
          </p>
        )}
      </section>

      <section className="mt-16" data-testid="suggestions-section">
        <Reveal as="p" className="eyebrow mb-3">
          Nearly ready
        </Reveal>
        <Reveal as="h2" delay={0.05} className="text-3xl md:text-4xl">
          Almost there...
        </Reveal>
        <Reveal as="p" delay={0.1} className="mt-3 max-w-xl text-muted">
          These cocktails only need a few more ingredients.
        </Reveal>

        {suggestions.length > 0 ? (
          <div
            className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
            data-testid="suggestions-list"
          >
            {suggestions.map((suggestion, index) => (
              <Stagger index={index} key={suggestion.id}>
                <article
                  className="card-interactive group h-full overflow-hidden p-3"
                  data-testid="suggestion-item"
                >
                  <Link to={`/cocktails/${suggestion.id}`}>
                    <div className="overflow-hidden rounded-xl">
                      <img
                        src={suggestion.thumb_url}
                        alt={suggestion.name}
                        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="mt-4 text-base font-semibold leading-snug">
                      {suggestion.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-accent">
                      {Math.round(suggestion.match_percentage * 100)}% match
                    </p>
                    <div className="mt-3 text-sm text-muted">
                      <span className="font-medium text-ink">Missing:</span>
                      <ul className="mt-1 space-y-1">
                        {suggestion.missing_ingredients.map((ingredient) => (
                          <li key={ingredient} className="capitalize">
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                </article>
              </Stagger>
            ))}
          </div>
        ) : (
          <p
            className="py-12 text-center text-muted"
            data-testid="suggestions-empty"
          >
            {ingredients.length === 0
              ? "Add ingredients above to see what you’re close to making."
              : "No close matches found. Try adding more ingredients."}
          </p>
        )}
      </section>
    </div>
  );
}

export default AvailableCocktails;
