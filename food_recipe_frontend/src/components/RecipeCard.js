import React from "react";
import { Link } from "react-router-dom";

function TagPill({ label }) {
  return <span className="pill">{label}</span>;
}

// PUBLIC_INTERFACE
export function RecipeCard({ recipe }) {
  if (!recipe) return null;

  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

  return (
    <article className="card">
      <Link to={`/recipes/${encodeURIComponent(recipe.id)}`} className="card__link">
        <div className="card__media" aria-hidden="true">
          {recipe.imageUrl ? (
            <img className="card__img" src={recipe.imageUrl} alt="" />
          ) : (
            <div className="card__placeholder">
              <span className="card__placeholderText">Recipe</span>
            </div>
          )}
        </div>

        <div className="card__body">
          <h3 className="card__title">{recipe.title}</h3>
          {recipe.description ? (
            <p className="card__desc">{recipe.description}</p>
          ) : (
            <p className="card__desc muted">Ingredients + step-by-step instructions.</p>
          )}

          <div className="card__meta" aria-label="Recipe tags">
            {tags.slice(0, 3).map((t) => (
              <TagPill key={t} label={t} />
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
