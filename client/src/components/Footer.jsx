import { Link } from "react-router-dom";
import { MartiniIcon } from "@phosphor-icons/react";

const Footer = () => {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
        <p className="flex items-center gap-2">
          <MartiniIcon size={18} weight="fill" className="text-accent" aria-hidden="true" />
          <span>Ginny — Personal Bartender</span>
        </p>
        <nav className="flex items-center gap-5">
          <Link to="/recipes" className="transition-colors hover:text-ink">
            Recipes
          </Link>
          <Link to="/cocktail-of-the-day" className="transition-colors hover:text-ink">
            Cocktail of the Day
          </Link>
          <Link to="/available" className="transition-colors hover:text-ink">
            What Can I Make?
          </Link>
        </nav>
        <p className="text-muted/70">© {new Date().getFullYear()} Ginny</p>
      </div>
    </footer>
  );
};

export default Footer;
