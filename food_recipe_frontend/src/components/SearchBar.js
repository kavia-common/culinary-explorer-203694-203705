import React from "react";

// PUBLIC_INTERFACE
export function SearchBar({
  query,
  onQueryChange,
  tag,
  onTagChange,
  availableTags = [],
  onClear,
}) {
  return (
    <section className="search" aria-label="Search and filter recipes">
      <div className="search__row">
        <div className="field">
          <label className="label" htmlFor="recipe-search">
            Search
          </label>
          <input
            id="recipe-search"
            className="input"
            type="search"
            placeholder="Search recipes, tags, or keywords…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="recipe-tag">
            Filter by tag
          </label>
          <select
            id="recipe-tag"
            className="select"
            value={tag}
            onChange={(e) => onTagChange(e.target.value)}
          >
            <option value="">All</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="search__actions">
          <button className="btn btn-ghost" type="button" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
