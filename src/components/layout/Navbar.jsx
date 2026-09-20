// src/components/layout/Navbar.jsx
// Always-glass sticky header with integrated search. Mobile navigation lives
// in the bottom tab bar now, so this no longer needs a hamburger drawer.
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShieldCheck, Zap } from 'lucide-react';
import HeaderSearch from './HeaderSearch';

const NAV_LINKS = [
  { to: '/',            label: 'Repair Estimator' },
  { to: '/tracker',     label: 'Track Repair'     },
  { to: '/accessories', label: 'Accessories'      },
  { to: '/contact',     label: 'Contact'          },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 16 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-brand)',
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <span className="font-display hide-mobile" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
            Mobile Service <span className="gradient-text">Point</span>
          </span>
        </Link>

        {/* Search — visible at all breakpoints */}
        <div className="header-search-wrap">
          <HeaderSearch />
        </div>

        {/* Desktop links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'rgba(108,99,255,0.1)' : 'transparent',
                transition: 'all 0.2s ease',
              })}
            >
              {label}
            </NavLink>
          ))}
          <Link to="/admin" className="btn btn-outline btn-sm" style={{ marginLeft: 12 }}>
            <ShieldCheck size={14} /> Admin
          </Link>
        </div>

        {/* Mobile: quick admin access icon, mirrors the search icon button */}
        <Link to="/admin" className="header-icon-btn hide-desktop" aria-label="Admin Portal">
          <ShieldCheck size={17} />
        </Link>
      </div>
    </nav>
  );
}
