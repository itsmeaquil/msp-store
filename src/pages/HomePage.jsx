// src/pages/HomePage.jsx
// Hero section + Repair Estimator
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, ShieldCheck, Clock, Star, Wrench, Search, Package } from 'lucide-react';
import RepairEstimator from '../components/estimator/RepairEstimator';
import { useStoreSettings } from '../hooks/useStoreSettings';

export default function HomePage() {
  const { settings } = useStoreSettings();

  const FEATURES = [
    { icon: Clock,       label: 'Same-Day Repairs',  desc: 'Most repairs done within hours'     },
    { icon: ShieldCheck, label: `${settings.warrantyDays}-Day Warranty`, desc: 'Guaranteed quality on all repairs' },
    { icon: Star,        label: 'Expert Technicians', desc: 'Certified & experienced team'       },
    { icon: Zap,         label: 'Best-in-Town Price', desc: 'Transparent pricing, no surprises'  },
  ];

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 40, paddingBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
            {/* Left: Hero copy */}
            <div>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 999,
                background: 'rgba(108,99,255,0.15)',
                border: '1px solid rgba(108,99,255,0.3)',
                marginBottom: 24,
              }}>
                <Zap size={14} style={{ color: 'var(--color-brand-primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
                  Trusted Mobile Repair Shop
                </span>
              </div>

              <h1 className="font-display" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
                Get Your Phone
                <br />
                <span className="gradient-text">Fixed Fast.</span>
                <br />
                <span style={{ color: 'var(--color-text-secondary)' }}>Priced Right.</span>
              </h1>

              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
                Professional screen replacements, battery repairs, and more — with transparent pricing and same-day turnaround on most devices.
              </p>

              {/* CTA row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
                <a href="#estimator" className="btn btn-primary btn-lg">
                  <Wrench size={18} />
                  Get Free Estimate
                  <ArrowRight size={16} />
                </a>
                <Link to="/tracker" className="btn btn-outline btn-lg">
                  <Search size={18} />
                  Track My Repair
                </Link>
              </div>

              {/* Trust row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {[
                  { value: '5000+', label: 'Devices Repaired' },
                  { value: '4.9★',  label: 'Avg Rating'       },
                  { value: `${settings.warrantyDays}-Day`, label: 'Warranty' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="gradient-text font-display" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{value}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Estimator widget preview on desktop */}
            <div className="hide-mobile" style={{
              background: 'rgba(108,99,255,0.05)',
              border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: 24, padding: 32,
              backdropFilter: 'blur(20px)',
            }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                Instant Price Estimator ↓
              </p>
              <RepairEstimator />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Why Choose {settings.shopName}?</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              We're not just another repair shop — we're your device's best friend.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'var(--gradient-brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: 'var(--shadow-glow-brand)',
                }}>
                  <Icon size={24} color="#fff" />
                </div>
                <h4 style={{ marginBottom: 8 }}>{label}</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MOBILE ESTIMATOR (full page section for mobile) ──────────── */}
      <section id="estimator" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="section-title">
              <span className="gradient-text">Instant</span> Repair Estimate
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Select your device and issue to get a price estimate and book via WhatsApp in seconds.
            </p>
          </div>
          <RepairEstimator />
        </div>
      </section>

      {/* ─── QUICK LINKS ──────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)', paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { to: '/tracker',     icon: Search,  title: 'Track Your Repair',  desc: 'Real-time status updates for your device.', color: 'var(--color-brand-accent)' },
              { to: '/accessories', icon: Package, title: 'Browse Accessories', desc: 'Cases, chargers, cables & more.', color: 'var(--color-brand-primary)' },
              { to: '/contact',     icon: Zap,     title: 'Visit Our Store',    desc: 'Find us on the map, check hours.', color: 'var(--color-brand-success)' },
            ].map(({ to, icon: Icon, title, desc, color }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: 24 }}>
                  <Icon size={28} style={{ color, marginBottom: 12 }} />
                  <h4 style={{ marginBottom: 6 }}>{title}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{desc}</p>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4, color, fontSize: '0.85rem', fontWeight: 600 }}>
                    Explore <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
