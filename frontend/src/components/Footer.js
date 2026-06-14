import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__top container">
        <div className="footer__brand">
          <span className="footer__logo">🕊️ NayePankh</span>
          <p className="footer__tagline">
            UP Government, 80G &amp; 12A Registered NGO. Empowering communities
            through education, technology, and compassion since 2020.
          </p>
          <div className="footer__badges">
            <span className="footer__badge">🏛️ UP Govt. Registered</span>
            <span className="footer__badge">✅ 80G Certified</span>
            <span className="footer__badge">✅ 12A Certified</span>
          </div>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Quick Links</h4>
          <ul className="footer__links">
            {[
              { to: "/",          label: "Home"      },
              { to: "/about",     label: "About Us"  },
              { to: "/volunteer", label: "Volunteer" },
              { to: "/donate",    label: "Donate"    },
            ].map(({ to, label }) => (
              <li key={to}><Link to={to} className="footer__link">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Our Mission</h4>
          <ul className="footer__text-list">
            <li>Education for underprivileged children</li>
            <li>Digital literacy &amp; tech skills</li>
            <li>Community welfare programs</li>
            <li>AI-powered volunteer matching</li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Contact</h4>
          <ul className="footer__text-list">
            <li>📧 nayepankh@gmail.com</li>
            <li>🌐 nayepankh.com</li>
            <li>📍 Uttar Pradesh, India</li>
          </ul>
          <Link to="/donate" className="btn btn-primary btn-sm footer__donate-btn">
            Support Us
          </Link>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            © {new Date().getFullYear()} NayePankh Foundation. All rights reserved.
          </p>
          <p className="footer__sub">Built with ❤️ to change lives</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
