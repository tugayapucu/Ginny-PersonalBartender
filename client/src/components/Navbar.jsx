import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { motion as Motion, useMotionValueEvent, useScroll } from "motion/react";
import { MartiniIcon } from "@phosphor-icons/react";
import useAuth from "../hooks/useAuth";

// Animated link: keeps the NavLink semantics but layers a shared underline
// that slides between active items via a single layoutId.
const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative py-1 text-sm transition-colors ${
        isActive ? "text-accent" : "text-muted hover:text-ink"
      }`
    }
  >
    {({ isActive }) => (
      <span className="relative">
        {children}
        {isActive && (
          <Motion.span
            layoutId="nav-underline"
            className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </span>
    )}
  </NavLink>
);

const Navbar = () => {
  const { authStatus, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // Hide on scroll-down, reveal on scroll-up — a small premium touch that
  // hands the viewport back to content while reading.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 120);
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Motion.nav
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 border-b border-line bg-canvas/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="group flex items-center gap-2 text-xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <MartiniIcon
            size={22}
            weight="fill"
            className="text-accent transition-transform duration-300 group-hover:-rotate-12"
            aria-hidden="true"
          />
          <span>Ginny</span>
        </Link>

        <div className="flex items-center gap-5">
          <NavItem to="/available">What Can I Make?</NavItem>
          <NavItem to="/recipes">Recipes</NavItem>
          <NavItem to="/favorites">Favorites</NavItem>

          {authStatus === "checking" ? null : !isAuthenticated ? (
            <>
              <NavItem to="/login">Login</NavItem>
              <Link to="/register" className="btn-primary px-4 py-2">
                Register
              </Link>
            </>
          ) : (
            <>
              <NavItem to="/pantry">My Pantry</NavItem>
              <NavItem to="/settings">Settings</NavItem>
              <button
                onClick={handleLogout}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </Motion.nav>
  );
};

export default Navbar;
