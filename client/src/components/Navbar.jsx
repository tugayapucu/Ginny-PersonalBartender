import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">
        Ginny 🍸
      </Link>

      <div className="flex gap-4 items-center justify-center">
        <Link to="/available">What Can I Make?</Link>
        <Link to="/recipes">Recipes</Link>
        <Link to="/favorites">Favorites</Link>

        {!isAuthenticated ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="hover:underline">
            Logout
          </button>
        )}

        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
