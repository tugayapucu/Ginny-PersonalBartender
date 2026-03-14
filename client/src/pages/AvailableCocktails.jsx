import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import useFavorites from '../hooks/useFavorites'
import { getAvailableCocktails } from "../api";
import './AvailableCocktails.css';

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

  const fetchAvailableCocktails = async () => {
    try {
      const res = await getAvailableCocktails(ingredients)
      setCocktails(res.data)
    } catch (err) {
      console.error('Fetch failed:', err)
    }
  }

  useEffect(() => {
    if (ingredients.length > 0) {
      fetchAvailableCocktails()
    } else {
      setCocktails([])
    }
  }, [ingredients])

  return (
    <div className="available-cocktails">
      <h2>🍸 What Can I Make?</h2>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter an ingredient..."
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd}>Add</button>

        {ingredients.length > 0 && (
          <button onClick={() => setIngredients([])} className="clear-btn">Clear All</button>
        )}
      </div>

      <div className="ingredients-list">
        {ingredients.map((ing, idx) => (
          <span key={idx}>
            {ing} <button onClick={() => handleRemove(ing)}>❌</button>
          </span>
        ))}
      </div>

      <div className="cocktail-results">
        {cocktails.length > 0 ? (
          cocktails.map((c) => (
            <div key={c.id} className="cocktail-card">
              <img src={c.thumb_url} alt={c.name} />
              <h3>{c.name}</h3>
              <p>{c.category} | {c.alcoholic}</p>
              <p><strong>Glass:</strong> {c.glass}</p>

              {/* ✅ Favorite button */}
              <button
                className="fav-btn"
                onClick={() => toggleFavorite(c.id)}
                title={favorites.map(String).includes(String(c.id)) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.map(String).includes(String(c.id)) ? '❤️' : '🤍'}
              </button>
            </div>
          ))
        ) : (
          <p style={{ marginTop: '1rem', color: '#777' }}>
            No cocktails match your ingredients. Try removing one or adding more!
          </p>
        )}
      </div>
    </div>
  )
}

export default AvailableCocktails
