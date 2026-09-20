// src/pages/ContactPage.jsx
import { MapPin } from 'lucide-react';
import StoreLocator from '../components/contact/StoreLocator';

export default function ContactPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: 'var(--header-clearance)' }}>
      <section className="section">
        <div className="container">
          {/* Page header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 20px', borderRadius: 999,
              background: 'rgba(0,229,160,0.1)',
              border: '1px solid rgba(0,229,160,0.3)',
              marginBottom: 20,
            }}>
              <MapPin size={16} style={{ color: 'var(--color-brand-success)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brand-success)' }}>
                Find Us
              </span>
            </div>
            <h1 className="section-title">
              Visit Our <span className="gradient-text">Store</span>
            </h1>
            <p className="section-subtitle" style={{ marginTop: 12 }}>
              Drop in, call, or WhatsApp us — we're here to help you get your device back to life.
            </p>
          </div>

          <StoreLocator />
        </div>
      </section>
    </main>
  );
}
