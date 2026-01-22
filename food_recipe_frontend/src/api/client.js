const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Build a safe absolute URL to the backend.
 * The backend base is configured via REACT_APP_API_BASE (preferred) or REACT_APP_BACKEND_URL.
 */
function getApiBase() {
  return (
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Try multiple candidate paths until one responds successfully.
 * Returns the JSON body from the first success.
 */
async function tryGetJson(paths, { query = {}, signal } = {}) {
  const base = getApiBase();
  const qs = new URLSearchParams(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();

  let lastError = null;

  for (const path of paths) {
    const url = `${base}${path}${qs ? `?${qs}` : ""}`;
    try {
      const res = await fetchWithTimeout(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal,
      });

      if (!res.ok) {
        lastError = new Error(`GET ${url} failed (${res.status})`);
        continue;
      }
      return await res.json();
    } catch (e) {
      lastError = e;
      continue;
    }
  }

  throw lastError ?? new Error("Request failed");
}

/** Normalize backend-ish payload shapes into an array of recipes. */
function normalizeRecipeListPayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.recipes)) return payload.recipes;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

/** Normalize a recipe detail payload into a recipe object. */
function normalizeRecipeDetailPayload(payload) {
  if (!payload) return null;
  if (payload.recipe) return payload.recipe;
  return payload;
}

function normalizeRecipe(recipe) {
  if (!recipe || typeof recipe !== "object") return recipe;

  const ingredients =
    recipe.ingredients ??
    recipe.ingredient_list ??
    recipe.ingredientLines ??
    recipe.items ??
    [];

  const steps =
    recipe.steps ??
    recipe.instructions ??
    recipe.directions ??
    recipe.method ??
    [];

  return {
    ...recipe,
    id: recipe.id ?? recipe.recipe_id ?? recipe.slug ?? recipe.name,
    title: recipe.title ?? recipe.name ?? "Untitled recipe",
    description: recipe.description ?? recipe.summary ?? "",
    imageUrl: recipe.imageUrl ?? recipe.image_url ?? recipe.image ?? recipe.photo ?? "",
    tags: recipe.tags ?? recipe.categories ?? recipe.cuisines ?? [],
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    steps: Array.isArray(steps) ? steps : [],
  };
}

/**
 * A small built-in fallback dataset so the UI remains functional even if the backend
 * hasn't implemented recipe endpoints yet.
 */
const MOCK_RECIPES = [
  {
    id: "classic-avocado-toast",
    title: "Classic Avocado Toast",
    description: "Crispy toast topped with creamy avocado, lemon, and chili flakes.",
    tags: ["Quick", "Vegetarian"],
    ingredients: [
      "2 slices sourdough bread",
      "1 ripe avocado",
      "1 tsp lemon juice",
      "Pinch of salt",
      "Chili flakes (optional)",
      "Olive oil (optional)",
    ],
    steps: [
      "Toast the bread until golden and crisp.",
      "Mash avocado with lemon juice and salt.",
      "Spread avocado over toast and drizzle with olive oil if desired.",
      "Finish with chili flakes and serve immediately.",
    ],
  },
  {
    id: "one-pot-tomato-pasta",
    title: "One-Pot Tomato Basil Pasta",
    description: "A weeknight-friendly pasta with tomatoes, garlic, and basil.",
    tags: ["One-pot", "Comfort"],
    ingredients: [
      "200g spaghetti",
      "2 cups cherry tomatoes, halved",
      "2 cloves garlic, sliced",
      "2 tbsp olive oil",
      "2.5 cups water or stock",
      "Handful of basil",
      "Salt & pepper",
    ],
    steps: [
      "Add pasta, tomatoes, garlic, olive oil, and water/stock to a pot.",
      "Bring to a boil, then reduce to a simmer, stirring often.",
      "Cook until pasta is al dente and liquid reduces to a light sauce.",
      "Season, toss with basil, and serve.",
    ],
  },
];

function filterMock(recipes, { q, tag }) {
  const query = (q || "").trim().toLowerCase();
  const tagNorm = (tag || "").trim().toLowerCase();

  return recipes.filter((r) => {
    const matchesQuery =
      !query ||
      (r.title || "").toLowerCase().includes(query) ||
      (r.description || "").toLowerCase().includes(query) ||
      (r.tags || []).some((t) => (t || "").toLowerCase().includes(query));

    const matchesTag =
      !tagNorm || (r.tags || []).some((t) => (t || "").toLowerCase() === tagNorm);

    return matchesQuery && matchesTag;
  });
}

// PUBLIC_INTERFACE
export async function listRecipes({ q, tag } = {}, { signal } = {}) {
  /**
   * Backend endpoints are not yet defined in the current OpenAPI spec (only `/` health).
   * We probe common recipe list/search paths and fall back to mock data if not available.
   */
  const candidates = ["/recipes", "/api/recipes", "/v1/recipes", "/recipe", "/api/recipe"];

  try {
    const payload = await tryGetJson(candidates, { query: { q, search: q, tag }, signal });
    const list = normalizeRecipeListPayload(payload).map(normalizeRecipe);
    // If backend returns empty we still should show empty state (do not force mock).
    return list;
  } catch (e) {
    // Fallback for development/demo if backend isn't ready.
    return filterMock(MOCK_RECIPES, { q, tag }).map(normalizeRecipe);
  }
}

// PUBLIC_INTERFACE
export async function getRecipeById(id, { signal } = {}) {
  if (!id) throw new Error("Recipe id is required");

  const candidates = [
    `/recipes/${encodeURIComponent(id)}`,
    `/api/recipes/${encodeURIComponent(id)}`,
    `/v1/recipes/${encodeURIComponent(id)}`,
    `/recipe/${encodeURIComponent(id)}`,
    `/api/recipe/${encodeURIComponent(id)}`,
  ];

  try {
    const payload = await tryGetJson(candidates, { signal });
    const recipe = normalizeRecipeDetailPayload(payload);
    return normalizeRecipe(recipe);
  } catch (e) {
    const found = MOCK_RECIPES.find((r) => r.id === id);
    if (found) return normalizeRecipe(found);
    throw e;
  }
}
