// 📦 **API INDEX - Central Export Point**
// This provides a clean way to import all API services

export { default as API } from "./config";
export { default as CocktailApi } from "./cocktailApi";
export { default as UserApi } from "./userApi";
export { default as AuthApi } from "./authApi";

// 🔄 **Backward Compatibility Exports**
// Keep existing function exports for components that already use them
export { default as fetchCocktails } from "./cocktailApi";
export const searchCocktails = (query) => CocktailApi.searchCocktails(query);
export const getRandomCocktail = () => CocktailApi.getRandomCocktails(5);

// 🎯 **Usage Examples:**
// import { CocktailApi, UserApi, AuthApi } from '../api';
// import { fetchCocktails, searchCocktails } from '../api'; // legacy imports
