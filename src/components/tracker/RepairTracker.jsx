// src/components/tracker/RepairTracker.jsx
// Live Firestore repair ticket status tracker with animated timeline
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, AlertCircle, Package, Truck, Wrench, RefreshCw } from 'lucide-react';
import { useRepairTicket } from '../../hooks/useRepairTicket';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import Badge, { statusVariant } from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';

const STATUSES = [
  { key: 'Received',         label: 'Received',          icon: Package,     desc: 'Your device has been received at our shop.' },
  { key: 'Diagnosing',       label: 'Diagnosing',         icon: Search,      desc: 'Our technician is assessing the issue.' },
  { key: 'In-Progress',      label: 'Repair In Progress', icon: Wrench,      desc: 'We are actively working on your device.' },
  { key: 'Ready for Pickup', label: 'Ready for Pickup',   icon: CheckCircle, desc: 'Your device is repaired and ready!' },
  { key: 'Delivered',        label: 'Delivered',          icon: Truck,       desc: 'Device has been delivered. All done! 🎉' },
];

function getStatusIndex(status) {
  return STATUSES.findIndex(s => s.key === status);
}

function TimelineStep({ step, index, currentIndex }) {
  const isCompleted = index < currentIndex;
  const isActive    = index === currentIndex;
  const isPending   = index > currentIndex;
  const Icon        = step.icon;

  return (
    <div>
      <div className="timeline-step">
        {/* Dot */}
        <div className={`timeline-dot ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`}>
          {isCompleted ? (
            <CheckCircle size={18} color="#fff" />
          ) : (
            <Icon size={18} color={isActive ? '#fff' : 'var(--color-text-muted)'} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <p style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isPending ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            }}>
              {step.label}
            </p>
            {isActive && (
              <span style={{
                padding: '2px 8px', borderRadius: 999,
                background: 'rgba(255,107,107,0.15)',
                color: 'var(--color-brand-secondary)',
                fontSize: '0.7rem', fontWeight: 700,
                border: '1px solid rgba(255,107,107,0.3)',
              }}>
                CURRENT
              </span>
            )}
            {isCompleted && (
              <span style={{
                padding: '2px 8px', borderRadius: 999,
                background: 'rgba(0,229,160,0.1)',
                color: 'var(--color-brand-success)',
                fontSize: '0.7rem', fontWeight: 600,
              }}>
                ✓ Done
              </span>
            )}
          </div>
          <p style={{
            color: isPending ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
            fontSize: '0.8rem',
          }}>
            {step.desc}
          </p>
        </div>
      </div>

      {/* Connector line */}
      {index < STATUSES.length - 1 && (
        <div className={`timeline-line ${isCompleted ? 'completed' : ''}`} />
      )}
    </div>
  );
}

function TicketCard({ ticket }) {
  const { settings }  = useStoreSettings();
  const currentIndex = getStatusIndex(ticket.status);
  const progressPct  = ((currentIndex + 1) / STATUSES.length) * 100;
  const waNumber     = (settings.contactWhatsApp || '').replace(/\D/g, '');

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ marginTop: 24 }}>
      {/* Ticket header */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Ticket ID
            </p>
            <p className="gradient-text font-display" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {ticket.ticketId}
            </p>
          </div>
          <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Repair Progress</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
              {Math.round(progressPct)}%
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: 'var(--gradient-brand)',
              borderRadius: 99,
              transition: 'width 0.6s ease',
              boxShadow: 'var(--shadow-glow-brand)',
            }} />
          </div>
        </div>

        {/* Device details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: 'Customer', value: ticket.customerName },
            { label: 'Device',   value: ticket.deviceModel  },
            { label: 'Issue',    value: ticket.issue        },
            { label: 'Estimate', value: ticket.costEstimate ? `₹${ticket.costEstimate}` : 'Pending diagnosis' },
            { label: 'Received', value: formatDate(ticket.createdAt) },
            { label: 'Updated',  value: formatDate(ticket.updatedAt) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
              <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
        <h4 style={{ marginBottom: 20, fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Repair Timeline
        </h4>
        {STATUSES.map((s, i) => (
          <TimelineStep key={s.key} step={s} index={i} currentIndex={currentIndex} />
        ))}
      </div>

      {/* WhatsApp CTA */}
      <a
        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi! I'm enquiring about my repair ticket: ${ticket.ticketId} (${ticket.deviceModel}). Current status: ${ticket.status}.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-whatsapp"
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Ask About My Repair on WhatsApp
      </a>
    </div>
  );
}

export default function RepairTracker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkId = searchParams.get('id') || '';

  const [inputId,   setInputId]   = useState(deepLinkId);
  const [searchId,  setSearchId]  = useState(deepLinkId.trim().toUpperCase());

  const { ticket, loading, error } = useRepairTicket(searchId);

  // Header search can deep-link here via /tracker?id=REP-1001 — auto-run once, then clear the param.
  useEffect(() => {
    if (!deepLinkId) return;
    setSearchParams(prev => { prev.delete('id'); return prev; }, { replace: true });
  }, [deepLinkId, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = inputId.trim().toUpperCase();
    if (!trimmed) return;
    setSearchId(trimmed);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Search form */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(0,217,255,0.15)' }}>
            <Search size={22} style={{ color: 'var(--color-brand-accent)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>Track Your Repair</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              Enter the ticket ID we gave you at drop-off
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
          <input
            id="ticket-id-input"
            type="text"
            className="input"
            placeholder="e.g. REP-1042"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            style={{ flex: 1, textTransform: 'uppercase' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} id="track-repair-btn">
            {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
            <span className="hide-mobile">Track</span>
          </button>
        </form>

        {!searchId && (
          <p style={{ marginTop: 12, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            💡 Your ticket ID was printed on your drop-off receipt (e.g., REP-1042)
          </p>
        )}
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <LoadingSpinner size={40} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Fetching your repair status...</p>
        </div>
      )}

      {!loading && error && (
        <div style={{
          marginTop: 20, padding: 24, borderRadius: 16,
          background: 'rgba(255,107,107,0.1)',
          border: '1px solid rgba(255,107,107,0.2)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <AlertCircle size={24} style={{ color: 'var(--color-brand-secondary)', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Ticket Not Found</p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{error}</p>
          </div>
        </div>
      )}

      {!loading && ticket && <TicketCard ticket={ticket} />}
    </div>
  );
}
