import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "motion/react";
import { CheckIcon } from "@phosphor-icons/react";
import { registerRequest } from "../api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const passwordRule =
    "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const isPasswordValid = passwordPattern.test(formData.password);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!passwordPattern.test(formData.password)) {
      setError(passwordRule);
      return;
    }
    try {
      await registerRequest(formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-5 py-12">
      <Motion.form
        onSubmit={handleSubmit}
        className="card w-full max-w-md p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow mb-3 text-center">Join the bar</p>
        <h2 className="mb-6 text-center text-3xl">Create an account</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="reg-username" className="field-label">Username</label>
            <input
              id="reg-username"
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="field-label">Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="field-label">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => setPasswordTouched(true)}
              required
              className="input"
            />
            {(passwordTouched || formData.password.length > 0) && (
              <p
                className={`mt-2 flex items-center gap-1.5 text-xs ${
                  isPasswordValid ? "text-success" : "text-muted"
                }`}
              >
                {isPasswordValid ? (
                  <>
                    <CheckIcon size={14} weight="bold" aria-hidden="true" />
                    Strong password
                  </>
                ) : (
                  passwordRule
                )}
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full">
            Register
          </button>

          {error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2.5 text-center text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </Motion.form>
    </div>
  );
};

export default Register;
