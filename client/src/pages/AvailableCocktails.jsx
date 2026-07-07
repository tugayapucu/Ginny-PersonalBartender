import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import useFavorites from '../hooks/useFavorites'
import { getAvailableCocktails, getSuggestionsRequest } from "../api";
import './AvailableCocktails.css';

function AvailableCocktails() {
  const [input, setInput] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [cocktails, setCocktails] = useState([])
  const [suggestions, setSuggestions] = useState([])

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
      setSuggestions([])
      return
    }
    const fetchData = async () => {
      try {
        const [availRes, sugRes] = await Promise.all([
          getAvailableCocktails(ingredients),
          getSuggestionsRequest(ingredients),
        ])
        setCocktails(availRes.data)
        setSuggestions(sugRes.data.items || [])
      } catch (err) {
        console.error('Fetch failed:', err)
      }
    }
    fetchData()
  }, [ingredients])

  return (
    <div className="available-cocktails">
      <h2>🍸 What Can I Make?</h2>
      <div>
        <label htmlFor="ingredient-input" className="sr-only">Add an ingredient</label>
        <input
          id="ingredient-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter an ingredient..."
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          data-testid="available-input"
        />
        <button onClick={handleAdd} data-testid="available-add-btn">Add</button>

        {ingredients.length > 0 && (
          <button onClick={() => setIngredients([])} className="clear-btn">Clear All</button>
        )}
      </div>

      <div className="ingredients-list" data-testid="ingredients-list">
        {ingredients.map((ing, idx) => (
          <span key={idx}>
            {ing}{' '}
            <button
              onClick={() => handleRemove(ing)}
              aria-label={`Remove ${ing}`}
            >
              ❌
            </button>
          </span>
        ))}
      </div>

      {/* Exact matches */}
      <div className="cocktail-results" data-testid="available-results">
        {cocktails.length > 0 ? (
          cocktails.map((c) => (
            <div key={c.id} className="cocktail-card" data-testid="available-item">
              <img src={c.thumb_url} alt={c.name} />
              <h3>{c.name}</h3>
              <p>{c.category} | {c.alcoholic}</p>
              <p><strong>Glass:</strong> {c.glass}</p>
              <button
                className="fav-btn"
                onClick={() => toggleFavorite(c.id)}
                aria-label={favorites.map(String).includes(String(c.id)) ? `Remove ${c.name} from favorites` : `Add ${c.name} to favorites`}
              >
                {favorites.map(String).includes(String(c.id)) ? '❤️' : '🤍'}
              </button>
            </div>
          ))
        ) : (
          <p style={{ marginTop: '1rem', color: '#777' }} data-testid="available-empty">
            {ingredients.length === 0
              ? 'Add ingredients above to see what you can make.'
              : 'No cocktails match all your ingredients exactly.'}
          </p>
        )}
      </div>

      {/* Almost there suggestions */}
      <section className="suggestions-section" data-testid="suggestions-section">
        <h3>Almost there...</h3>
        {suggestions.length > 0 ? (
          <div data-testid="suggestions-list">
            {suggestions.map((s) => (
              <div key={s.id} className="cocktail-card suggestion-card" data-testid="suggestion-item">
                <img src={s.thumb_url} alt={s.name} />
                <h3>{s.name}</h3>
                <p className="match-info">{Math.round(s.match_percentage * 100)}% match</p>
                <div>
                  <strong>Missing:</strong>
                  <ul>
                    {s.missing_ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#777' }} data-testid="suggestions-empty">
            {ingredients.length === 0
              ? 'Add ingredients above to see what you\'re close to making.'
              : 'No close matches found. Try adding more ingredients.'}
          </p>
        )}
      </section>
    </div>
  )
}

export default AvailableCocktails
