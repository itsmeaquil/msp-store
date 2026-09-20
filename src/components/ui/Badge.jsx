// src/components/ui/Badge.jsx
const VARIANTS = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
  brand:   'badge-brand',
};

export default function Badge({ children, variant = 'brand', className = '' }) {
  return (
    <span className={`badge ${VARIANTS[variant] || 'badge-brand'} ${className}`}>
      {children}
    </span>
  );
}

/** Maps repair ticket status string to a badge variant */
export function statusVariant(status) {
  const map = {
    'Received':           'info',
    'Diagnosing':         'warning',
    'In-Progress':        'brand',
    'Ready for Pickup':   'success',
    'Delivered':          'success',
  };
  return map[status] || 'info';
}
