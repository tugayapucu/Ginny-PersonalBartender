import API from "./config";

class CocktailApi {
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
