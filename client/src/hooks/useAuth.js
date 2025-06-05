import { useEffect, useState } from 'react';

export default function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    const listener = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  return { token, login, logout, isAuthenticated: !!token };
}
