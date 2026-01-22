import React, { useEffect, useMemo, useState } from "react";
import { listRecipes } from "../api/client";
import { RecipeCard } from "../components/RecipeCard";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { SearchBar } from "../components/SearchBar";

function uniqueTags(recipes) {
  const set = new Set();
  (recipes || []).forEach((r) => {
    (r.tags || []).forEach((t) => {
      if (t) set.add(t);
    });
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

// PUBLIC_INTERFACE
export function RecipesPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");

  const debouncedQuery = useDebouncedValue(query, 250);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const tags = useMemo(() => uniqueTags(recipes), [recipes]);

  const load = async ({ q, t } = {}) => {
    setLoading(true);
    setErrorMsg("");

    const controller = new AbortController();

    try {
      const data = await listRecipes({ q, tag: t }, { signal: controller.signal });
      setRecipes(data);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load recipes.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  useEffect(() => {
    load({ q: debouncedQuery, t: tag });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, tag]);

  const onClear = () => {
    setQuery("");
    setTag("");
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="h1">Browse recipes</h1>
          <p className="lead">
            Search and filter dishes, then open any recipe for ingredients and step-by-step instructions.
          </p>
        </div>
      </header>

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        tag={tag}
        onTagChange={setTag}
        availableTags={tags}
        onClear={onClear}
      />

      {loading ? (
        <LoadingState title="Loading recipes…" description="Please wait while we fetch the latest recipes." />
      ) : errorMsg ? (
        <ErrorState
          title="Unable to load recipes"
          description={errorMsg}
          onRetry={() => load({ q: debouncedQuery, t: tag })}
        />
      ) : recipes.length === 0 ? (
        <EmptyState
          title="No recipes match your search"
          description="Try a different keyword or clear filters."
          action={
            <button className="btn btn-primary" onClick={onClear}>
              Clear filters
            </button>
          }
        />
      ) : (
        <section className="grid" aria-label="Recipe results">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </section>
      )}
    </div>
  );
}
