import API from "./config";

// 🔐 **AUTHENTICATION SERVICE - Login/Logout/Password Management**
// This handles all authentication-related API calls

class AuthApi {
  // 🚪 **POST: User login**
  // Used in: Login page, useAuth hook
  static async login(loginParams) {
    try {
      const response = await API.post("/auth/login", {
        email: loginParams.email,
        password: loginParams.password,
      });

      // Store token in localStorage for persistence
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  }

  // 🚪 **POST: User logout**
  // Note: Currently handled client-side, but prepared for server-side logout
  static async logout() {
    try {
      // Remove token from localStorage
      localStorage.removeItem("token");

      // Optional: Call server to invalidate token
      // await API.post('/auth/logout');

      return { message: "Logged out successfully" };
    } catch (error) {
      // Even if server call fails, we still log out client-side
      localStorage.removeItem("token");
      throw new Error("Logout failed");
    }
  }

  // 📧 **POST: Reset password request**
  // Note: Currently not implemented in backend, but prepared for future
  static async resetPassword(email) {
    try {
      const response = await API.post("/auth/reset-password", { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to send reset email"
      );
    }
  }

  // 🔑 **POST: Set new password**
  // Note: Currently not implemented in backend, but prepared for future
  static async setPassword(token, newPassword) {
    try {
      const response = await API.post("/auth/set-password", {
        token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to set new password"
      );
    }
  }

  // ✅ **GET: Verify token validity**
  // Used to check if user is still authenticated
  static async verifyToken() {
    try {
      const response = await API.get("/auth/verify");
      return response.data;
    } catch (error) {
      // If token is invalid, remove it
      localStorage.removeItem("token");
      throw new Error("Token is invalid");
    }
  }

  // 🔄 **POST: Refresh access token**
  // Note: Currently not implemented, but prepared for future JWT refresh
  static async refreshToken(refreshToken) {
    try {
      const response = await API.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || "Failed to refresh token"
      );
    }
  }
}

export default AuthApi;
