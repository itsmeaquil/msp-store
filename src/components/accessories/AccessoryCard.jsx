// src/components/accessories/AccessoryCard.jsx
import { ShoppingBag, Heart, CheckCircle, XCircle } from 'lucide-react';

export default function AccessoryCard({ accessory, onClick, isFavorite, onToggleFavorite }) {
  const { name, category, price, imageUrl, stockStatus } = accessory;

  return (
    <div className="product-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{ cursor: 'pointer' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1', background: 'var(--color-bg-secondary)' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="product-card-img"
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div style={{
          display: imageUrl ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%',
          background: 'var(--gradient-card)',
        }}>
          <ShoppingBag size={40} style={{ color: 'var(--color-text-muted)' }} />
        </div>

        {/* Favorite toggle */}
        {onToggleFavorite && (
          <button
            type="button"
            className={`fav-btn ${isFavorite ? 'active' : ''}`}
            style={{ position: 'absolute', bottom: 10, right: 10 }}
            onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
          >
            <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Stock badge overlay */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          {stockStatus ? (
            <span className="badge badge-success" style={{ backdropFilter: 'blur(8px)' }}>In Stock</span>
          ) : (
            <span className="badge badge-danger" style={{ backdropFilter: 'blur(8px)' }}>Out of Stock</span>
          )}
        </div>

        {/* Category tag */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{
            padding: '3px 8px', borderRadius: 999,
            background: 'var(--gradient-shop)',
            color: '#fff', fontSize: '0.65rem', fontWeight: 600,
            backdropFilter: 'blur(8px)',
          }}>{category}</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '16px' }}>
        <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 8, lineHeight: 1.3 }}>{name}</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="gradient-text font-display" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            ₹{Number(price).toLocaleString('en-IN')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: stockStatus ? 'var(--color-brand-success)' : 'var(--color-brand-secondary)', fontSize: '0.75rem' }}>
            {stockStatus ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {stockStatus ? 'Available' : 'Unavailable'}
          </div>
        </div>
      </div>
    </div>
  );
}
