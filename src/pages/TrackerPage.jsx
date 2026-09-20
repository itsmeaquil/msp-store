// src/pages/TrackerPage.jsx
import { Search } from 'lucide-react';
import RepairTracker from '../components/tracker/RepairTracker';

export default function TrackerPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: 'var(--header-clearance)' }}>
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          {/* Page header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 20px', borderRadius: 999,
              background: 'rgba(0,217,255,0.1)',
              border: '1px solid rgba(0,217,255,0.3)',
              marginBottom: 20,
            }}>
              <Search size={16} style={{ color: 'var(--color-brand-accent)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brand-accent)' }}>
                Live Repair Tracking
              </span>
            </div>
            <h1 className="section-title">
              Track Your <span className="gradient-text">Repair</span>
            </h1>
            <p className="section-subtitle" style={{ margin: '12px auto 0' }}>
              Enter your ticket ID to see real-time updates on your device's repair status.
            </p>
          </div>

          <RepairTracker />
        </div>
      </section>
    </main>
  );
}
