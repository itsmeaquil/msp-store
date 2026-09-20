// src/components/contact/StoreLocator.jsx
import { MapPin, Phone, Clock, MessageCircle, Navigation } from 'lucide-react';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function StoreLocator() {
  const { settings, loading } = useStoreSettings();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <LoadingSpinner size={40} />
      </div>
    );
  }

  const { shopName, ownerName, address, contactWhatsApp, phone, googleMapsUrl, openingHours } = settings;
  const cleanWa    = (contactWhatsApp || '').replace(/\D/g, '');
  const waText     = encodeURIComponent(`Hi ${shopName}! I'd like to visit your store.`);
  const isOpen     = (() => {
    const now   = new Date();
    const day   = now.getDay(); // 0=Sun
    const hour  = now.getHours();
    // Simple heuristic: Mon-Sat 10-20, Sun 11-18
    if (day >= 1 && day <= 6) return hour >= 10 && hour < 20;
    return hour >= 11 && hour < 18;
  })();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
      {/* Info card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Status banner */}
        <div style={{
          padding: '12px 20px',
          borderRadius: 'var(--radius-lg)',
          background: isOpen ? 'rgba(0,229,160,0.1)' : 'rgba(255,107,107,0.1)',
          border: `1px solid ${isOpen ? 'rgba(0,229,160,0.3)' : 'rgba(255,107,107,0.3)'}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: isOpen ? 'var(--color-brand-success)' : 'var(--color-brand-secondary)',
            boxShadow: `0 0 8px ${isOpen ? 'var(--color-brand-success)' : 'var(--color-brand-secondary)'}`,
            animation: isOpen ? 'pulse-dot 2s infinite' : 'none',
          }} />
          <span style={{ fontWeight: 600, color: isOpen ? 'var(--color-brand-success)' : 'var(--color-brand-secondary)' }}>
            {isOpen ? 'We\'re Open Now!' : 'Currently Closed'}
          </span>
        </div>

        {/* Address */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ padding: 10, borderRadius: 10, background: 'rgba(108,99,255,0.15)', height: 'fit-content' }}>
              <MapPin size={20} style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <div>
              <h4 style={{ marginBottom: 6 }}>{shopName}</h4>
              {ownerName && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>
                  Owner: {ownerName}
                </p>
              )}
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{address}</p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ marginTop: 12, gap: 6 }}
              >
                <Navigation size={14} />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Contact Us
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a
              href={`tel:${phone || contactWhatsApp}`}
              className="btn btn-outline"
              style={{ justifyContent: 'flex-start', gap: 12 }}
            >
              <Phone size={18} style={{ color: 'var(--color-brand-primary)' }} />
              {phone || contactWhatsApp}
            </a>
            <a
              href={`https://wa.me/${cleanWa}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ justifyContent: 'flex-start', gap: 12 }}
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Opening hours */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ padding: 10, borderRadius: 10, background: 'rgba(0,217,255,0.15)', height: 'fit-content' }}>
              <Clock size={20} style={{ color: 'var(--color-brand-accent)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: 14 }}>Opening Hours</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(openingHours || {}).map(([day, hours]) => (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{day}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map embed */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={16} style={{ color: 'var(--color-brand-primary)' }} />
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Find Us on Map</span>
        </div>
        <iframe
          src="https://maps.google.com/maps?cid=11948525200078409831&output=embed"
          width="100%"
          height="400"
          style={{ border: 0, flex: 1, minHeight: 300 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mobile Service Point location on Google Maps"
        />
      </div>
    </div>
  );
}
