// src/pages/AccessoriesPage.jsx
import { ShoppingBag } from 'lucide-react';
import AccessoriesGrid from '../components/accessories/AccessoriesGrid';

export default function AccessoriesPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: 'var(--header-clearance)' }}>
      <section className="section">
        <div className="container">
          {/* Page header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 20px', borderRadius: 999,
              background: 'rgba(255,55,95,0.1)',
              border: '1px solid rgba(255,55,95,0.3)',
              marginBottom: 20,
            }}>
              <ShoppingBag size={16} style={{ color: 'var(--ios-pink)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ios-pink)' }}>
                Phone Accessories
              </span>
            </div>
            <h1 className="section-title">
              Browse Our <span className="gradient-text">Accessories</span>
            </h1>
            <p className="section-subtitle" style={{ marginTop: 12 }}>
              Premium cases, chargers, cables, screen protectors and more — all at great prices.
            </p>
          </div>

          <AccessoriesGrid />
        </div>
      </section>
    </main>
  );
}
