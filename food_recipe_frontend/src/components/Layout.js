import React from "react";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
export function Layout({ children }) {
  /** App shell: top navigation + content container. */
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="brand" aria-label="Culinary Explorer home">
            <span className="brand__mark" aria-hidden="true">
              CE
            </span>
            <span className="brand__text">
              Culinary <span className="brand__accent">Explorer</span>
            </span>
          </Link>

          <nav className="topbar__nav" aria-label="Primary navigation">
            <a
              className="navlink"
              href={(process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE || "") + "/docs"}
              target="_blank"
              rel="noreferrer"
            >
              API Docs
            </a>
          </nav>
        </div>
      </header>

      <main className="container content" id="main">
        {children}
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="muted">
            Data via backend REST API (fallback demo data if unavailable).
          </span>
        </div>
      </footer>
    </div>
  );
}
