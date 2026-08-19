# Ginny — Personal Bartender

[![CI](https://github.com/tugayapucu/PersonalBartender/actions/workflows/ci.yml/badge.svg)](https://github.com/tugayapucu/PersonalBartender/actions/workflows/ci.yml)

A cocktail discovery web app with user accounts, search, favourites, pantry management, tasting notes, and personalized recommendations.
Built as a full-stack portfolio project to demonstrate a production-shaped backend (FastAPI, JWT auth, Alembic migrations, service-layer architecture) paired with a modern React frontend.

---

## Screenshots

<!--
  Replace each placeholder below with an actual image once you have captured
  screenshots locally or from a deployed instance.

  Recommended capture order:
    1. Run the app locally (npm run dev)
    2. Take screenshots at 1280×800 or wider
    3. Save images to docs/screenshots/ and update the src paths below

  Example replacement:
    ![Home page](docs/screenshots/home.png)
-->

| Page | Preview |
|---|---|
| **Home** | `docs/screenshots/home.png` — hero, How It Works, Cocktail of the Day, features grid |
| **Recipe Search** | `docs/screenshots/recipes.png` — search bar, cocktail grid, favourite toggle |
| **Cocktail Detail** | `docs/screenshots/cocktail-detail.png` — ingredients list, instructions, star rating, tasting notes |
| **Cocktail of the Day** | `docs/screenshots/cocktail-of-the-day.png` — daily featured cocktail with full recipe |
| **What Can I Make?** | `docs/screenshots/available.png` — ingredient input, matching cocktail results with match %, "Almost there" suggestions |
| **My Pantry** | `docs/screenshots/pantry.png` — saved ingredient list, add/remove, powers available cocktails automatically |
| **For You** | `docs/screenshots/recommendations.png` — personalized card grid with per-card reason chips |
| **Favourites** | `docs/screenshots/favorites.png` — saved cocktail grid, remove button |
| **Settings** | `docs/screenshots/settings.png` — profile form, password change, theme selector |

---

## Features

**Cocktails**
- Browse a pre-seeded database of 600+ cocktails with names, categories, glass types, and images
- Full-text search by cocktail name or ingredient with fuzzy matching
- Detailed recipe view with a full ingredient list and preparation instructions
- Random cocktail endpoint, plus a **date-seeded Cocktail of the Day** that stays stable for a full calendar day

**"What Can I Make?"**
- Enter ingredients manually and instantly see every cocktail you can make right now
- Each result includes **per-cocktail match metadata**: matched ingredients, missing ingredients, and a match percentage
- Authenticated users can skip the manual entry — the page falls back to their saved **pantry** automatically
- **"Almost there" suggestions** — shows cocktails that need only 1–2 more ingredients, sorted by match percentage

**My Pantry**
- Save a persistent ingredient list to your account
- Ingredients are matched against the cocktail catalogue using normalised keys (case-insensitive, trim-safe)
- Powers "What Can I Make?" automatically when you are signed in

**Tasting notes**
- Rate any cocktail 1–5 stars and leave free-text tasting notes
- Notes are saved per user per cocktail and can be updated or deleted at any time
- Unauthenticated visitors see a prompt to sign in; the rest of the cocktail detail is always public

**Personalized recommendations**
- Rule-based scoring engine surfaces cocktails tailored to each user's history — no ML required
- Scores are computed from pantry coverage, category and glass-type affinity derived from favourites, and a boost for categories the user has rated 4–5 stars
- Each recommendation card shows human-readable reason chips ("Uses 3 of 4 ingredients from your pantry")
- Favourited cocktails are excluded so results always surface something new

**Accounts**
- Registration with server-side password strength enforcement (length, case, digit, symbol)
- JWT-based login / logout with token stored in `localStorage`
- Protected routes on both the client (React Router guard) and the server (FastAPI dependency)
- Disabled-account detection: a deactivated token is rejected at the API level

**User profile**
- Update username and email with duplicate-check validation
- Change password (current password verified before accepting a new one)
- Theme preference (light / dark / system) persisted to the database
- Account disable or permanent delete, both requiring explicit confirmation

**Favourites**
- Save any cocktail to a personal favourites list
- Remove individual favourites; view the full list with images and links
- Optimistic UI updates via a dedicated `useFavorites` hook

**CI**
- GitHub Actions workflow runs on every push and pull request to `main`
- Two parallel jobs: backend pytest (Python 3.14) and frontend lint + Vitest + Vite build (Node 24)
- Green badge visible at the top of this file

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | [FastAPI](https://fastapi.tiangolo.com/) |
| ORM | [SQLAlchemy](https://www.sqlalchemy.org/) (declarative models) |
| Migrations | [Alembic](https://alembic.sqlalchemy.org/) |
| Database | SQLite (pre-seeded cocktail data + user/favourites/pantry/notes via migrations) |
| Auth | JWT (`python-jose`) · bcrypt password hashing (`passlib`) |
| Frontend framework | [React 19](https://react.dev/) |
| Routing | [React Router 7](https://reactrouter.com/) |
| Animations | [Motion (motion/react)](https://motion.dev/) |
| Icons | [Phosphor Icons](https://phosphoricons.com/) |
| Build tool | [Vite 6](https://vite.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| HTTP client | [Axios](https://axios-http.com/) |
| CI | [GitHub Actions](https://docs.github.com/en/actions) |

---

## Architecture Overview

```
client/                      # React SPA (Vite)
│
├── src/
│   ├── api.js               # Axios instance + typed helper functions for every endpoint
│   ├── hooks/
│   │   ├── useAuth.jsx      # AuthContext: token, authStatus, login(), logout(), refreshSession()
│   │   └── useFavorites.js  # Favourites state with optimistic add/remove
│   ├── pages/               # One file per route (Home, Recipes, CocktailDetail, Pantry, Recommendations, ...)
│   └── components/          # Navbar (responsive, mobile hamburger), Footer, CocktailList, ProtectedRoute
│
backend/
│
├── main.py                  # FastAPI app, CORS, logging middleware, router registration
├── database.py              # SQLAlchemy engine + get_db() dependency
├── models.py                # ORM models (Drink, Ingredient, DrinkIngredient, User, Favourite,
│                            #             UserPantryItem, UserCocktailNote)
├── schemas.py               # All Pydantic request/response schemas
├── security.py              # bcrypt helpers, JWT creation/validation, password-strength regex
├── settings.py              # Environment-variable config (secret key, CORS origins, token TTL)
├── logging_config.py        # Python logging setup (structured key=value format, stdout)
├── services/
│   ├── cocktail_service.py       # List, detail, search, available (+ pantry fallback), suggestions, CoTD, random
│   ├── favorite_service.py       # Add, list IDs, list cocktails, remove
│   ├── user_service.py           # Profile read/update, password change, disable, delete
│   ├── auth_service.py           # Register (password strength check) + login
│   ├── pantry_service.py         # Add, list, remove pantry items; ingredient normalisation
│   ├── notes_service.py          # Get, upsert, delete tasting notes
│   └── recommendations_service.py # Rule-based scoring engine: pantry coverage, category/glass
│                                  # affinity from favourites, high-rating category boost
├── routers/
│   ├── cocktails.py         # Cocktails, available (optional auth + pantry fallback), suggestions, CoTD
│   ├── notes.py             # GET / PUT / DELETE /cocktails/{id}/my-note
│   ├── recommendations.py   # GET /recommendations
│   ├── pantry.py            # GET / POST / DELETE /pantry
│   ├── auth/routes.py       # Register + login
│   ├── users.py             # Profile, password, preferences, disable, delete
│   └── favorites.py         # Add, list, remove favourites
└── alembic/                 # Migration history (4 migrations through user_cocktail_notes)
```

**Service layer:** Business logic (query building, pagination, filter composition, auth rules, scoring) lives in `backend/services/`. Routers are intentionally thin — they parse request params, call a service function, and return the result against a Pydantic response schema. This keeps route handlers readable and makes logic independently testable.

**Optional auth pattern:** Several endpoints accept an optional Bearer token. `GET /available` unauthenticated + no `has=` returns an empty list; authenticated without `has=` falls back to the user's saved pantry. This is implemented via a separate `get_optional_user` dependency that returns `None` instead of raising 401.

**Data model note:** The cocktail catalogue (drinks, ingredients, drink_ingredients) lives in a pre-seeded SQLite file and is queried via SQLAlchemy ORM models. User, favourites, pantry, and note tables are created and managed by Alembic so the schema can evolve independently.

---

## Backend API Overview

Interactive docs are available at `http://127.0.0.1:8000/docs` when the backend is running.

All routes are available under the canonical `/api/v1` prefix (e.g. `/api/v1/cocktails`) and temporarily also at their legacy unversioned paths for backward compatibility.

### Cocktails

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/cocktails` | Paginated cocktail list with optional filters | — |
| `GET` | `/api/v1/cocktails/{id}` | Full cocktail detail with ingredients | — |
| `GET` | `/api/v1/search?query=` | Paginated fuzzy search by name or ingredient | — |
| `GET` | `/api/v1/available?has=` | Cocktails makeable from a comma-separated ingredient list (falls back to pantry when authenticated and `has=` is omitted) | Optional |
| `GET` | `/api/v1/available/suggestions` | Cocktails 1–N ingredients short; sorted by match % | Optional |
| `GET` | `/api/v1/cocktail-of-the-day` | Date-seeded daily cocktail — same pick for a full calendar day | — |
| `GET` | `/api/v1/random` | One random cocktail | — |

**Pagination params** (on `/cocktails` and `/search`):

| Param | Default | Constraints | Description |
|---|---|---|---|
| `page` | `1` | ≥ 1 | Page number |
| `page_size` | `20` | 1 – 100 | Items per page |

Paginated responses have the shape:
```json
{ "items": [...], "page": 1, "page_size": 20, "total": 636 }
```

**Filter params** (on `/cocktails` only, all optional, combined with AND):

| Param | Example | Description |
|---|---|---|
| `category` | `Ordinary Drink` | Filter by cocktail category (case-insensitive) |
| `alcoholic` | `Alcoholic` | Filter by alcoholic value (case-insensitive) |
| `glass` | `Cocktail glass` | Filter by glass type (case-insensitive) |
| `ingredient` | `tequila` | Filter by ingredient name (case-insensitive) |

**Suggestions params** (on `/available/suggestions`):

| Param | Default | Constraints | Description |
|---|---|---|---|
| `has` | — | comma-separated | Ingredients available; omit to use pantry (auth required) |
| `max_missing` | `2` | 1 – 5 | Maximum missing ingredients to include |
| `page` / `page_size` | `1` / `20` | standard | Pagination |

### Auth

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Create account | — |
| `POST` | `/api/v1/auth/login` | Obtain JWT token | — |

### User profile

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | Current user profile | Bearer |
| `PATCH` | `/api/v1/users/me` | Update username / email | Bearer |
| `PATCH` | `/api/v1/users/me/preferences` | Update theme | Bearer |
| `POST` | `/api/v1/users/me/password` | Change password | Bearer |
| `POST` | `/api/v1/users/me/disable` | Disable account | Bearer |
| `DELETE` | `/api/v1/users/me` | Delete account | Bearer |

### Favourites

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/favorites/` | Add cocktail to favourites | Bearer |
| `GET` | `/api/v1/favorites/` | List favourite cocktail IDs | Bearer |
| `GET` | `/api/v1/favorites/cocktails` | Full cocktail objects for favourites | Bearer |
| `DELETE` | `/api/v1/favorites/{cocktail_id}` | Remove from favourites | Bearer |

### Pantry

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/pantry/` | List saved pantry items | Bearer |
| `POST` | `/api/v1/pantry/` | Add an ingredient to the pantry | Bearer |
| `DELETE` | `/api/v1/pantry/{ingredient_key}` | Remove an ingredient from the pantry | Bearer |

### Tasting notes

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/cocktails/{id}/my-note` | Get the current user's note for a cocktail | Bearer |
| `PUT` | `/api/v1/cocktails/{id}/my-note` | Create or update a tasting note (upsert) | Bearer |
| `DELETE` | `/api/v1/cocktails/{id}/my-note` | Delete a tasting note | Bearer |

`PUT` body: `{ "rating": 1–5 (optional), "notes": "string (optional)" }` — at least one field should be present.

### Recommendations

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/recommendations?limit=10` | Personalized cocktail recommendations (limit 1–50) | Bearer |

Each item includes `score` (numeric) and `reasons` (list of human-readable strings explaining the score).

### Example requests

```bash
# Browse cocktails (page 2, 10 per page, filtered by glass type)
curl "http://127.0.0.1:8000/api/v1/cocktails?page=2&page_size=10&glass=Cocktail+glass"

# Search by name or ingredient
curl "http://127.0.0.1:8000/api/v1/search?query=margarita"

# What can I make with tequila and lime juice?
curl "http://127.0.0.1:8000/api/v1/available?has=tequila,lime+juice"

# What am I close to making? (1 ingredient short)
curl "http://127.0.0.1:8000/api/v1/available/suggestions?has=tequila&max_missing=1"

# Today's featured cocktail
curl "http://127.0.0.1:8000/api/v1/cocktail-of-the-day"

# Register then log in
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"Secure1!Pass"}'

curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Secure1!Pass"}'
# → {"access_token": "eyJ...", "token_type": "bearer"}

# Add tequila to your pantry (replace TOKEN)
curl -X POST http://127.0.0.1:8000/api/v1/pantry/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ingredient_name":"Tequila"}'

# Rate a cocktail and leave a note
curl -X PUT http://127.0.0.1:8000/api/v1/cocktails/11007/my-note \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"notes":"Perfect balance of sweet and sour."}'

# Get personalized recommendations
curl http://127.0.0.1:8000/api/v1/recommendations?limit=10 \
  -H "Authorization: Bearer TOKEN"
```

### Logging

The backend emits structured key=value logs to stdout on every request:

```
2025-06-06T12:34:56 level=INFO logger=ginny.request method=GET path=/api/v1/cocktails status=200 duration_ms=14
2025-06-06T12:34:57 level=WARNING logger=ginny.request method=GET path=/api/v1/cocktails/9999 status=404 duration_ms=3
```

- 4xx and 5xx responses log at `WARNING`; everything else at `INFO`.
- Authorization headers, request bodies, passwords, and tokens are never logged.
- `uvicorn` and `sqlalchemy.engine` access logs are suppressed to avoid duplicating request lines.
- Database errors in `/health` are logged at `ERROR` but the API response only returns a generic `"database": "unavailable"` message.

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+

### Fresh clone (recommended)

```bash
git clone https://github.com/tugayapucu/PersonalBartender.git
cd PersonalBartender

# 1. Install dependencies
npm install
pip install -r backend/requirements.txt
npm --prefix client install

# 2. Copy environment files and fill in values
#    Unix / macOS
cp backend/.env.example backend/.env
cp client/.env.example client/.env
#    Windows (PowerShell)
#    copy backend\.env.example backend\.env
#    copy client\.env.example client\.env

# 3. Run migrations and seed cocktail data (run once per clone)
npm run setup

# 4. Start the dev servers
npm run dev
```

`npm run setup` runs Alembic migrations (`upgrade head`) then loads the full cocktail catalogue from `cocktails_all.jsonl` into the database. It is safe to re-run — it clears and reloads catalogue data without touching user accounts, favourites, pantry items, or tasting notes.

`npm run dev` runs migrations on every start (fast, idempotent) and then launches the FastAPI backend and the Vite dev server concurrently.

### Manual

```bash
# Terminal 1 — backend
cd backend
# Unix: cp .env.example .env
# Windows: copy .env.example .env
# Edit .env and set GINNY_SECRET_KEY before continuing

python -m alembic -c alembic.ini upgrade head
cd ..
python backend/scripts/seed_cocktails.py
python -m uvicorn main:app --reload --app-dir backend

# Terminal 2 — frontend
cd client
# Unix: cp .env.example .env
# Windows: copy .env.example .env
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in the values. The backend reads variables directly from the shell environment, so you can also export them from your hosting platform instead of using a file.

| Variable | Required | Default | Description |
|---|---|---|---|
| `GINNY_SECRET_KEY` | **Yes (prod)** | `development-only-change-me` | HS256 signing key for JWT tokens. Generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:5173, http://127.0.0.1:5173` | Comma-separated list of allowed origins |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | JWT lifetime in minutes |

### Frontend (`client/.env`)

Copy `client/.env.example` to `client/.env`.

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Base URL for all API requests |

---

## Available Scripts

From the project root:

| Script | Description |
|---|---|
| `npm run setup` | Run migrations then seed cocktail data — run once after a fresh clone |
| `npm run migrate` | Apply Alembic migrations (`upgrade head`) |
| `npm run seed` | Load cocktail catalogue from `cocktails_all.jsonl` into the database |
| `npm run dev` | Run migrations and start backend + frontend dev servers concurrently |
| `npm run test` | Run backend pytest + frontend Vitest (no servers required) |
| `npm run test:backend` | Backend pytest suite only |
| `npm run test:client` | Frontend Vitest suite only |
| `npm run test:e2e` | Playwright E2E tests (auto-starts both servers) |
| `npm run test:e2e:ui` | Playwright with the interactive UI runner |
| `npm --prefix client run build` | Production build of the React app |
| `npm --prefix client run lint` | ESLint across the client source |

---

## Testing

### Install test dependencies

```bash
# Backend
pip install -r backend/requirements-dev.txt

# Frontend (already installed as devDependencies via npm install)

# E2E — install Chromium browser binaries once
npx playwright install chromium
```

### Run tests

| Command | What it runs |
|---|---|
| `npm run test` | Backend pytest + frontend Vitest (no servers required) |
| `npm run test:backend` | pytest only |
| `npm run test:client` | Vitest only |
| `npm run test:e2e` | Playwright E2E (auto-starts backend + frontend via webServer config) |
| `npm run test:e2e:ui` | Playwright with the interactive UI |

> **Before running E2E tests on a fresh clone**, seed the database first:
> ```bash
> npm run setup
> npm run test:e2e
> ```

### What is tested

**Backend — 139 pytest tests** (`backend/tests/`)

- `test_smoke.py` — API reachable, seeded data queryable, test DB isolated from production
- `test_auth.py` — registration (success, duplicate email/username, weak password), login (success, wrong password, nonexistent email, disabled account)
- `test_cocktails.py` — list (pagination, filters), detail, search, available (with pantry fallback, match metadata), suggestions (ranking, max_missing, pantry fallback), CoTD (stability, date variance), random
- `test_favorites.py` — unauthenticated rejection, add/duplicate/list/remove CRUD, cross-user isolation
- `test_pantry.py` — add/list/remove, ingredient normalisation, duplicate prevention, cross-user isolation
- `test_notes.py` — unauthenticated rejection, get/create/update/delete, rating validation (1–5), optional fields, user isolation
- `test_recommendations.py` — unauthenticated rejection, empty-state fallback, pantry coverage ranking, favourite exclusion + category boost, high-rating category signal, limit param
- `test_users.py` — `GET /users/me`, profile update, duplicate username, theme preference, password change, disable, delete
- `test_logging.py` — logging middleware does not break health, cocktail list, or 404 responses
- `test_api_v1.py` — all route groups smoke-tested under `/api/v1` prefix

All backend tests use an **in-memory SQLite database** — they never read or write `backend/ginny_database.db`.

**Frontend — 15 Vitest/RTL smoke tests** (`client/src/test/smoke.test.jsx`)

Rendering checks — no server required. Covers Navbar, Login, Register, ProtectedRoute redirect, CocktailList (mocked API), Pantry (empty + populated), AvailableCocktails, CocktailDetail (skeleton, loaded state, sign-in prompt), Recommendations (loading, cards with reasons, empty state), and Settings section headings.

**E2E — 2 Playwright tests** (`e2e/smoke.spec.js`)

Foundation only. Verifies the home page loads with the Ginny brand visible and that `/login` renders the login form against real running servers. Full user-journey tests are on the roadmap.

**CI**

GitHub Actions runs both test suites automatically on every push and pull request to `main`. Two parallel jobs (backend pytest on Python 3.14, frontend lint + Vitest + Vite build on Node 24) must both pass before a PR can be considered green.

---

## Roadmap

Completed features are listed under [Features](#features). Everything below is planned work not yet implemented.

### Near term

- [ ] **Playwright E2E expansion** — register → login → search → add favourite → remove favourite journey; add pantry and tasting-notes flows with `data-testid` selectors
- [ ] **Pagination UI** — expose the paginated `/cocktails` API in the frontend with a "Load more" button or infinite scroll on the recipe grid
- [ ] **Toast notifications** — replace inline success/error messages in Settings and tasting notes with a non-blocking toast component

### Backend improvements

- [ ] **Input validation tightening** — enforce max lengths on username and email in Pydantic schemas; return consistent `422` error shapes for all invalid inputs
- [ ] **Refresh tokens** — issue a short-lived access token and a longer-lived refresh token so users are not logged out every hour

### Production / deployment

- [ ] **Docker Compose** — single `docker compose up` to start the backend and serve the built frontend; simplifies reviewer setup and acts as a deployment artefact
- [ ] **PostgreSQL support** — read `DATABASE_URL` from the environment so SQLite is used locally and Postgres is used in production without any code changes
- [ ] **Deployment guide** — document deploying the backend to Railway or Render and the frontend to Vercel or Netlify, including environment variable configuration
- [ ] **Hero video hosting** — move the 29.8 MB background video out of the Vite bundle; host on a CDN or replace with a YouTube embed so it is streamed rather than bundled and served as a static asset

### Phase 6

- [ ] **User-created recipes** — authenticated `POST /cocktails` endpoint with a form-based UI; user-submitted recipes stored separately from the seeded catalogue with moderation flag

---

## What This Project Demonstrates

Ginny was built as a realistic full-stack application to show practical backend and frontend engineering skills in a single, cohesive codebase. It is not a tutorial clone — every layer was designed and wired together from scratch.

### REST API design and service layer

The FastAPI backend follows a thin-router / service-layer pattern. Seven routers (`cocktails`, `auth`, `users`, `favorites`, `pantry`, `notes`, `recommendations`) handle request parsing, dependency injection, and response serialisation. Business logic — query building, pagination, filter composition, scoring, auth rule enforcement — lives in a dedicated `services/` package, keeping route handlers readable and testable in isolation.

Endpoints follow REST conventions: correct HTTP verbs, meaningful status codes, and Pydantic schemas for both request validation and response shaping. All routes are available under the canonical `/api/v1` prefix with Swagger UI at `/docs`.

### Rule-based recommendation engine

The recommendations service scores every non-favourited cocktail against the authenticated user's full history using four deterministic signals: pantry ingredient coverage (up to 1.0), category affinity derived from favourited cocktails (+0.20), glass-type affinity (+0.10), and a boost when the cocktail's category matches one the user has rated 4–5 stars (+0.15). Results are sorted by score descending, then by drink ID ascending so output is fully reproducible in tests without any randomness. Each recommendation item includes a `reasons` list with human-readable strings explaining exactly why the score is what it is.

### Optional auth pattern

The `GET /available` and `GET /available/suggestions` endpoints accept an optional Bearer token. Unauthenticated requests with explicit `has=` ingredients work with no auth. Authenticated requests without `has=` fall back to the user's saved pantry automatically. This is implemented via a separate `get_optional_user` FastAPI dependency that returns `None` instead of raising 401, avoiding the common mistake of duplicating the endpoint.

### Authentication and authorisation

JWT-based auth is implemented end-to-end:
- Passwords are hashed with bcrypt and validated server-side against a strength regex before storage
- Tokens are signed with HS256 and verified on every protected request via a reusable `get_current_user` FastAPI dependency
- Disabled accounts are rejected at the token-validation layer, not just in business logic
- The frontend mirrors this with a `ProtectedRoute` component that checks auth state before rendering any guarded page, and an `AuthContext` that re-validates the stored token on mount and across browser tabs via the `storage` event

### Database design and migrations

User data, favourites, pantry items, and tasting notes are each managed through separate SQLAlchemy ORM models with a clean `get_db()` dependency injection pattern. Schema evolution is handled by four Alembic migrations — each new feature added a migration without touching existing ones. The pre-seeded cocktail catalogue is queried via the same SQLAlchemy session, keeping the data access layer consistent across both data sources.

Composite primary keys and `UniqueConstraint` are used where appropriate (e.g. `user_id + ingredient_key` on pantry items, `user_id + drink_id` on notes) to enforce data integrity at the database level rather than relying solely on application logic.

### Test strategy

139 backend tests cover the service and router layers using an in-memory SQLite database (StaticPool) that is completely isolated from the production file. Cocktail catalogue data is seeded once at session scope; user data is deleted after every test via explicit DELETE statements so each test starts with a clean slate. There are no mocked database calls — tests hit the real query path.

Frontend smoke tests use React Testing Library to verify that each page renders without crashing and that key elements are present, with all API calls mocked via `vi.mock`. This catches import errors, missing props, and broken JSX without requiring a running server.

### React state management and hooks

- `useAuth` is a context-based hook that owns the full authentication lifecycle: token storage, status transitions (`unauthenticated` → `checking` → `authenticated`), login, logout, and session refresh
- `useFavorites` encapsulates remote favourite state with optimistic local updates so the UI responds immediately without waiting for the server round-trip
- Search input uses a 400 ms debounce to avoid firing a request on every keystroke
- Theme preference is persisted to the backend and rehydrated on login, rather than relying solely on `localStorage`

### Client–server integration

The frontend communicates exclusively through a typed Axios helper layer (`src/api.js`) that centralises the base URL, attaches the auth token, and exposes one function per endpoint. This keeps component code free of raw HTTP calls and makes the API contract easy to inspect in one place.

### Continuous integration

A GitHub Actions workflow (`ci.yml`) runs on every push and pull request to `main`. Two parallel jobs — backend pytest on Python 3.14 and frontend lint + Vitest + Vite production build on Node 24 — must both pass. The badge at the top of this file reflects the status of the last run on `main`. A separate `pr-quality-gate.yml` workflow additionally runs the Playwright E2E suite on pull requests.

### Environment-based configuration

Both tiers are configured through environment variables with sensible defaults for local development. The backend reads `GINNY_SECRET_KEY`, `CORS_ALLOWED_ORIGINS`, and `ACCESS_TOKEN_EXPIRE_MINUTES` via `settings.py`; the frontend reads `VITE_API_BASE_URL`. Each tier ships a `.env.example` file. No secrets are hardcoded.

---

## License

MIT — see [LICENSE](LICENSE).
