import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, ShuffleIcon, HeartIcon } from "@phosphor-icons/react";
import { fetchCocktails, searchCocktails, getRandomCocktail } from "../api";
import useAuth from "../hooks/useAuth";
import useFavorites from "../hooks/useFavorites";
import { Stagger } from "../lib/motion";

const CocktailList = () => {
  const [cocktails, setCocktails] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [randomCocktail, setRandomCocktail] = useState(null);

  const navigate = useNavigate();
  const { token } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useFavorites(token);

  const toggleFavorite = (id) => {
    if (!token) {
      navigate("/login");
      return;
    }
    const isFav = favorites.map(String).includes(String(id));
    if (isFav) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setLoading(true);
      const fetchData = async () => {
        try {
          const res = query.trim()
            ? await searchCocktails(query)
            : await fetchCocktails();
          setCocktails(res.data.items);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setLoading(false);
          setHasLoaded(true);
        }
      };

      fetchData();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    let loaderTimeout;
    if (loading) {
      loaderTimeout = setTimeout(() => setShowLoader(true), 300);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(loaderTimeout);
  }, [loading]);

  const handleSurprise = async () => {
    try {
      const res = await getRandomCocktail();
      setRandomCocktail(res.data);
    } catch (err) {
      console.error("Failed to fetch random cocktail", err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5">
      <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search by cocktail name or ingredient"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-11"
          />
        </div>
        <button onClick={handleSurprise} className="btn-secondary whitespace-nowrap">
          <ShuffleIcon size={18} weight="bold" aria-hidden="true" />
          Surprise Me
        </button>
      </div>

      {randomCocktail && (
        <div className="card mx-auto mb-12 max-w-md p-6 text-center">
          <p className="eyebrow mb-3">Your pick</p>
          <h3 className="mb-4 text-2xl">{randomCocktail.name}</h3>
          <img
            src={randomCocktail.thumb_url}
            alt={randomCocktail.name}
            className="mx-auto aspect-square w-full max-w-xs rounded-xl object-cover"
          />
          <p className="mt-4 text-sm text-muted">
            {randomCocktail.category} — {randomCocktail.glass}
          </p>
          <Link
            to={`/cocktails/${randomCocktail.id}`}
            className="btn-primary mt-5"
          >
            View recipe
          </Link>
        </div>
      )}

      {(!hasLoaded || showLoader) && cocktails.length === 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden p-3">
              <div className="skeleton aspect-square w-full" />
              <div className="skeleton mt-4 h-4 w-3/4" />
              <div className="skeleton mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {cocktails.map((cocktail, i) => {
            const isFav = favorites.map(String).includes(String(cocktail.id));
            return (
              <Stagger index={i} key={cocktail.id}>
                <Link to={`/cocktails/${cocktail.id}`}>
                  <article
                    data-testid="cocktail-card"
                    className="card-interactive group relative h-full overflow-hidden p-3"
                  >
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
                    <p className="mt-1 text-sm text-muted">{cocktail.category}</p>

                    <button
                      aria-label={
                        isFav ? "Remove from favorites" : "Add to favorites"
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(cocktail.id);
                      }}
                      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-canvas/70 backdrop-blur transition hover:scale-110 active:scale-90"
                    >
                      <HeartIcon
                        size={18}
                        weight={isFav ? "fill" : "regular"}
                        className={isFav ? "text-danger" : "text-ink"}
                        aria-hidden="true"
                      />
                    </button>
                  </article>
                </Link>
              </Stagger>
            );
          })}
        </div>
      )}

      {hasLoaded && !showLoader && cocktails.length === 0 && (
        <p className="py-16 text-center text-muted">
          No cocktails found. Try a different name or ingredient.
        </p>
      )}
    </div>
  );
};

export default CocktailList;
