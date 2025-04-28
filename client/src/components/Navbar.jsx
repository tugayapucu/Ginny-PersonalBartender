import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{
      backgroundColor: "#333",
      padding: "1rem",
      display: "flex",
      justifyContent: "space-around",
      color: "white"
    }}>
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
      <Link to="/recipes" style={{ color: "white", textDecoration: "none" }}>Recipes</Link>
      <Link to="/available" style={{ color: "white", textDecoration: "none" }}>What Can I Make?</Link>
      <Link to="/favorites" style={{ color: "white", textDecoration: "none" }}>Favorites</Link>
    </nav>
  );
};

export default Navbar;
