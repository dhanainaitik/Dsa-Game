import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, ShoppingCart, Zap, Swords, LayoutDashboard, LogIn, Trophy, Users, Sun, Moon, Flame } from 'lucide-react';
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useProgress } from '../../context/ProgressContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/',             label: 'Home',        icon: Zap },
  { path: '/map',          label: 'World Map',   icon: Map },
  { path: '/pvp',          label: 'Arena',       icon: Swords },
  { path: '/leaderboard',  label: 'Leaderboard', icon: Trophy },
  { path: '/community',    label: 'Community',   icon: Users },
  { path: '/shop',         label: 'Shop',        icon: ShoppingCart },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { progress } = useProgress();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/CodoLvling.webp" alt="Codo" className="navbar-logo-img" style={{ height: 60 }} />
        </Link>

        <SignedIn>
          <nav className="navbar-nav">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const isActive = path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`navbar-link ${isActive ? 'active' : ''}`}
                  title={label}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  <span className="navbar-link-text">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="navbar-right">
            <div className="nav-stats">
              <div className="stat-item tokens" title="Battle Tokens (5 needed for Battle Ground)">
                <Flame size={14} fill="#ef4444" color="#ef4444" />
                <span style={{ color: '#ef4444', fontWeight: 800 }}>{progress.battleTokens || 0}/5</span>
              </div>
              <div className="stat-item coins">
                <Zap size={14} fill="currentColor" />
                <span>{progress.coins?.toLocaleString() || 0}</span>
              </div>
              <div className="stat-item level">
                <span>LVL {progress.level || 1}</span>
              </div>
            </div>

            {/* Dark / Light toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle-btn"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="user-control">
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Dashboard"
                    labelIcon={<LayoutDashboard size={16} />}
                    href="/dashboard"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>
        </SignedIn>

        <SignedOut>
          <div className="navbar-right" style={{ marginLeft: 'auto' }}>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle-btn-guest"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              style={{ padding: '8px 20px', gap: '8px', display: 'flex', alignItems: 'center' }}
            >
              <LogIn size={18} />
              Sign In
            </button>
          </div>
        </SignedOut>
      </div>
    </header>
  );
}
