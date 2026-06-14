import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar${scrolled ? " navbar--scrolled" : ""}`} role="banner">
      <div className="navbar__inner container">

        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="NayePankh home">
          <span className="navbar__logo-icon">🕊️</span>
          <span className="navbar__logo-text">
            Naye<strong>Pankh</strong>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar__links" aria-label="Main navigation">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `navbar__link${isActive ? " navbar__link--active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <Link to="/donate" className="btn btn-primary btn-sm navbar__cta">
          Donate Now
        </Link>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? " navbar__hamburger--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer${menuOpen ? " navbar__drawer--open" : ""}`} aria-hidden={!menuOpen}>
        <nav className="navbar__drawer-links">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `navbar__drawer-link${isActive ? " navbar__drawer-link--active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link to="/donate" className="btn btn-primary btn-full navbar__drawer-cta">
            Donate Now
          </Link>
        </nav>
      </div>
    </header>
  );
}

const NAV_LINKS = [
  { to: "/",          label: "Home"      },
  { to: "/about",     label: "About Us"  },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/donate",    label: "Donate"    },
];

export default Navbar;
