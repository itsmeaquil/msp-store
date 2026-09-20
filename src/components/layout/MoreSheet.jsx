// src/components/layout/MoreSheet.jsx
// iOS-style action sheet for admin access, appearance, and quick contact actions.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, MessageCircle, Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useStoreSettings } from '../../hooks/useStoreSettings';

const THEME_OPTIONS = [
  { value: 'system', label: 'Auto',  icon: Smartphone },
  { value: 'light',  label: 'Light', icon: Sun        },
  { value: 'dark',   label: 'Dark',  icon: Moon       },
];

export default function MoreSheet({ onClose }) {
  const { theme, setTheme } = useTheme();
  const { settings } = useStoreSettings();
  const waNumber = (settings.contactWhatsApp || '').replace(/\D/g, '');
  const phone    = settings.phone || settings.contactWhatsApp;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="sheet-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="More options">
      <div className="sheet-content" onClick={e => e.stopPropagation()}>
        <div className="sheet-grabber" />

        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', padding: '0 6px', marginBottom: 4 }}>
          Appearance
        </p>
        <div className="segmented-control" style={{ marginBottom: 20 }}>
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`segmented-option ${theme === value ? 'active' : ''}`}
              onClick={() => setTheme(value)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <Link to="/admin" className="sheet-row" onClick={onClose}>
          <ShieldCheck size={20} style={{ color: 'var(--color-brand-primary)' }} />
          Admin Portal
        </Link>

        <a href={`tel:${phone}`} className="sheet-row">
          <Phone size={20} style={{ color: 'var(--ios-blue)' }} />
          Call the Shop
        </a>

        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${settings.shopName}! I need help with my phone. 👋`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="sheet-row"
        >
          <MessageCircle size={20} style={{ color: '#25D366' }} />
          WhatsApp Us
        </a>

        <button type="button" className="btn btn-ghost" onClick={onClose} style={{ width: '100%', marginTop: 12 }}>
          Close
        </button>
      </div>
    </div>
  );
}
