import { useState, useEffect } from "react";
import { CocktailApi } from "../api";
import useFavorites from "../hooks/useFavorites";
import "./AvailableCocktails.css";

function AvailableCocktails() {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(false);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInput("");
    }
  };

  const handleRemove = (ing) => {
    setIngredients(ingredients.filter((i) => i !== ing));
  };

  const fetchAvailableCocktails = async () => {
    try {
      setLoading(true);
      const data = await CocktailApi.getAvailableCocktails(ingredients);
      setCocktails(data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ingredients.length > 0) {
      fetchAvailableCocktails();
    } else {
      setCocktails([]);
    }
  }, [ingredients]);

  return (
    <div className="available-cocktails">
      <h2>🍸 What Can I Make?</h2>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter an ingredient..."
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd}>Add</button>

        {ingredients.length > 0 && (
          <button onClick={() => setIngredients([])} className="clear-btn">
            Clear All
          </button>
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
              <img src={c.strDrinkThumb} alt={c.strDrink} />
              <h3>{c.strDrink}</h3>
              <p>
                {c.strCategory} | {c.strAlcoholic}
              </p>
              <p>
                <strong>Glass:</strong> {c.strGlass}
              </p>

              <button
                className="fav-btn"
                onClick={() => toggleFavorite(c.id)}
                title={
                  isFavorite(c.id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                {isFavorite(c.id) ? "❤️" : "🤍"}
              </button>
            </div>
          ))
        ) : (
          <p style={{ marginTop: "1rem", color: "#777" }}>
            No cocktails match your ingredients. Try removing one or adding
            more!
          </p>
        )}
      </div>
    </div>
  );
}

export default AvailableCocktails;
