// src/components/ui/LoadingSpinner.jsx
export default function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        border: '2px solid rgba(255,255,255,0.1)',
        borderTop: '2px solid var(--color-brand-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
