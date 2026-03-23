import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMeRequest } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authStatus, setAuthStatus] = useState(() =>
    localStorage.getItem('token') ? 'checking' : 'unauthenticated'
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');

  const login = useCallback((newToken) => {
    localStorage.setItem('token', newToken);
    setAuthError('');
    setAuthStatus('checking');
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setAuthError('');
    setAuthStatus('unauthenticated');
    setToken(null);
  }, []);

  const refreshSession = useCallback(async (tokenToValidate = token) => {
    if (!tokenToValidate) {
      setCurrentUser(null);
      setAuthError('');
      setAuthStatus('unauthenticated');
      return;
    }

    setAuthError('');
    setAuthStatus('checking');

    try {
      const res = await getMeRequest(tokenToValidate);
      setCurrentUser(res.data);
      setAuthStatus('authenticated');
    } catch (err) {
      const statusCode = err.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
        return;
      }

      setCurrentUser(null);
      setAuthError('Unable to verify your session right now.');
      setAuthStatus('error');
    }
  }, [token]);

  useEffect(() => {
    const listener = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
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
      isAuthenticated: authStatus === 'authenticated',
      isCheckingAuth: authStatus === 'checking',
    }),
    [token, login, logout, refreshSession, currentUser, authError, authStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
