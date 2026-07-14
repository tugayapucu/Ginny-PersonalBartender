import { useCallback, useEffect, useMemo, useState } from "react";
import { getMeRequest } from "../api";
import AuthContext from "./authContext";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [authStatus, setAuthStatus] = useState(() =>
    localStorage.getItem("token") ? "checking" : "unauthenticated"
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");

  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setAuthError("");
    setAuthStatus("checking");
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setAuthError("");
    setAuthStatus("unauthenticated");
    setToken(null);
  }, []);

  const refreshSession = useCallback(
    async (tokenToValidate = token) => {
      if (!tokenToValidate) {
        setCurrentUser(null);
        setAuthError("");
        setAuthStatus("unauthenticated");
        return;
      }

      setAuthError("");
      setAuthStatus("checking");

      try {
        const response = await getMeRequest(tokenToValidate);
        setCurrentUser(response.data);
        setAuthStatus("authenticated");
      } catch (error) {
        const statusCode = error.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          localStorage.removeItem("token");
          setToken(null);
          setCurrentUser(null);
          setAuthStatus("unauthenticated");
          return;
        }

        setCurrentUser(null);
        setAuthError("Unable to verify your session right now.");
        setAuthStatus("error");
      }
    },
    [token]
  );

  useEffect(() => {
    const listener = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      token,
      login,
      logout,
      refreshSession,
      currentUser,
      authError,
      authStatus,
      isAuthenticated: authStatus === "authenticated",
      isCheckingAuth: authStatus === "checking",
    }),
    [token, login, logout, refreshSession, currentUser, authError, authStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
