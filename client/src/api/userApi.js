import API from "./config";

// 👤 **USER SERVICE - User Management Operations**
// This handles all user-related API calls (except auth)

class UserApi {
  // ➕ **POST: Create new user**
  // Used in: Register page
  static async createUser(payload) {
    try {
      const response = await API.post("/auth/register", {
        username: payload.username,
        email: payload.email,
        password: payload.password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Failed to create user");
    }
  }

  // 🔄 **PUT: Update user profile**
  // Note: Currently not implemented in backend, but prepared for future
  static async updateUser(userId, payload) {
    try {
      const response = await API.put(`/users/${userId}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Failed to update user");
    }
  }

  // ❌ **DELETE: Delete user account**
  // Note: Currently not implemented in backend, but prepared for future
  static async deleteUser(userId) {
    try {
      const response = await API.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Failed to delete user");
    }
  }

  // 👁️ **GET: Get user profile**
  // Note: Currently not implemented in backend, but prepared for future
  static async getUser(userId) {
    try {
      const response = await API.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Failed to fetch user");
    }
  }

  // 🔍 **GET: Search users**
  // Note: Currently not implemented in backend, but prepared for future
  static async searchUsers(searchParams) {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await API.get(`/users/search?${queryString}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Failed to search users");
    }
  }

  // 🔐 **GET: Get current user profile**
  // This would get the currently logged-in user's data
  static async getCurrentUser() {
    try {
      const response = await API.get("/users/me");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch current user"
      );
    }
  }
}

export default UserApi;
