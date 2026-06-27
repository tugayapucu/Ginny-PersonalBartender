import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { XIcon, HeartIcon } from "@phosphor-icons/react";
import useAuth from '../hooks/useAuth'
import useFavorites from '../hooks/useFavorites'
import { getAvailableCocktails } from "../api";
import { Reveal, Stagger } from "../lib/motion";

function AvailableCocktails() {
  const [input, setInput] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [cocktails, setCocktails] = useState([])

  const { token } = useAuth()
  const { favorites, addFavorite, removeFavorite } = useFavorites(token)

  const toggleFavorite = (cocktailId) => {
    const isFav = favorites.map(String).includes(String(cocktailId))
    if (isFav) {
      removeFavorite(cocktailId)
    } else {
      addFavorite(cocktailId)
    }
  }

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed])
      setInput('')
    }
  }

  const handleRemove = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing))
  }

  useEffect(() => {
    if (ingredients.length === 0) {
      setCocktails([])
      return
    }
    const fetchAvailableCocktails = async () => {
      try {
        const res = await getAvailableCocktails(ingredients)
        setCocktails(res.data)
      } catch (err) {
        console.error('Fetch failed:', err)
      }
    }
    fetchAvailableCocktails()
  }, [ingredients])

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="mb-8">
        <Reveal as="p" className="eyebrow mb-3">Your pantry, your drinks</Reveal>
        <Reveal as="h1" delay={0.05} className="text-4xl md:text-5xl">What can I make?</Reveal>
        <Reveal as="p" delay={0.1} className="mt-3 max-w-xl text-muted">
          Add the ingredients you have on hand and we'll find every cocktail you
          can make right now.
        </Reveal>
      </div>

      <div className="card p-5">
        <label htmlFor="available-input" className="field-label">
          Add an ingredient
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="available-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Tequila, Lime juice…"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="input flex-1"
          />
          <button onClick={handleAdd} className="btn-primary">
            Add
          </button>
          {ingredients.length > 0 && (
            <button onClick={() => setIngredients([])} className="btn-ghost">
              Clear all
            </button>
          )}
        </div>

        {ingredients.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {ingredients.map((ing, idx) => (
              <span key={idx} className="chip capitalize">
                {ing}
                <button
                  aria-label={`Remove ${ing}`}
                  onClick={() => handleRemove(ing)}
                  className="text-muted transition-colors hover:text-danger"
                >
                  <XIcon size={14} weight="bold" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        {ingredients.length === 0 ? (
          <p className="py-12 text-center text-muted">
            Add an ingredient above to get started.
          </p>
        ) : cocktails.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {cocktails.map((c, i) => {
              const isFav = favorites.map(String).includes(String(c.id))
              return (
                <Stagger index={i} key={c.id}>
                  <article className="card-interactive group relative h-full overflow-hidden p-3">
                    <Link to={`/cocktails/${c.id}`}>
                      <div className="overflow-hidden rounded-xl">
                        <img
                          src={c.thumb_url}
                          alt={c.name}
                          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <h3 className="mt-4 text-base font-semibold leading-snug">{c.name}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {c.category} · {c.alcoholic}
                      </p>
                    </Link>
                    <button
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      onClick={() => toggleFavorite(c.id)}
                      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-canvas/70 backdrop-blur transition hover:scale-110 active:scale-90"
                    >
                      <HeartIcon
                        size={18}
                        weight={isFav ? 'fill' : 'regular'}
                        className={isFav ? 'text-danger' : 'text-ink'}
                        aria-hidden="true"
                      />
                    </button>
                  </article>
                </Stagger>
              )
            })}
          </div>
        ) : (
          <p className="py-12 text-center text-muted">
            No cocktails match your ingredients. Try removing one or adding more.
          </p>
        )}
      </div>
    </div>
  )
}

export default AvailableCocktails
