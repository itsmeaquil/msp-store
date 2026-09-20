// src/components/ui/Toast.jsx
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };

export default function Toast({ type = 'info', children, onDismiss }) {
  const Icon = ICONS[type] || Info;

  return (
    <div className={`toast toast-${type}`} role="status">
      <Icon size={18} style={{ color: `var(--toast-accent)`, flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1 }}>{children}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0, flexShrink: 0 }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
