import { useState, useEffect } from 'react'
import axios from 'axios'
import './AvailableCocktails.css';


function AvailableCocktails() {
  const [input, setInput] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [cocktails, setCocktails] = useState([])


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
      const query = ingredients.join(',')
      const res = await axios.get(`http://127.0.0.1:8000/available?has=${query}`)
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
              <img src={c.strDrinkThumb} alt={c.strDrink} />
              <h3>{c.strDrink}</h3>
              <p>{c.strCategory} | {c.strAlcoholic}</p>
              <p><strong>Glass:</strong> {c.strGlass}</p>
            </div>
          ))
        ) : (
          <p>No cocktails found for your ingredients.</p>
        )}
      </div>
    </div>
  )
}

export default AvailableCocktails
