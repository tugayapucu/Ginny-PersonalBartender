# PersonalBartender
Create your own Personal Bartender with your own taste on cocktails

## Configuration
Backend reads these environment variables from the shell or hosting platform:

- `GINNY_SECRET_KEY`
- `CORS_ALLOWED_ORIGINS` as a comma-separated list
- `ACCESS_TOKEN_EXPIRE_MINUTES`

Client reads `VITE_API_BASE_URL` from `client/.env`.

## Dev (recommended)
cd /path/to/PersonalBartender
npm install
npm --prefix client install
npm run dev

For local development, create `client/.env` from `client/.env.example` if you need a different API URL.

## Manual
cd backend
python -m uvicorn main:app --reload

cd client
npm run dev
