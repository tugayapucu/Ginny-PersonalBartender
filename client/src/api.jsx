import axios from "axios";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const authConfig = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

export const fetchCocktails = () => API.get("/cocktails");
export const searchCocktails = (query) =>
  API.get("/search", { params: { query } });
export const getRandomCocktail = () => API.get("/random");
export const getCocktailById = (id) => API.get(`/cocktails/${id}`);
export const getAvailableCocktails = (ingredients) =>
  API.get("/available", { params: { has: ingredients.join(",") } });
export const loginRequest = (payload) => API.post("/auth/login", payload);
export const registerRequest = (payload) => API.post("/auth/register", payload);
export const getFavoritesRequest = (token) =>
  API.get("/favorites/", authConfig(token));
export const addFavoriteRequest = (token, cocktailId) =>
  API.post("/favorites/", { cocktail_id: String(cocktailId) }, authConfig(token));
export const removeFavoriteRequest = (token, cocktailId) =>
  API.delete(`/favorites/${cocktailId}`, authConfig(token));
export const getMeRequest = (token) => API.get("/users/me", authConfig(token));
export const updatePreferencesRequest = (token, theme) =>
  API.patch("/users/me/preferences", { theme }, authConfig(token));
export const updateMeRequest = (token, payload) =>
  API.patch("/users/me", payload, authConfig(token));
export const changePasswordRequest = (token, payload) =>
  API.post("/users/me/password", payload, authConfig(token));
export const deleteAccountRequest = (token) =>
  API.delete("/users/me", authConfig(token));
export const disableAccountRequest = (token) =>
  API.post("/users/me/disable", {}, authConfig(token));

export default API;
