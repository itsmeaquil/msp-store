// src/components/ui/ConfirmDialog.jsx
// Glass replacement for window.confirm() so destructive actions match the app theme.
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel} role="alertdialog" aria-modal="true" aria-label={title}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(255,107,107,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <AlertTriangle size={24} style={{ color: 'var(--color-brand-secondary)' }} />
        </div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{title}</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
          <button
            className="btn"
            onClick={onConfirm}
            style={{ flex: 1, background: 'var(--color-brand-secondary)', color: '#fff' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
