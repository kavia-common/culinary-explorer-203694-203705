import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRecipeById } from "../api/client";
import { ErrorState, LoadingState } from "../components/States";

function normalizeIngredient(i) {
  if (typeof i === "string") return i;
  if (!i || typeof i !== "object") return String(i ?? "");
  // common shapes
  return i.text ?? i.name ?? i.ingredient ?? JSON.stringify(i);
}

function normalizeStep(s) {
  if (typeof s === "string") return s;
  if (!s || typeof s !== "object") return String(s ?? "");
  return s.text ?? s.step ?? s.instruction ?? JSON.stringify(s);
}

// PUBLIC_INTERFACE
export function RecipeDetailPage() {
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await getRecipeById(id, { signal: controller.signal });
        if (!mounted) return;
        setRecipe(data);
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e?.message || "Failed to load recipe.");
        setRecipe(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [id]);

  const ingredients = useMemo(
    () => (recipe?.ingredients || []).map(normalizeIngredient).filter(Boolean),
    [recipe]
  );
  const steps = useMemo(() => (recipe?.steps || []).map(normalizeStep).filter(Boolean), [recipe]);

  if (loading) {
    return (
      <div className="page">
        <LoadingState title="Loading recipe…" description="Fetching ingredients and instructions." />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="page">
        <ErrorState
          title="Unable to load recipe"
          description={errorMsg}
          onRetry={() => window.location.reload()}
        />
        <div className="mt-16">
          <Link className="btn btn-ghost" to="/">
            ← Back to recipes
          </Link>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="page">
        <ErrorState
          title="Recipe not found"
          description="This recipe may have been removed."
        />
        <div className="mt-16">
          <Link className="btn btn-ghost" to="/">
            ← Back to recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="detailHeader">
        <div className="detailHeader__top">
          <Link className="btn btn-ghost" to="/">
            ← Back
          </Link>
        </div>

        <div className="detailHeader__main">
          <div className="detailHeader__media" aria-hidden="true">
            {recipe.imageUrl ? (
              <img className="detailHeader__img" src={recipe.imageUrl} alt="" />
            ) : (
              <div className="detailHeader__placeholder">
                <span className="detailHeader__placeholderText">Recipe</span>
              </div>
            )}
          </div>

          <div className="detailHeader__info">
            <h1 className="h1">{recipe.title}</h1>
            {recipe.description ? <p className="lead">{recipe.description}</p> : null}

            <div className="detailHeader__tags" aria-label="Tags">
              {(recipe.tags || []).slice(0, 6).map((t) => (
                <span key={t} className="pill pill--success">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="detailGrid">
        <section className="panel" aria-label="Ingredients">
          <h2 className="h2">Ingredients</h2>
          {ingredients.length === 0 ? (
            <p className="muted">No ingredients listed.</p>
          ) : (
            <ul className="list">
              {ingredients.map((ing, idx) => (
                <li key={`${ing}-${idx}`} className="list__item">
                  {ing}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-label="Preparation steps">
          <h2 className="h2">Steps</h2>
          {steps.length === 0 ? (
            <p className="muted">No steps provided.</p>
          ) : (
            <ol className="steps">
              {steps.map((s, idx) => (
                <li key={`${idx}-${s}`} className="steps__item">
                  <div className="steps__index" aria-hidden="true">
                    {idx + 1}
                  </div>
                  <div className="steps__text">{s}</div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
