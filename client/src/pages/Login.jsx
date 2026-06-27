import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion as Motion } from "motion/react";
import useAuth from '../hooks/useAuth';
import { loginRequest } from "../api";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await loginRequest({ email, password });
      login(res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-5 py-12">
      <Motion.form
        onSubmit={handleLogin}
        className="card w-full max-w-md p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow mb-3 text-center">Welcome back</p>
        <h2 className="mb-6 text-center text-3xl">Login</h2>

        {error && (
          <p className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-2.5 text-center text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="field-label">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          Log in
        </button>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </Motion.form>
    </div>
  );
};

export default Login;
