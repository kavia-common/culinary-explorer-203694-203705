import React from "react";

// PUBLIC_INTERFACE
export function LoadingState({ title = "Loading…", description = "Fetching recipes." }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <div className="state__text">
        <h2 className="state__title">{title}</h2>
        <p className="state__desc">{description}</p>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function ErrorState({
  title = "Something went wrong",
  description = "Please try again.",
  onRetry,
}) {
  return (
    <div className="state state--error" role="alert" aria-live="assertive">
      <div className="state__text">
        <h2 className="state__title">{title}</h2>
        <p className="state__desc">{description}</p>
        {onRetry ? (
          <button className="btn btn-primary" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function EmptyState({
  title = "No recipes found",
  description = "Try a different search term or clear filters.",
  action,
}) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="state__text">
        <h2 className="state__title">{title}</h2>
        <p className="state__desc">{description}</p>
        {action ? <div className="state__actions">{action}</div> : null}
      </div>
    </div>
  );
}
