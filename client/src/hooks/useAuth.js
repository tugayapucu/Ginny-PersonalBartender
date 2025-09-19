import { useEffect, useState } from "react";
import { AuthApi } from "../api";

// Authentication Hook
// This manages authentication state with the service/api layer.

export default function useAuth() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await AuthApi.login(credentials);
      setToken(result.access_token);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthApi.logout();
      setToken(null);
      setUser(null);
    } catch (error) {
      // Force logout even if API call fails
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const verifyUserToken = async () => {
      if (token) {
        try {
          await AuthApi.verifyToken();
          // Token is valid, could fetch user data here
        } catch (error) {
          // Token is invalid, clear it
          setToken(null);
        }
      }
    };

    verifyUserToken();
  }, [token]);

  useEffect(() => {
    const listener = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  return {
    token,
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
  };
}
