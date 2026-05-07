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
├── main.py                  # FastAPI app, CORS, router registration
├── database.py              # SQLAlchemy engine + get_db() dependency
├── models.py                # SQLAlchemy User & Favourite ORM models; Pydantic Cocktail model
├── schemas.py               # Request/response Pydantic schemas
├── security.py              # bcrypt helpers, JWT creation/validation, password-strength regex
├── settings.py              # Environment-variable config (secret key, CORS origins, token TTL)
├── routers/
│   ├── cocktails.py         # Read-only cocktail endpoints (browse, search, available, random)
│   ├── auth/routes.py       # Register + login
│   ├── users.py             # Profile, password, preferences, account management
│   └── favorites.py         # Add, list, bulk-fetch, remove favourites
└── alembic/                 # Migration history (users + favourites tables)
```

**Data model note:** The cocktail catalogue (drinks, ingredients, drink_ingredients) lives in a pre-seeded SQLite file and is queried with raw SQLAlchemy `text()` calls. User and favourites tables are created and managed by Alembic so the schema can evolve independently.

---

## Backend API Overview

Interactive docs are available at `http://127.0.0.1:8000/docs` when the backend is running.

### Cocktails

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/cocktails` | List first 50 cocktails (summary) | — |
| `GET` | `/cocktails/{id}` | Full cocktail detail with ingredients | — |
| `GET` | `/search?q=` | Fuzzy search by name or ingredient | — |
| `GET` | `/available?ingredients=` | Cocktails you can make from your pantry | — |
| `GET` | `/random` | One random cocktail | — |

### Auth

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create account | — |
| `POST` | `/auth/login` | Obtain JWT token | — |

### User profile

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/users/me` | Current user profile | Bearer |
| `PATCH` | `/users/me` | Update username / email | Bearer |
| `PATCH` | `/users/me/preferences` | Update theme | Bearer |
| `POST` | `/users/me/password` | Change password | Bearer |
| `POST` | `/users/me/disable` | Disable account | Bearer |
| `DELETE` | `/users/me` | Delete account | Bearer |

### Favourites

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/favorites/` | Add cocktail to favourites | Bearer |
| `GET` | `/favorites/` | List favourite cocktail IDs | Bearer |
| `GET` | `/favorites/cocktails` | Full cocktail objects for favourites | Bearer |
| `DELETE` | `/favorites/{cocktail_id}` | Remove from favourites | Bearer |

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+

### Recommended (runs migrations automatically)

```bash
git clone https://github.com/tugayapucu/PersonalBartender.git
cd PersonalBartender

npm install
pip install -r backend/requirements.txt
npm --prefix client install

# Copy and edit environment files
cp backend/.env.example backend/.env   # set GINNY_SECRET_KEY at minimum
cp client/.env.example client/.env     # adjust VITE_API_BASE_URL if needed

npm run dev
```

`npm run dev` runs Alembic migrations and then starts both the FastAPI backend and the Vite dev server concurrently.

### Manual

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env   # edit .env before starting
python -m alembic -c alembic.ini upgrade head
python -m uvicorn main:app --reload

# Terminal 2 — frontend
cd client
cp .env.example .env
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
| `npm run dev` | Run migrations, start backend + frontend dev servers |
| `npm --prefix client run build` | Production build of the React app |
| `npm --prefix client run lint` | ESLint across the client source |

---

## Testing

There are currently no automated tests. Adding a pytest suite for the backend API and a Vitest suite for the frontend hooks is on the roadmap (see below).

---

## Roadmap

- [ ] pytest suite: register → login → add favourite happy-path; 401/403/404 edge cases
- [ ] Vitest + React Testing Library for `useAuth` and `useFavorites` hooks
- [ ] Docker Compose for one-command local setup
- [ ] GitHub Actions CI (lint + test on every push)
- [ ] Date-seeded "Cocktail of the Day" so the pick is stable for a full calendar day
- [ ] PostgreSQL support via a DATABASE_URL env variable (SQLite for local, Postgres for prod)
- [ ] User-created recipes (POST /cocktails with auth)
- [ ] Ingredient-based preference profile and simple recommendation scoring

---

## Portfolio Notes

This project was built to demonstrate practical full-stack engineering skills in a realistic, self-contained application:

**Backend design**
- FastAPI router structure separating concerns (cocktails, auth, users, favourites)
- SQLAlchemy ORM with a clean `get_db()` dependency injection pattern
- Alembic migration workflow decoupled from application startup
- JWT authentication with a reusable `get_current_user` FastAPI dependency
- Server-side password strength validation with a dedicated security module
- Two-layer access control: client-side protected routes and server-side auth dependencies

**Frontend design**
- React Context (`useAuth`) as a single source of truth for authentication state, with auto-validation on mount and cross-tab storage events
- Custom hook (`useFavorites`) encapsulating remote state with optimistic local updates
- Debounced search input to limit unnecessary API calls
- Theme preference round-tripped to the server and re-applied on login, not just stored in `localStorage`

---

## License

MIT — see [LICENSE](LICENSE).
