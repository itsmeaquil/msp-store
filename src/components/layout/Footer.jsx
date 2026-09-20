import { Link } from 'react-router-dom';
import { Zap, Heart, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useStoreSettings } from '../../hooks/useStoreSettings';

const QUICK_LINKS = [
  { to: '/',            label: 'Repair Estimator' },
  { to: '/tracker',     label: 'Track My Repair'  },
  { to: '/accessories', label: 'Accessories'      },
  { to: '/contact',     label: 'Store Locator'    },
];

const linkStyle = {
  color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.85rem',
  display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s',
};

export default function Footer() {
  const year = new Date().getFullYear();
  const { settings } = useStoreSettings();
  const waNum   = settings.contactWhatsApp;
  const waClean = (waNum || '').replace(/\D/g, '');

  return (
    <footer style={{
      background: 'var(--color-bg-secondary)',
      borderTop: '1px solid var(--color-border)',
      padding: '24px 0 16px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, marginBottom: 16,
        }}>
          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={14} color="#fff" />
            </div>
            <span className="font-display" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Mobile Service <span className="gradient-text">Point</span>
            </span>
          </Link>

          {/* Quick links — inline */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 18px' }}>
            {QUICK_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={linkStyle}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Contact — inline icons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px' }}>
            <a href={`tel:${waNum}`} style={linkStyle} title="Call us">
              <Phone size={14} /> {waNum}
            </a>
            <a href={`https://wa.me/${waClean}`} target="_blank" rel="noopener noreferrer"
              style={{ ...linkStyle, color: '#25D366' }} title="WhatsApp us"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
            <a href={settings.googleMapsUrl} target="_blank" rel="noopener noreferrer"
              style={linkStyle} title={settings.address}
            >
              <MapPin size={14} /> Directions
            </a>
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 12 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
            © {year} {settings.shopName || 'Mobile Service Point'}. All rights reserved.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            Made with <Heart size={11} style={{ color: 'var(--color-brand-secondary)' }} /> for local businesses
          </p>
        </div>
      </div>
    </footer>
  );
}
