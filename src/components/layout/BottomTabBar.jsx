// src/components/layout/BottomTabBar.jsx
// Fixed iOS-style glass tab bar — primary navigation on mobile/tablet.
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingBag, MapPin, MoreHorizontal } from 'lucide-react';
import MoreSheet from './MoreSheet';

const TABS = [
  { to: '/',            label: 'Home',    icon: Home,        accent: 'var(--ios-indigo)' },
  { to: '/tracker',     label: 'Track',   icon: Search,      accent: 'var(--ios-blue)'   },
  { to: '/accessories', label: 'Shop',    icon: ShoppingBag, accent: 'var(--ios-pink)'   },
  { to: '/contact',     label: 'Contact', icon: MapPin,      accent: 'var(--ios-green)'  },
];

export default function BottomTabBar() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="bottom-tab-bar" aria-label="Primary">
        {TABS.map(({ to, label, icon: Icon, accent }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
            style={{ '--tab-accent': accent }}
          >
            <span className="bottom-tab-icon-wrap">
              <Icon size={22} strokeWidth={2.25} />
            </span>
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          className="bottom-tab"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          id="bottom-tab-more"
        >
          <span className="bottom-tab-icon-wrap">
            <MoreHorizontal size={22} strokeWidth={2.25} />
          </span>
          More
        </button>
      </nav>

      {moreOpen && <MoreSheet onClose={() => setMoreOpen(false)} />}
    </>
  );
}
