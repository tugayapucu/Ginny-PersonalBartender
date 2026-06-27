import { useCallback, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { SunIcon, MoonIcon, DesktopIcon } from "@phosphor-icons/react";
import {
  changePasswordRequest,
  deleteAccountRequest,
  disableAccountRequest,
  getMeRequest,
  updateMeRequest,
  updatePreferencesRequest,
} from "../api";

const Settings = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "system"
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const passwordRule =
    "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const handleThemeChange = useCallback(async (newTheme, persist = true) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "light") {
      document.body.classList.add("light-mode");
    } else if (newTheme === "dark") {
      document.body.classList.remove("light-mode");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.body.classList.toggle("light-mode", !prefersDark);
    }

    if (persist && token) {
      try {
        await updatePreferencesRequest(token, newTheme);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to save theme");
      }
    }
  }, [token]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        return;
      }
      try {
        const res = await getMeRequest(token);
        setUsername(res.data.username || "");
        setEmail(res.data.email || "");
        if (res.data.theme) {
          handleThemeChange(res.data.theme, false);
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load profile");
      }
    };

    loadProfile();
  }, [token, handleThemeChange]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const payload = {};
    if (username.trim()) {
      payload.username = username.trim();
    }
    if (email.trim()) {
      payload.email = email.trim();
    }
    if (Object.keys(payload).length === 0) {
      setError("Provide a username or email to update");
      return;
    }
    try {
      const res = await updateMeRequest(token, payload);
      setUsername(res.data.username || "");
      setEmail(res.data.email || "");
      setMessage("Profile updated");
    } catch (err) {
      setError(err.response?.data?.detail || "Profile update failed");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!currentPassword || !newPassword) {
      setError("Both current and new password are required");
      return;
    }
    if (!passwordPattern.test(newPassword)) {
      setError(passwordRule);
      return;
    }
    try {
      await changePasswordRequest(token, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated");
    } catch (err) {
      setError(err.response?.data?.detail || "Password update failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }
    setMessage("");
    setError("");
    try {
      await deleteAccountRequest(token);
      logout();
      navigate("/register");
    } catch (err) {
      setError(err.response?.data?.detail || "Account deletion failed");
    }
  };

  const handleDisableAccount = async () => {
    if (!window.confirm("Are you sure you want to disable your account?")) {
      return;
    }
    setMessage("");
    setError("");
    try {
      await disableAccountRequest(token);
      logout();
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Account disable failed");
    }
  };

  const themeOptions = [
    { value: "light", Icon: SunIcon, label: "Light" },
    { value: "dark", Icon: MoonIcon, label: "Dark" },
    { value: "system", Icon: DesktopIcon, label: "System" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8">
        <p className="eyebrow mb-3">Account</p>
        <h1 className="text-4xl md:text-5xl">Settings</h1>
      </div>

      {message && (
        <p className="mb-4 rounded-lg border border-success/40 bg-success/10 px-4 py-2.5 text-center text-sm text-success">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-2.5 text-center text-sm text-danger">
          {error}
        </p>
      )}

      <section className="card mb-6 p-6">
        <h3 className="mb-5 text-xl font-semibold">Profile Information</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="field-label">Username</label>
            <input
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter new email"
            />
          </div>
          <button type="submit" className="btn-primary">
            Update profile
          </button>
        </form>
      </section>

      <section className="card mb-6 p-6">
        <h3 className="mb-5 text-xl font-semibold">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="field-label">Current password</label>
            <input
              className="input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">New password</label>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted">{passwordRule}</p>
          </div>
          <button type="submit" className="btn-primary">
            Change password
          </button>
        </form>
      </section>

      <section className="card mb-6 p-6">
        <h3 className="mb-5 text-xl font-semibold">Appearance</h3>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleThemeChange(opt.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                theme === opt.value
                  ? "border-accent bg-accent-soft"
                  : "border-line hover:border-accent/50"
              }`}
            >
              <opt.Icon
                size={24}
                weight={theme === opt.value ? "fill" : "regular"}
                className={theme === opt.value ? "text-accent" : "text-muted"}
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card border-danger/40 p-6">
        <h3 className="mb-2 text-xl font-semibold text-danger">Danger Zone</h3>
        <p className="mb-5 text-sm text-muted">
          Disabling your account temporarily hides your profile. Deleting is
          permanent.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleDisableAccount}
            className="btn-secondary flex-1"
          >
            Disable account
          </button>
          <button onClick={handleDeleteAccount} className="btn-danger flex-1">
            Delete account
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
