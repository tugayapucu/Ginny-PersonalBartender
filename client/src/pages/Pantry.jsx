import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { getPantryRequest, addPantryItemRequest, removePantryItemRequest } from "../api";

const Pantry = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPantryRequest(token);
        setItems(res.data);
      } catch {
        setError("Failed to load pantry. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setError("");
    try {
      const res = await addPantryItemRequest(token, trimmed);
      setItems((prev) => [...prev, res.data]);
      setInput("");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Failed to add ingredient.");
    }
  };

  const handleRemove = async (ingredientKey, ingredientName) => {
    setError("");
    try {
      await removePantryItemRequest(token, ingredientKey);
      setItems((prev) => prev.filter((i) => i.ingredient_key !== ingredientKey));
    } catch {
      setError(`Failed to remove ${ingredientName}.`);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-center">My Pantry</h2>
        <p className="text-center text-gray-500 mb-8">
          Save the ingredients you have on hand — they'll be used to find cocktails you can make.
        </p>

        {/* Add form */}
        <form
          onSubmit={handleAdd}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-gray-200"
        >
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label
                htmlFor="pantry-ingredient-input"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Ingredient
              </label>
              <input
                id="pantry-ingredient-input"
                data-testid="pantry-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Tequila, Lime Juice…"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <button
              type="submit"
              data-testid="pantry-add-btn"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-5 rounded transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <p
            data-testid="pantry-error"
            className="text-red-500 text-center mb-4"
          >
            {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <p data-testid="pantry-loading" className="text-center text-gray-400">
            Loading your pantry…
          </p>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <p
            data-testid="pantry-empty"
            className="text-center text-gray-400 mt-4"
          >
            Your pantry is empty — add an ingredient above to get started.
          </p>
        )}

        {/* Ingredient list */}
        {!loading && items.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 divide-y divide-gray-100">
            <ul data-testid="pantry-list">
              {items.map((item) => (
                <li
                  key={item.id}
                  data-testid="pantry-item"
                  className="flex items-center justify-between px-6 py-3"
                >
                  <span className="text-gray-800 capitalize">{item.ingredient_name}</span>
                  <button
                    aria-label={`Remove ${item.ingredient_name} from pantry`}
                    data-testid="pantry-remove-btn"
                    onClick={() => handleRemove(item.ingredient_key, item.ingredient_name)}
                    className="text-red-400 hover:text-red-600 font-bold text-lg leading-none transition-colors"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pantry;
