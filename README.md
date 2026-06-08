# Ginny — Personal Bartender

A cocktail discovery web app with user accounts, search, favourites, and ingredient-based lookup.
Built as a full-stack portfolio project to demonstrate a production-shaped backend (FastAPI, JWT auth, Alembic migrations) paired with a modern React frontend.

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
| **Cocktail Detail** | `docs/screenshots/cocktail-detail.png` — ingredients list, instructions, glass type |
| **What Can I Make?** | `docs/screenshots/available.png` — ingredient input, matching cocktail results |
| **Favourites** | `docs/screenshots/favorites.png` — saved cocktail grid, remove button |
| **Settings** | `docs/screenshots/settings.png` — profile form, password change, theme selector |

---

## Features

**Cocktails**
- Browse a pre-seeded database of cocktails with names, categories, glass types, and images
- Full-text search by cocktail name or ingredient with fuzzy matching
- Detailed recipe view with a full ingredient list and preparation instructions
- "What Can I Make?" — enter the ingredients you have on hand and see every matching cocktail
- Random cocktail endpoint powering a Cocktail of the Day page

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

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | [FastAPI](https://fastapi.tiangolo.com/) |
| ORM | [SQLAlchemy](https://www.sqlalchemy.org/) (declarative models) |
| Migrations | [Alembic](https://alembic.sqlalchemy.org/) |
| Database | SQLite (pre-seeded cocktail data + user/favourites via migrations) |
| Auth | JWT (`python-jose`) · bcrypt password hashing (`passlib`) |
| Frontend framework | [React 19](https://react.dev/) |
| Routing | [React Router 7](https://reactrouter.com/) |
| Build tool | [Vite 6](https://vite.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| HTTP client | [Axios](https://axios-http.com/) |

---

## Architecture Overview

```
client/                      # React SPA (Vite)
│
├── src/
│   ├── api.jsx              # Axios instance + typed helper functions for every endpoint
│   ├── hooks/
│   │   ├── useAuth.jsx      # AuthContext: token, authStatus, login(), logout(), refreshSession()
│   │   └── useFavorites.js  # Favourites state with optimistic add/remove
│   ├── pages/               # One file per route (Home, Recipes, CocktailDetail, ...)
│   └── components/          # Navbar, Footer, CocktailList, ProtectedRoute
│
backend/
│
├── main.py                  # FastAPI app, CORS, logging middleware, router registration
├── database.py              # SQLAlchemy engine + get_db() dependency
├── models.py                # SQLAlchemy ORM models (Drink, Ingredient, DrinkIngredient, User, Favourite)
├── schemas.py               # All Pydantic request/response schemas (CocktailSummary, CocktailDetail, ...)
├── security.py              # bcrypt helpers, JWT creation/validation, password-strength regex
├── settings.py              # Environment-variable config (secret key, CORS origins, token TTL)
├── logging_config.py        # Python logging setup (structured key=value format, stdout)
├── services/
│   ├── cocktail_service.py  # List, detail, search, available, random — ORM queries, pagination, filters
│   ├── favorite_service.py  # Add, list IDs, list cocktails, remove
│   ├── user_service.py      # Profile read/update, password change, disable, delete
│   └── auth_service.py      # Register (with password strength check) + login
├── routers/
│   ├── cocktails.py         # Thin router: parse params → call cocktail_service → return schema
│   ├── auth/routes.py       # Thin router: delegate to auth_service
│   ├── users.py             # Thin router: delegate to user_service
│   └── favorites.py         # Thin router: delegate to favorite_service
└── alembic/                 # Migration history (users + favourites tables)
```

**Service layer:** Business logic (query building, pagination, filter composition, auth rules) lives in `backend/services/`. Routers are intentionally thin — they parse request params, call a service function, and return the result against a Pydantic response schema. This keeps route handlers readable and makes logic independently testable.

**Data model note:** The cocktail catalogue (drinks, ingredients, drink_ingredients) lives in a pre-seeded SQLite file and is queried via SQLAlchemy ORM models. User and favourites tables are created and managed by Alembic so the schema can evolve independently.

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
| `GET` | `/api/v1/available?has=` | Cocktails makeable from a comma-separated pantry list | — |
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

> **`/available` vs `ingredient` filter:** `/available?has=tequila,lime juice` answers "what can I make with what I have?" — it finds cocktails that contain *all* listed ingredients. The `ingredient` filter on `/cocktails` is a simpler single-ingredient narrowing filter that works alongside pagination. Both are intentionally kept.

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

### Example requests

```bash
# Browse cocktails (page 2, 10 per page, filtered by glass type)
curl "http://127.0.0.1:8000/api/v1/cocktails?page=2&page_size=10&glass=Cocktail+glass"

# Search by name or ingredient
curl "http://127.0.0.1:8000/api/v1/search?query=margarita"

# What can I make with tequila and lime juice?
curl "http://127.0.0.1:8000/api/v1/available?has=tequila,lime+juice"

# Register then log in
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"Secure1!Pass"}'

curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Secure1!Pass"}'
# → {"access_token": "eyJ...", "token_type": "bearer"}

# Get your profile (replace TOKEN with the access_token from login)
curl http://127.0.0.1:8000/api/v1/users/me \
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

`npm run setup` runs Alembic migrations (`upgrade head`) then loads the full cocktail catalogue from `cocktails_all.jsonl` into the database. It is safe to re-run — it clears and reloads catalogue data without touching user accounts or favourites.

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

**Backend — 83 pytest tests** (`backend/tests/`)

- `test_smoke.py` — API reachable, seeded data queryable, test DB isolated from production
- `test_auth.py` — registration (success, duplicate email/username, weak password), login (success, wrong password, nonexistent email, disabled account)
- `test_cocktails.py` — list (pagination metadata, custom page_size, invalid params → 422), detail (with ingredients), search, available, random; all four filters individually, combined filters, pagination + filters
- `test_favorites.py` — unauthenticated rejection, add/duplicate/list/remove CRUD, full cocktail detail via `/favorites/cocktails`, cross-user isolation
- `test_users.py` — `GET /users/me`, profile update, duplicate username, theme preference, password change, disable, delete
- `test_logging.py` — logging middleware does not break health, cocktail list, or 404 responses
- `test_api_v1.py` — all route groups smoke-tested under `/api/v1` prefix (cocktails, auth, favorites, users)

All backend tests use an **in-memory SQLite database** — they never read or write `backend/ginny_database.db`.

**Frontend — 6 Vitest/RTL smoke tests** (`client/src/test/smoke.test.jsx`)

Rendering checks only — no server required. Covers Navbar, Login, Register, ProtectedRoute redirect, CocktailList (mocked API), and Settings section headings. Does not test user interactions or API integration.

**E2E — 2 Playwright tests** (`e2e/smoke.spec.js`)

Foundation only. Verifies the home page loads with the Ginny brand visible and that `/login` renders the login form against real running servers. Full user-journey tests (register → search → favourite) are on the roadmap.

---

## Roadmap

Completed features are listed under [Features](#features). Everything below is planned work not yet implemented.

### Near term

- [ ] **Playwright E2E expansion** — register → login → search → add favourite → remove favourite journey; stable selectors (`data-testid`) on key interactive elements
- [ ] **GitHub Actions CI** — run `npm run test` on every push; Playwright on pull requests
- [ ] **Date-seeded Cocktail of the Day** — use `random.seed(date.today().toordinal())` so the pick is stable for a full calendar day rather than re-randomising on every page load

### Backend improvements

- [ ] **Input validation tightening** — enforce max lengths on username and email in Pydantic schemas; return consistent `422` error shapes for all invalid inputs
- [ ] **Refresh tokens** — issue a short-lived access token and a longer-lived refresh token so users are not logged out every hour
- [ ] **Pagination UI** — expose the paginated API in the frontend with a "Load more" button or infinite scroll on the recipe grid

### Frontend improvements

- [ ] **Skeleton loading states** — replace plain text loading indicators with Tailwind skeleton placeholders on the recipe grid, cocktail detail, and favourites pages
- [ ] **Toast notifications** — replace inline success/error messages in Settings with a non-blocking toast component
- [ ] **Empty state illustrations** — add a friendly empty state to the Favourites page when the user has not saved anything yet

### Production / deployment

- [ ] **Docker Compose** — single `docker compose up` to start the backend and serve the built frontend; simplifies reviewer setup and acts as a deployment artefact
- [ ] **GitHub Actions CI** — lint (ESLint + `ruff` / `flake8`) and test (pytest + Vitest) on every push and pull request
- [ ] **PostgreSQL support** — read `DATABASE_URL` from the environment so SQLite is used locally and Postgres is used in production without any code changes
- [ ] **Deployment guide** — document deploying the backend to Railway or Render and the frontend to Vercel or Netlify, including environment variable configuration
- [ ] **Hero video hosting** — move the 29.8 MB background video out of the Vite bundle; host on a CDN or replace with a YouTube embed so it is streamed rather than bundled and served as a static asset

### Future product features

- [ ] **User pantry** — let users save a persistent list of ingredients they own, pre-populating the "What Can I Make?" page automatically
- [ ] **Recommendation scoring** — score cocktails against a user's favourites history (shared ingredients, same category) and surface a "You might also like" section on the cocktail detail page
- [ ] **User-created recipes** — authenticated `POST /cocktails` endpoint with a form-based UI; user-submitted recipes stored separately from the seeded catalogue
- [ ] **Recipe ratings** — allow users to rate cocktails and sort the browse page by average rating

---

## What This Project Demonstrates

Ginny was built as a realistic full-stack application to show practical backend and frontend engineering skills in a single, cohesive codebase. It is not a tutorial clone — every layer was designed and wired together from scratch.

### REST API design and service layer

The FastAPI backend follows a thin-router / service-layer pattern. Four routers (`cocktails`, `auth`, `users`, `favorites`) handle request parsing, dependency injection, and response serialisation. Business logic — query building, pagination, filter composition, auth rule enforcement — lives in a dedicated `services/` package, keeping route handlers readable and testable in isolation.

Endpoints follow REST conventions: correct HTTP verbs, meaningful status codes, and Pydantic schemas for both request validation and response shaping. All routes are available under the canonical `/api/v1` prefix with Swagger UI at `/docs`.

### Authentication and authorisation

JWT-based auth is implemented end-to-end:
- Passwords are hashed with bcrypt and validated server-side against a strength regex before storage
- Tokens are signed with HS256 and verified on every protected request via a reusable `get_current_user` FastAPI dependency
- Disabled accounts are rejected at the token-validation layer, not just in business logic
- The frontend mirrors this with a `ProtectedRoute` component that checks auth state before rendering any guarded page, and an `AuthContext` that re-validates the stored token on mount and across browser tabs via the `storage` event

### Database design and migrations

User and favourites data is managed through SQLAlchemy ORM models with a clean `get_db()` dependency injection pattern. Schema evolution is handled by Alembic — migrations run automatically as part of `npm run dev` and can be applied manually, keeping the migration history separate from application startup. The pre-seeded cocktail catalogue is queried via the same SQLAlchemy session, keeping the data access layer consistent across both data sources.

### React state management and hooks

- `useAuth` is a context-based hook that owns the full authentication lifecycle: token storage, status transitions (`unauthenticated` → `checking` → `authenticated`), login, logout, and session refresh
- `useFavorites` encapsulates remote favourite state with optimistic local updates so the UI responds immediately without waiting for the server round-trip
- Search input uses a 400 ms debounce to avoid firing a request on every keystroke
- Theme preference is persisted to the backend and rehydrated on login, rather than relying solely on `localStorage`

### Client–server integration

The frontend communicates exclusively through a typed Axios helper layer (`src/api.jsx`) that centralises the base URL, attaches the auth token, and exposes one function per endpoint. This keeps component code free of raw HTTP calls and makes the API contract easy to inspect in one place.

### Environment-based configuration

Both tiers are configured through environment variables with sensible defaults for local development. The backend reads `GINNY_SECRET_KEY`, `CORS_ALLOWED_ORIGINS`, and `ACCESS_TOKEN_EXPIRE_MINUTES` via `settings.py`; the frontend reads `VITE_API_BASE_URL`. Each tier ships a `.env.example` file. No secrets are hardcoded.

### Planned production work

The project is functional but not yet production-hardened. The [Roadmap](#roadmap) section covers the concrete next steps: GitHub Actions CI, Docker Compose, and PostgreSQL support. These are acknowledged gaps, not oversights — the priority was to build a complete, working feature set and a meaningful test suite first.

---

## License

MIT — see [LICENSE](LICENSE).
