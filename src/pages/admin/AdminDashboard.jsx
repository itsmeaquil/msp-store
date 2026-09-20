// src/pages/admin/AdminDashboard.jsx
// Shop Owner Admin Portal: manage repair tickets + accessories
import { useState, useEffect, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  LogOut, Wrench, ShoppingBag, Plus, Pencil, Trash2,
  Save, X, Package, Ticket, AlertCircle, Search, Tag, Store, FileText, Share2, Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import {
  subscribeToAllTickets, updateTicketStatus, updateTicket, deleteTicket, createRepairTicket,
  upsertAccessory, deleteAccessory, updateBrandPricing, updateStoreSettings,
} from '../../firebase/firestoreService';
import { useAccessories } from '../../hooks/useAccessories';
import { usePricingMatrix } from '../../hooks/usePricingMatrix';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { BRANDS, ISSUES } from '../../data/repairPrices';
import { buildTicketReceipt, receiptFileName } from '../../utils/generateReceipt';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const TICKET_STATUSES = ['Received', 'Diagnosing', 'In-Progress', 'Ready for Pickup', 'Delivered'];
const ACCESSORY_CATEGORIES = ['Cases', 'Chargers', 'Audio', 'Cables', 'Screen Protectors', 'Other'];

// ─── Accessory Form ───────────────────────────────────────────────────────────
function AccessoryForm({ item, onSave, onCancel }) {
  const [form,    setForm]    = useState(item || { name: '', category: 'Cases', price: '', imageUrl: '', description: '', stockStatus: true });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required.'); return; }
    setSaving(true);
    try {
      await upsertAccessory(
        { ...form, price: Number(form.price) },
        item?.id || null
      );
      onSave();
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: 'var(--color-brand-secondary)', fontSize: '0.85rem', display: 'flex', gap: 8 }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Product Name *</label>
          <input className="input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. iPhone 15 Case" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Price (₹) *</label>
          <input className="input" type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="499" min="0" required />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Category</label>
          <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
            {ACCESSORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Stock Status</label>
          <select className="input" value={form.stockStatus ? 'true' : 'false'} onChange={e => update('stockStatus', e.target.value === 'true')}>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Image URL</label>
        <input className="input" value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Description</label>
        <textarea className="input" rows={3} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Short product description..." style={{ resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}><X size={16} /> Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <LoadingSpinner size={16} /> : <Save size={16} />}
          {item ? 'Update' : 'Add'} Accessory
        </button>
      </div>
    </form>
  );
}

// ─── Ticket Form (create + edit) ───────────────────────────────────────────────
function TicketForm({ item, onSave, onCancel }) {
  const [form,   setForm]   = useState(item
    ? {
        customerName:  item.customerName  || '',
        customerPhone: item.customerPhone || '',
        deviceModel:   item.deviceModel   || '',
        issue:         item.issue         || '',
        costEstimate:  item.costEstimate  ?? '',
      }
    : { customerName: '', customerPhone: '', deviceModel: '', issue: '', costEstimate: '' }
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.deviceModel || !form.issue) { setError('Name, device, and issue are required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, costEstimate: form.costEstimate ? Number(form.costEstimate) : null };
      if (item) {
        await updateTicket(item.id, payload);
        onSave();
      } else {
        const { ticketId } = await createRepairTicket(payload);
        onSave(ticketId);
      }
    } catch {
      setError(item ? 'Failed to update ticket.' : 'Failed to create ticket.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: 'var(--color-brand-secondary)', fontSize: '0.85rem' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Customer Name *</label>
          <input className="input" value={form.customerName} onChange={e => update('customerName', e.target.value)} placeholder="John Doe" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Phone Number</label>
          <input className="input" value={form.customerPhone} onChange={e => update('customerPhone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Device Model *</label>
          <input className="input" value={form.deviceModel} onChange={e => update('deviceModel', e.target.value)} placeholder="iPhone 15 Pro" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Cost Estimate (₹)</label>
          <input className="input" type="number" value={form.costEstimate} onChange={e => update('costEstimate', e.target.value)} placeholder="2500" min="0" />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Issue Description *</label>
        <textarea className="input" rows={2} value={form.issue} onChange={e => update('issue', e.target.value)} placeholder="Screen cracked, battery draining fast..." required style={{ resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}><X size={16} /> Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <LoadingSpinner size={16} /> : (item ? <Save size={16} /> : <Plus size={16} />)}
          {item ? 'Update' : 'Create'} Ticket
        </button>
      </div>
    </form>
  );
}

// ─── Pricing Form (per-brand repair price ranges) ─────────────────────────────
function PricingForm({ brandId, issuePrices, onSave, onError }) {
  const [prices, setPrices] = useState(() => {
    const initial = {};
    for (const issue of ISSUES) {
      initial[issue.id] = { ...(issuePrices?.[issue.id] || { min: 0, max: 0 }) };
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const update = (issueId, field, value) => {
    setPrices(p => ({ ...p, [issueId]: { ...p[issueId], [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    for (const issue of ISSUES) {
      const { min, max } = prices[issue.id];
      if (min === '' || max === '' || Number(min) < 0 || Number(max) < Number(min)) {
        setError(`Check the "${issue.label}" range — both fields are required and max must be ≥ min.`);
        return;
      }
    }
    setSaving(true);
    try {
      const cleaned = {};
      for (const issue of ISSUES) {
        cleaned[issue.id] = { min: Number(prices[issue.id].min), max: Number(prices[issue.id].max) };
      }
      await updateBrandPricing(brandId, cleaned);
      onSave();
    } catch {
      const msg = 'Failed to save pricing. Please try again.';
      setError(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: 'var(--color-brand-secondary)', fontSize: '0.85rem', display: 'flex', gap: 8 }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Min (₹)</th>
              <th>Max (₹)</th>
            </tr>
          </thead>
          <tbody>
            {ISSUES.map(issue => (
              <tr key={issue.id}>
                <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{issue.emoji} {issue.label}</td>
                <td>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={prices[issue.id].min}
                    onChange={e => update(issue.id, 'min', e.target.value)}
                    style={{ maxWidth: 120, padding: '6px 10px', fontSize: '0.85rem' }}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={prices[issue.id].max}
                    onChange={e => update(issue.id, 'max', e.target.value)}
                    style={{ maxWidth: 120, padding: '6px 10px', fontSize: '0.85rem' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <LoadingSpinner size={16} /> : <Save size={16} />}
          Save {BRANDS.find(b => b.id === brandId)?.label} Pricing
        </button>
      </div>
    </form>
  );
}

// ─── Store Settings Form (address, phone, warranty, hours, map) ───────────────
function StoreSettingsForm({ settings, onSave, onError }) {
  const [form, setForm] = useState({
    shopName:        settings.shopName        || '',
    ownerName:       settings.ownerName       || '',
    address:         settings.address         || '',
    contactWhatsApp: settings.contactWhatsApp || '',
    phone:           settings.phone           || '',
    googleMapsUrl:   settings.googleMapsUrl   || '',
    warrantyDays:    settings.warrantyDays    ?? 90,
    weekdayHours:    settings.openingHours?.['Mon – Sat'] || '',
    weekendHours:    settings.openingHours?.['Sunday']    || '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName || !form.address || !form.contactWhatsApp) {
      setError('Shop name, address, and WhatsApp number are required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updateStoreSettings({
        shopName:        form.shopName,
        ownerName:       form.ownerName,
        address:         form.address,
        contactWhatsApp: form.contactWhatsApp,
        phone:           form.phone || form.contactWhatsApp,
        googleMapsUrl:   form.googleMapsUrl,
        warrantyDays:    Number(form.warrantyDays) || 0,
        openingHours: {
          'Mon – Sat': form.weekdayHours,
          'Sunday':    form.weekendHours,
        },
      });
      onSave();
    } catch {
      const msg = 'Failed to save store settings. Please try again.';
      setError(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: 'var(--color-brand-secondary)', fontSize: '0.85rem', display: 'flex', gap: 8 }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Shop Name *</label>
          <input className="input" value={form.shopName} onChange={e => update('shopName', e.target.value)} required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Owner Name</label>
          <input className="input" value={form.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="e.g. Mohd Kashif" />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Address *</label>
        <textarea className="input" rows={2} value={form.address} onChange={e => update('address', e.target.value)} required style={{ resize: 'vertical' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>WhatsApp Number *</label>
          <input className="input" value={form.contactWhatsApp} onChange={e => update('contactWhatsApp', e.target.value)} placeholder="+91 75299 12815" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Phone Number</label>
          <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Same as WhatsApp if left blank" />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Google Maps URL</label>
        <input className="input" value={form.googleMapsUrl} onChange={e => update('googleMapsUrl', e.target.value)} placeholder="https://maps.app.goo.gl/..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Warranty (Days)</label>
          <input className="input" type="number" min="0" value={form.warrantyDays} onChange={e => update('warrantyDays', e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Weekday Hours</label>
          <input className="input" value={form.weekdayHours} onChange={e => update('weekdayHours', e.target.value)} placeholder="10:00 AM – 8:00 PM" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 500 }}>Sunday Hours</label>
          <input className="input" value={form.weekendHours} onChange={e => update('weekendHours', e.target.value)} placeholder="11:00 AM – 6:00 PM" />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <LoadingSpinner size={16} /> : <Save size={16} />}
          Save Store Settings
        </button>
      </div>
    </form>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const toast = useToast();

  const [activeTab,      setActiveTab]      = useState('tickets');
  const [tickets,        setTickets]        = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [showAddTicket,  setShowAddTicket]  = useState(false);
  const [editingTicket,  setEditingTicket]  = useState(null);
  const [newTicketId,    setNewTicketId]    = useState('');
  const [ticketSearch,   setTicketSearch]   = useState('');

  const { accessories, loading: accLoading } = useAccessories('All');
  const [editingAcc,    setEditingAcc]    = useState(null);
  const [showAddAcc,    setShowAddAcc]    = useState(false);
  const [accSearch,     setAccSearch]     = useState('');

  const { matrix: pricingMatrix, loading: pricingLoading } = usePricingMatrix();
  const [pricingBrand, setPricingBrand] = useState(BRANDS[0].id);

  const { settings: storeSettings, loading: settingsLoading } = useStoreSettings();

  // { type: 'ticket' | 'accessory', id } while a delete confirmation is open
  const [pendingDelete, setPendingDelete] = useState(null);

  // Subscribe to all tickets
  useEffect(() => {
    const unsub = subscribeToAllTickets((data) => {
      setTickets(data);
      setTicketsLoading(false);
    });
    return unsub;
  }, []);

  const filteredTickets = useMemo(() => {
    const q = ticketSearch.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter(t =>
      t.ticketId?.toLowerCase().includes(q) ||
      t.customerName?.toLowerCase().includes(q) ||
      t.deviceModel?.toLowerCase().includes(q)
    );
  }, [tickets, ticketSearch]);

  const filteredAccessories = useMemo(() => {
    const q = accSearch.trim().toLowerCase();
    if (!q) return accessories;
    return accessories.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q)
    );
  }, [accessories, accSearch]);

  // Redirect if not authenticated — after all hooks so hook order stays stable across renders
  if (!loading && !user) return <Navigate to="/admin" replace />;

  const handleStatusChange = async (id, status) => {
    try {
      await updateTicketStatus(id, status);
      toast.success(`Ticket updated to "${status}"`);
    } catch {
      toast.error('Failed to update ticket status. Please try again.');
    }
  };

  const confirmDeleteTicket = async () => {
    const { id } = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteTicket(id);
      toast.success('Ticket deleted.');
    } catch {
      toast.error('Failed to delete ticket. Please try again.');
    }
  };

  const confirmDeleteAccessory = async () => {
    const { id } = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteAccessory(id);
      toast.success('Accessory deleted.');
    } catch {
      toast.error('Failed to delete accessory. Please try again.');
    }
  };

  const handleDownloadReceipt = (ticket) => {
    const doc = buildTicketReceipt(ticket, storeSettings);
    doc.save(receiptFileName(ticket));
  };

  /** Share the receipt PDF straight into WhatsApp when the browser supports it,
   * otherwise download it and open a WhatsApp chat for the admin to attach manually. */
  const handleShareReceipt = async (ticket) => {
    const doc  = buildTicketReceipt(ticket, storeSettings);
    const file = new File([doc.output('blob')], receiptFileName(ticket), { type: 'application/pdf' });
    const waDigits = (ticket.customerPhone || '').replace(/\D/g, '');
    const waNumber = waDigits.length === 10 ? `91${waDigits}` : waDigits;
    const shareText = `Hi ${ticket.customerName}, here's your receipt for repair ticket ${ticket.ticketId}.`;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: `Receipt — ${ticket.ticketId}`, text: shareText });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user cancelled the share sheet
      }
    }

    doc.save(receiptFileName(ticket));
    if (waNumber) {
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(shareText + ' Please find the PDF attached.')}`, '_blank', 'noopener,noreferrer');
      toast.info('PDF downloaded — attach it in the WhatsApp chat that just opened.');
    } else {
      toast.error('This ticket has no phone number saved — PDF downloaded only.');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const newTicket = newTicketId ? tickets.find(t => t.ticketId === newTicketId) : null;

  // Summary stats
  const stats = {
    total:    tickets.length,
    active:   tickets.filter(t => !['Delivered'].includes(t.status)).length,
    ready:    tickets.filter(t => t.status === 'Ready for Pickup').length,
    products: accessories.length,
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 48 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>
              <Zap size={13} /> Back to site
            </Link>
            <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
              Logged in as {user?.email}
            </p>
          </div>
          <button className="btn btn-outline" onClick={logout} id="admin-logout-btn">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* New ticket ID banner */}
        {newTicketId && (
          <div style={{
            marginBottom: 20, padding: '12px 20px', borderRadius: 12,
            background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <span>Ticket created! ID: <strong className="gradient-text">{newTicketId}</strong> — Share this with the customer.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {newTicket && (
                <>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDownloadReceipt(newTicket)}>
                    <FileText size={14} /> Receipt
                  </button>
                  <button className="btn btn-whatsapp btn-sm" onClick={() => handleShareReceipt(newTicket)}>
                    <Share2 size={14} /> Share
                  </button>
                </>
              )}
              <button onClick={() => setNewTicketId('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: Ticket,   label: 'Total Tickets',     value: stats.total,    color: 'var(--color-brand-primary)' },
            { icon: Wrench,   label: 'Active Repairs',    value: stats.active,   color: 'var(--color-brand-warning)' },
            { icon: Package,  label: 'Ready for Pickup',  value: stats.ready,    color: 'var(--color-brand-success)' },
            { icon: ShoppingBag, label: 'Products Listed', value: stats.products, color: 'var(--color-brand-accent)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
              <Icon size={24} style={{ color, marginBottom: 10 }} />
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color }}>{value}</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            className={`filter-tab ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
            id="tab-tickets"
          >
            <Wrench size={14} /> Repair Tickets
          </button>
          <button
            className={`filter-tab ${activeTab === 'accessories' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessories')}
            id="tab-accessories"
          >
            <ShoppingBag size={14} /> Accessories
          </button>
          <button
            className={`filter-tab ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
            id="tab-pricing"
          >
            <Tag size={14} /> Repair Pricing
          </button>
          <button
            className={`filter-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            id="tab-settings"
          >
            <Store size={14} /> Store Settings
          </button>
        </div>

        {/* ─── TICKETS TAB ─────────────────────────── */}
        {activeTab === 'tickets' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Repair Tickets</h2>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowAddTicket(v => !v); setEditingTicket(null); }} id="add-ticket-btn">
                <Plus size={16} />
                {showAddTicket ? 'Cancel' : 'New Ticket'}
              </button>
            </div>

            {showAddTicket && (
              <div style={{ marginBottom: 24, padding: 24, background: 'var(--color-bg-secondary)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
                <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Create New Repair Ticket</h3>
                <TicketForm
                  onSave={(id) => { setNewTicketId(id); setShowAddTicket(false); toast.success('Ticket created!'); }}
                  onCancel={() => setShowAddTicket(false)}
                />
              </div>
            )}

            {editingTicket && (
              <div style={{ marginBottom: 24, padding: 24, background: 'var(--color-bg-secondary)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
                <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Edit Ticket: {editingTicket.ticketId}</h3>
                <TicketForm
                  item={editingTicket}
                  onSave={() => { setEditingTicket(null); toast.success('Ticket updated!'); }}
                  onCancel={() => setEditingTicket(null)}
                />
              </div>
            )}

            {tickets.length > 0 && (
              <div style={{ position: 'relative', marginBottom: 16, maxWidth: 320 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input
                  className="input"
                  placeholder="Search tickets…"
                  value={ticketSearch}
                  onChange={e => setTicketSearch(e.target.value)}
                  style={{ paddingLeft: 36, fontSize: '0.85rem' }}
                  id="ticket-search-input"
                />
              </div>
            )}

            {ticketsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><LoadingSpinner size={36} /></div>
            ) : tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                <Ticket size={40} style={{ marginBottom: 12 }} />
                <p>No repair tickets yet.</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                <p>No tickets match "{ticketSearch}".</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Customer</th>
                      <th>Device</th>
                      <th>Issue</th>
                      <th>Estimate</th>
                      <th>Created</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td><span className="gradient-text" style={{ fontWeight: 700 }}>{ticket.ticketId}</span></td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{ticket.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ticket.customerPhone}</div>
                        </td>
                        <td style={{ fontSize: '0.875rem' }}>{ticket.deviceModel}</td>
                        <td style={{ fontSize: '0.875rem', maxWidth: 160 }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {ticket.issue}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {ticket.costEstimate ? `₹${Number(ticket.costEstimate).toLocaleString('en-IN')}` : <span style={{ color: 'var(--color-text-muted)' }}>Pending</span>}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{formatDate(ticket.createdAt)}</td>
                        <td>
                          <select
                            className="input"
                            value={ticket.status}
                            onChange={e => handleStatusChange(ticket.id, e.target.value)}
                            style={{ padding: '6px 30px 6px 10px', fontSize: '0.8rem', minWidth: 140 }}
                          >
                            {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 2 }}>
                            <button
                              onClick={() => { setEditingTicket(ticket); setShowAddTicket(false); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 6 }}
                              title="Edit ticket"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDownloadReceipt(ticket)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-accent)', padding: 6 }}
                              title="Download receipt PDF"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              onClick={() => handleShareReceipt(ticket)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#25D366', padding: 6 }}
                              title="Share receipt on WhatsApp"
                            >
                              <Share2 size={16} />
                            </button>
                            <button
                              onClick={() => setPendingDelete({ type: 'ticket', id: ticket.id })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-secondary)', padding: 6 }}
                              title="Delete ticket"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── ACCESSORIES TAB ────────────────────── */}
        {activeTab === 'accessories' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Accessories</h2>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowAddAcc(v => !v); setEditingAcc(null); }} id="add-accessory-btn">
                <Plus size={16} />
                {showAddAcc ? 'Cancel' : 'Add Product'}
              </button>
            </div>

            {showAddAcc && (
              <div style={{ marginBottom: 24, padding: 24, background: 'var(--color-bg-secondary)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
                <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Add New Accessory</h3>
                <AccessoryForm
                  onSave={() => { setShowAddAcc(false); toast.success('Accessory added!'); }}
                  onCancel={() => setShowAddAcc(false)}
                />
              </div>
            )}

            {editingAcc && (
              <div style={{ marginBottom: 24, padding: 24, background: 'var(--color-bg-secondary)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
                <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Edit: {editingAcc.name}</h3>
                <AccessoryForm
                  item={editingAcc}
                  onSave={() => { setEditingAcc(null); toast.success('Accessory updated!'); }}
                  onCancel={() => setEditingAcc(null)}
                />
              </div>
            )}

            {accessories.length > 0 && (
              <div style={{ position: 'relative', marginBottom: 16, maxWidth: 320 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input
                  className="input"
                  placeholder="Search accessories…"
                  value={accSearch}
                  onChange={e => setAccSearch(e.target.value)}
                  style={{ paddingLeft: 36, fontSize: '0.85rem' }}
                  id="accessory-search-input"
                />
              </div>
            )}

            {accLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><LoadingSpinner size={36} /></div>
            ) : accessories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                <ShoppingBag size={40} style={{ marginBottom: 12 }} />
                <p>No accessories yet. Add your first product.</p>
              </div>
            ) : filteredAccessories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                <p>No accessories match "{accSearch}".</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccessories.map(acc => (
                      <tr key={acc.id}>
                        <td>
                          <div style={{
                            width: 44, height: 44, borderRadius: 8, overflow: 'hidden',
                            background: 'var(--color-bg-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {acc.imageUrl
                              ? <img src={acc.imageUrl} alt={acc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <ShoppingBag size={18} style={{ color: 'var(--color-text-muted)' }} />
                            }
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{acc.name}</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 999, background: 'rgba(108,99,255,0.15)', color: 'var(--color-brand-primary)' }}>
                            {acc.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{Number(acc.price).toLocaleString('en-IN')}</td>
                        <td>
                          <Badge variant={acc.stockStatus ? 'success' : 'danger'}>
                            {acc.stockStatus ? 'In Stock' : 'Out'}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => { setEditingAcc(acc); setShowAddAcc(false); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-accent)', padding: 6 }}
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setPendingDelete({ type: 'accessory', id: acc.id })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-secondary)', padding: 6 }}
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── PRICING TAB ─────────────────────────── */}
        {activeTab === 'pricing' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Repair Pricing</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Changes appear instantly in the Repair Estimator</p>
            </div>

            {/* Brand selector */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
              {BRANDS.map(b => (
                <button
                  key={b.id}
                  className={`filter-tab ${pricingBrand === b.id ? 'active' : ''}`}
                  onClick={() => setPricingBrand(b.id)}
                  id={`pricing-brand-${b.id}`}
                >
                  {b.emoji} {b.label}
                </button>
              ))}
            </div>

            {pricingLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><LoadingSpinner size={36} /></div>
            ) : (
              <PricingForm
                key={pricingBrand}
                brandId={pricingBrand}
                issuePrices={pricingMatrix[pricingBrand]}
                onSave={() => toast.success('Pricing updated!')}
                onError={(msg) => toast.error(msg)}
              />
            )}
          </div>
        )}

        {/* ─── STORE SETTINGS TAB ──────────────────── */}
        {activeTab === 'settings' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Store Settings</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                Address, contact number, warranty, and hours shown across the whole site
              </p>
            </div>

            {settingsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><LoadingSpinner size={36} /></div>
            ) : (
              <StoreSettingsForm
                settings={storeSettings}
                onSave={() => toast.success('Store settings updated!')}
                onError={(msg) => toast.error(msg)}
              />
            )}
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title={pendingDelete.type === 'ticket' ? 'Delete this ticket?' : 'Delete this accessory?'}
          message="This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={pendingDelete.type === 'ticket' ? confirmDeleteTicket : confirmDeleteAccessory}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </main>
  );
}
