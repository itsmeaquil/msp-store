// src/components/accessories/AccessoryModal.jsx
// Product detail modal with image zoom and WhatsApp inquiry CTA
import { useEffect } from 'react';
import { X, MessageCircle, ShoppingBag, Heart, CheckCircle, XCircle } from 'lucide-react';
import { useStoreSettings } from '../../hooks/useStoreSettings';

export default function AccessoryModal({ accessory, onClose, isFavorite, onToggleFavorite }) {
  const { name, category, price, imageUrl, description, stockStatus } = accessory;
  const { settings } = useStoreSettings();
  const waNumber = (settings.contactWhatsApp || '').replace(/\D/g, '');

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi ${settings.shopName}! 👋\n\nI'm interested in the following accessory:\n` +
      `🛍️ Product: ${name}\n` +
      `📂 Category: ${category}\n` +
      `💰 Price: ₹${Number(price).toLocaleString('en-IN')}\n\n` +
      `Is it available? Please confirm. Thank you!`
    );
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={name}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Image */}
        <div style={{ position: 'relative', background: 'var(--color-bg-primary)', borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--gradient-card)',
            }}>
              <ShoppingBag size={60} style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
          {/* Close button */}
          <button
            onClick={onClose}
            className="fav-btn"
            style={{ position: 'absolute', top: 16, right: 16 }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Favorite toggle */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`fav-btn ${isFavorite ? 'active' : ''}`}
              style={{ position: 'absolute', top: 16, right: 62 }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {/* Category + stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className="badge badge-brand">{category}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem',
              color: stockStatus ? 'var(--color-brand-success)' : 'var(--color-brand-secondary)' }}>
              {stockStatus ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {stockStatus ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>

          <h2 style={{ fontSize: '1.3rem', marginBottom: 8, lineHeight: 1.3 }}>{name}</h2>

          <p className="gradient-text font-display" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 16 }}>
            ₹{Number(price).toLocaleString('en-IN')}
          </p>

          {description && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 24 }}>
              {description}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              className="btn btn-whatsapp btn-lg"
              onClick={handleWhatsApp}
              disabled={!stockStatus}
              style={{ width: '100%', opacity: stockStatus ? 1 : 0.5 }}
              id={`inquire-wa-${accessory.id}`}
            >
              <MessageCircle size={20} />
              {stockStatus ? 'Reserve / Inquire via WhatsApp' : 'Currently Unavailable'}
            </button>
            <button className="btn btn-ghost" onClick={onClose} style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
