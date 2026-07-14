import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion as Motion } from "motion/react";
import { ArrowLeftIcon, MartiniIcon, StarIcon, TrashIcon } from "@phosphor-icons/react";
import { getCocktailById, getMyNoteRequest, upsertMyNoteRequest, deleteMyNoteRequest } from "../api";
import { Reveal } from "../lib/motion";
import useAuth from "../hooks/useAuth";

const STARS = [1, 2, 3, 4, 5];

const CocktailDetail = () => {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();
  const [cocktail, setCocktail] = useState(null);

  // Note state
  const [savedNote, setSavedNote] = useState(null); // null = not yet loaded / doesn't exist
  const [hoverRating, setHoverRating] = useState(0);
  const [draftRating, setDraftRating] = useState(0);
  const [draftText, setDraftText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState("");

  useEffect(() => {
    getCocktailById(id)
      .then((res) => setCocktail(res.data))
      .catch((err) => console.error("Failed to load cocktail", err));
  }, [id]);

  const loadNote = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const res = await getMyNoteRequest(token, id);
      setSavedNote(res.data);
      setDraftRating(res.data.rating ?? 0);
      setDraftText(res.data.notes ?? "");
    } catch {
      // 404 = no note yet; treat as empty form
      setSavedNote(null);
      setDraftRating(0);
      setDraftText("");
    }
  }, [isAuthenticated, token, id]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleSave = async () => {
    setNoteError("");
    setNoteSaving(true);
    try {
      const payload = {
        rating: draftRating || null,
        notes: draftText.trim() || null,
      };
      const res = await upsertMyNoteRequest(token, id, payload);
      setSavedNote(res.data);
    } catch {
      setNoteError("Failed to save note. Please try again.");
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDelete = async () => {
    setNoteError("");
    setNoteSaving(true);
    try {
      await deleteMyNoteRequest(token, id);
      setSavedNote(null);
      setDraftRating(0);
      setDraftText("");
    } catch {
      setNoteError("Failed to delete note. Please try again.");
    } finally {
      setNoteSaving(false);
    }
  };

  if (!cocktail) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="card overflow-hidden p-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="skeleton aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-2/3" />
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ingredients = (cocktail.ingredients || []).map((item) =>
    [item.measure, item.ingredient].filter(Boolean).join(" ")
  );

  const isDirty =
    draftRating !== (savedNote?.rating ?? 0) ||
    draftText !== (savedNote?.notes ?? "");

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link
        to="/recipes"
        className="group mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeftIcon
          size={16}
          weight="bold"
          className="transition-transform duration-300 group-hover:-translate-x-1"
          aria-hidden="true"
        />
        Back to recipes
      </Link>

      <Reveal className="card overflow-hidden">
        <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
          <div className="overflow-hidden rounded-xl border border-line">
            <Motion.img
              src={cocktail.thumb_url}
              alt={cocktail.name}
              className="aspect-square w-full object-cover"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div>
            {cocktail.category && <p className="eyebrow mb-3">{cocktail.category}</p>}
            <h1 className="mb-3 text-4xl md:text-5xl">{cocktail.name}</h1>
            <div className="mb-6 flex flex-wrap gap-2">
              {cocktail.glass && (
                <span className="chip">
                  <MartiniIcon size={16} weight="duotone" className="text-accent" aria-hidden="true" />
                  {cocktail.glass}
                </span>
              )}
              {cocktail.alcoholic && <span className="chip">{cocktail.alcoholic}</span>}
            </div>

            <h2 className="mb-3 text-lg font-semibold uppercase tracking-wide text-muted">
              Ingredients
            </h2>
            <ul className="space-y-2">
              {ingredients.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 border-b border-line/60 pb-2">
                  <span className="ing-marker" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-line bg-raised/40 p-6 md:p-8">
          <h2 className="mb-3 text-lg font-semibold uppercase tracking-wide text-muted">
            Instructions
          </h2>
          <p className="leading-relaxed text-ink/90">
            {cocktail.instructions || "No instructions available."}
          </p>
        </div>
      </Reveal>

      {/* Tasting Notes */}
      <Reveal delay={0.15} className="card mt-6 p-6 md:p-8">
        <p className="eyebrow mb-3">Your review</p>
        <h2 className="mb-5 text-2xl font-semibold">Rate &amp; take notes</h2>

        {!isAuthenticated ? (
          <p className="text-muted">
            <Link to="/login" className="text-accent underline underline-offset-2 hover:opacity-80">
              Sign in
            </Link>{" "}
            to rate this cocktail and save your tasting notes.
          </p>
        ) : (
          <div className="space-y-5">
            {/* Star rating */}
            <div>
              <p className="mb-2 text-sm font-medium text-muted">Rating</p>
              <div
                className="flex gap-1"
                onMouseLeave={() => setHoverRating(0)}
                data-testid="star-rating"
              >
                {STARS.map((star) => {
                  const active = (hoverRating || draftRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`Rate ${star} out of 5`}
                      onClick={() => setDraftRating(star === draftRating ? 0 : star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="transition-transform duration-100 hover:scale-110 active:scale-95"
                    >
                      <StarIcon
                        size={28}
                        weight={active ? "fill" : "regular"}
                        className={active ? "text-accent" : "text-muted"}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes textarea */}
            <div>
              <label htmlFor="tasting-notes" className="field-label">
                Tasting notes
              </label>
              <textarea
                id="tasting-notes"
                data-testid="tasting-notes"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="How did it taste? Would you make it again?"
                rows={4}
                className="input w-full resize-none"
              />
            </div>

            {noteError && <p className="text-sm text-danger">{noteError}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={noteSaving || !isDirty}
                className="btn-primary disabled:opacity-50"
              >
                {noteSaving ? "Saving…" : savedNote ? "Update note" : "Save note"}
              </button>
              {savedNote && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={noteSaving}
                  className="btn-ghost flex items-center gap-2 text-danger hover:text-danger disabled:opacity-50"
                  data-testid="delete-note-btn"
                >
                  <TrashIcon size={16} aria-hidden="true" />
                  Delete note
                </button>
              )}
            </div>
          </div>
        )}
      </Reveal>
    </div>
  );
};

export default CocktailDetail;
