import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import useAuth from "../hooks/useAuth";
import { getPantryRequest, addPantryItemRequest, removePantryItemRequest } from "../api";
import { Reveal } from "../lib/motion";

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
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8">
        <Reveal as="p" className="eyebrow mb-3">Your ingredients</Reveal>
        <Reveal as="h1" delay={0.05} className="text-4xl md:text-5xl">My Pantry</Reveal>
        <Reveal as="p" delay={0.1} className="mt-3 text-muted">
          Save the ingredients you have on hand — they'll be used to find
          cocktails you can make.
        </Reveal>
      </div>

      <form onSubmit={handleAdd} className="card p-6">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="pantry-ingredient-input" className="field-label">
              Ingredient
            </label>
            <input
              id="pantry-ingredient-input"
              data-testid="pantry-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Tequila, Lime juice…"
              className="input"
            />
          </div>
          <button
            type="submit"
            data-testid="pantry-add-btn"
            className="btn-primary"
          >
            Add
          </button>
        </div>
      </form>

      {error && (
        <p
          data-testid="pantry-error"
          className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-2.5 text-center text-sm text-danger"
        >
          {error}
        </p>
      )}

      {loading && (
        <p data-testid="pantry-loading" className="mt-6 text-center text-muted">
          Loading your pantry…
        </p>
      )}

      {!loading && items.length === 0 && (
        <p
          data-testid="pantry-empty"
          className="mt-6 text-center text-muted"
        >
          Your pantry is empty — add an ingredient above to get started.
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="card mt-6 divide-y divide-line">
          <ul data-testid="pantry-list">
            {items.map((item) => (
              <li
                key={item.id}
                data-testid="pantry-item"
                className="flex items-center justify-between px-6 py-3.5"
              >
                <span className="capitalize">{item.ingredient_name}</span>
                <button
                  aria-label={`Remove ${item.ingredient_name} from pantry`}
                  data-testid="pantry-remove-btn"
                  onClick={() => handleRemove(item.ingredient_key, item.ingredient_name)}
                  className="leading-none text-muted transition-colors hover:text-danger"
                >
                  <XIcon size={16} weight="bold" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Pantry;
