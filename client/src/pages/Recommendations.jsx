import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SparkleIcon } from "@phosphor-icons/react";
import { getRecommendationsRequest } from "../api";
import { Reveal, Stagger } from "../lib/motion";
import useAuth from "../hooks/useAuth";

const Recommendations = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRecommendationsRequest(token, 20);
        setItems(res.data);
      } catch {
        setError("Failed to load recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-10">
        <Reveal as="p" className="eyebrow mb-3">
          Picked for you
        </Reveal>
        <Reveal as="h1" delay={0.05} className="text-4xl md:text-5xl">
          Your recommendations
        </Reveal>
        <Reveal as="p" delay={0.1} className="mt-3 max-w-xl text-muted">
          Based on your pantry, favorites, and ratings — updated as you explore.
        </Reveal>
      </div>

      {loading && (
        <p className="py-20 text-center text-muted">Loading recommendations…</p>
      )}

      {error && (
        <div className="card mx-auto max-w-md p-10 text-center">
          <p className="mb-6 text-muted">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="card mx-auto max-w-md p-10 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
            <SparkleIcon
              size={30}
              weight="duotone"
              className="text-accent"
              aria-hidden="true"
            />
          </div>
          <h2 className="mb-2 text-2xl">Nothing to show yet.</h2>
          <p className="mb-6 text-muted">
            Save favorites, add pantry items, or rate cocktails to get
            personalized picks.
          </p>
          <Link to="/recipes" className="btn-primary">
            Browse recipes
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
          data-testid="recommendations-list"
        >
          {items.map((item, index) => (
            <Stagger index={index} key={item.id}>
              <article
                className="card-interactive group h-full overflow-hidden p-3"
                data-testid="recommendation-item"
              >
                <Link to={`/cocktails/${item.id}`}>
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={item.thumb_url}
                      alt={item.name}
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug">
                    {item.name}
                  </h3>
                  {item.category && (
                    <p className="mt-1 text-sm text-muted">{item.category}</p>
                  )}
                  {item.reasons.length > 0 && (
                    <ul className="mt-3 space-y-1" aria-label="Why we recommend this">
                      {item.reasons.map((reason) => (
                        <li
                          key={reason}
                          className="flex items-start gap-2 text-xs text-muted"
                        >
                          <SparkleIcon
                            size={12}
                            weight="fill"
                            className="mt-0.5 shrink-0 text-accent"
                            aria-hidden="true"
                          />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </Link>
              </article>
            </Stagger>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
