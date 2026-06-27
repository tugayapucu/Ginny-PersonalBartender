import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MartiniIcon, XIcon } from "@phosphor-icons/react";
import useAuth from '../hooks/useAuth'
import useFavorites from '../hooks/useFavorites'
import { getFavoriteCocktailsRequest } from "../api";
import { Reveal, Stagger } from "../lib/motion";

const Favorites = () => {
  const [cocktails, setCocktails] = useState([])
  const { token } = useAuth()
  const { favorites, removeFavorite } = useFavorites(token)

  useEffect(() => {
    const fetchFavs = async () => {
      if (favorites.length === 0) {
        setCocktails([])
        return
      }
      try {
        const res = await getFavoriteCocktailsRequest(token)
        setCocktails(res.data)
      } catch (err) {
        console.error('Failed to load favorite cocktails', err)
      }
    }

    fetchFavs()
  }, [favorites, token])

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-10">
        <Reveal as="p" className="eyebrow mb-3">Your collection</Reveal>
        <Reveal as="h1" delay={0.05} className="text-4xl md:text-5xl">Favorite cocktails</Reveal>
      </div>

      {cocktails.length === 0 ? (
        <div className="card mx-auto max-w-md p-10 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
            <MartiniIcon size={30} weight="duotone" className="text-accent" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-2xl">No favorites yet.</h2>
          <p className="mb-6 text-muted">
            Tap the heart on any cocktail to save it here for later.
          </p>
          <Link to="/recipes" className="btn-primary">
            Browse recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {cocktails.map((cocktail, i) => (
            <Stagger index={i} key={cocktail.id}>
              <article
                data-testid="favorite-card"
                className="card-interactive group relative h-full overflow-hidden p-3"
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
                </Link>
                <button
                  aria-label="Remove from favorites"
                  onClick={() => removeFavorite(cocktail.id)}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-canvas/70 text-danger backdrop-blur transition hover:scale-110 active:scale-90"
                >
                  <XIcon size={15} weight="bold" aria-hidden="true" />
                </button>
              </article>
            </Stagger>
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
