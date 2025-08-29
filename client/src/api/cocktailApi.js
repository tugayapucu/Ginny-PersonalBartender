import API from "./config";

// 🍹 **COCKTAIL SERVICE - Complete CRUD Operations**
// This handles all cocktail-related API calls

class CocktailApi {
  // 📋 **GET: Fetch all cocktails**
  // Used in: CocktailList component, Home page
  static async getCocktails() {
    try {
      const response = await API.get("/cocktails");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch cocktails"
      );
    }
  }

  // 🔍 **GET: Get single cocktail by ID**
  // Used in: CocktailDetail page, favorites expansion
  static async getCocktail(cocktailId) {
    try {
      const response = await API.get(`/cocktails/${cocktailId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch cocktail details"
      );
    }
  }

  // 🔄 **PUT: Update cocktail**
  // Note: Currently not implemented in backend, but prepared for future
  static async updateCocktail(cocktailId, payload) {
    try {
      const response = await API.put(`/cocktails/${cocktailId}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to update cocktail"
      );
    }
  }

  // ➕ **POST: Create new cocktail**
  // Note: Currently not implemented in backend, but prepared for future
  static async createCocktail(payload) {
    try {
      const response = await API.post("/cocktails", payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to create cocktail"
      );
    }
  }

  // ❌ **DELETE: Remove cocktail**
  // Note: Currently not implemented in backend, but prepared for future
  static async deleteCocktail(cocktailId) {
    try {
      const response = await API.delete(`/cocktails/${cocktailId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to delete cocktail"
      );
    }
  }

  // 🔍 **GET: Search cocktails by query**
  // Used in: CocktailList component search functionality
  static async searchCocktails(query) {
    try {
      const response = await API.get(
        `/search?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to search cocktails"
      );
    }
  }

  // 🎲 **GET: Get random cocktail(s)**
  // Used in: CocktailList "Surprise Me" feature
  static async getRandomCocktails(count = 5) {
    try {
      const response = await API.get(`/random?count=${count}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch random cocktails"
      );
    }
  }

  // 🍃 **GET: Get available cocktails by ingredients**
  // Used in: AvailableCocktails page
  static async getAvailableCocktails(ingredients) {
    try {
      const ingredientString = Array.isArray(ingredients)
        ? ingredients.join(",")
        : ingredients;

      const response = await API.get(
        `/available?has=${encodeURIComponent(ingredientString)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch available cocktails"
      );
    }
  }

  // ❤️ **POST: Add cocktail to favorites**
  // Used in: CocktailList, AvailableCocktails components
  static async addToFavorites(cocktailId) {
    try {
      const response = await API.post("/favorites/", {
        cocktail_id: cocktailId,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to add to favorites"
      );
    }
  }

  // 💔 **DELETE: Remove cocktail from favorites**
  // Used in: CocktailList, Favorites page
  static async removeFromFavorites(cocktailId) {
    try {
      const response = await API.delete(`/favorites/${cocktailId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to remove from favorites"
      );
    }
  }

  // 📋 **GET: Get user's favorite cocktails**
  // Used in: Favorites page, Navbar favorites count
  static async getFavoriteCocktails() {
    try {
      const response = await API.get("/favorites/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch favorites"
      );
    }
  }
}

export default CocktailApi;
