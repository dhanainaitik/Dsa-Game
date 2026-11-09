import { Link } from 'react-router-dom';
import { Map, FlaskConical, Swords, ShoppingCart, BookOpen, Globe, User, HelpCircle } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src="/CodoLvling.webp" alt="Codo Lvling" />
          </Link>
          <p className="footer-tagline">
            Level up your logic. Master the shadows of algorithms and data structures.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-link"><Globe size={18} /></a>
            <a href="#" className="social-link"><User size={18} /></a>
            <a href="#" className="social-link"><HelpCircle size={18} /></a>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h4>Platform</h4>
            <div className="footer-links">
               <Link to="/map"><Map size={14} /> World Map</Link>
               <Link to="/logic-lab"><FlaskConical size={14} /> Logic Lab</Link>
               <Link to="/pvp"><Swords size={14} /> Arena</Link>
               <Link to="/shop"><ShoppingCart size={14} /> Item Shop</Link>
               <Link to="/docs"><BookOpen size={14} /> Codex</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <div className="footer-links">
               <a href="#">Help Center</a>
               <a href="#">Community</a>
               <a href="#">Feedback</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>&copy; {currentYear} Codo Leveling. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
