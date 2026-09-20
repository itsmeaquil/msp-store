// src/components/layout/FloatingActions.jsx
// Persistent floating WhatsApp + Call buttons for mobile screens
import { Phone, MessageCircle } from 'lucide-react';
import { useStoreSettings } from '../../hooks/useStoreSettings';

export default function FloatingActions() {
  const { settings } = useStoreSettings();
  const cleanWa    = (settings.contactWhatsApp || '').replace(/\D/g, '');
  const cleanPhone = settings.phone || settings.contactWhatsApp;
  const waText     = encodeURIComponent(`Hi ${settings.shopName}! I need help with my phone. 👋`);

  return (
    <div className="fab-container" role="group" aria-label="Quick contact actions">
      {/* WhatsApp FAB */}
      <a
        href={`https://wa.me/${cleanWa}?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fab fab-whatsapp"
        aria-label="Chat on WhatsApp"
        title="WhatsApp Us"
      >
        <MessageCircle size={24} color="#fff" />
      </a>

      {/* Call FAB */}
      <a
        href={`tel:${cleanPhone}`}
        className="fab fab-call"
        aria-label="Call us now"
        title="Call Now"
      >
        <Phone size={22} color="#fff" />
      </a>
    </div>
  );
}
