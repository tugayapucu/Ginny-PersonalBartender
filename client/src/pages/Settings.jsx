import { useState } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

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

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else if (newTheme === "light") {
      document.body.classList.remove("dark-mode");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.body.classList.toggle("dark-mode", prefersDark);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setMessage("Profile update not yet implemented on backend");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setMessage("Password change not yet implemented on backend");
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
    setMessage("Account deletion not yet implemented on backend");
  };

  const handleDisableAccount = async () => {
    if (!window.confirm("Are you sure you want to disable your account?")) {
      return;
    }
    setMessage("");
    setError("");
    setMessage("Account disable not yet implemented on backend");
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Settings</h2>

        {message && (
          <p className="text-green-600 text-center mb-4">{message}</p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">
                Username
              </label>
              <input
                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">Email</label>
              <input
                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter new email"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Profile
            </button>
          </form>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">
                Current Password
              </label>
              <input
                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">
                New Password
              </label>
              <input
                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Change Password
            </button>
          </form>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Appearance</h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                theme === "light"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl block mb-1">☀️</span>
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl block mb-1">🌙</span>
              <span className="text-sm font-medium">Dark</span>
            </button>
            <button
              onClick={() => handleThemeChange("system")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                theme === "system"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl block mb-1">💻</span>
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-red-200">
          <h3 className="text-xl font-semibold mb-4 text-red-600">
            Danger Zone
          </h3>
          <div className="flex gap-4">
            <button
              onClick={handleDisableAccount}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            >
              Disable Account
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete Account
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Disabling your account will temporarily hide your profile. Deleting
            is permanent.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
