// src/components/layout/HeaderSearch.jsx
// Spotlight-style global search: jump to a repair ticket, an accessory, or a page.
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Ticket, ShoppingBag, Compass } from 'lucide-react';
import { useAccessories } from '../../hooks/useAccessories';

const TICKET_PATTERN = /^rep-?\s*\d+/i;

const PAGES = [
  { to: '/',            label: 'Repair Estimator' },
  { to: '/tracker',     label: 'Track Repair'     },
  { to: '/accessories', label: 'Accessories'      },
  { to: '/contact',     label: 'Contact'          },
];

export default function HeaderSearch() {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { accessories } = useAccessories('All');

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const q = query.trim().toLowerCase();

  const ticketMatch = useMemo(() => {
    if (!q || !TICKET_PATTERN.test(q)) return null;
    const digits = q.replace(/[^\d]/g, '');
    return digits ? `REP-${digits}` : null;
  }, [q]);

  const matchedAccessories = useMemo(() => {
    if (!q) return [];
    return accessories
      .filter(a => a.name?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q))
      .slice(0, 5);
  }, [accessories, q]);

  const matchedPages = useMemo(() => {
    if (!q) return PAGES;
    return PAGES.filter(p => p.label.toLowerCase().includes(q));
  }, [q]);

  const close = () => { setOpen(false); setQuery(''); };

  const goToTicket = (id) => { navigate(`/tracker?id=${id}`); close(); };
  const goToAccessory = (item) => { navigate(`/accessories?id=${item.id}`); close(); };
  const goToPage = (to) => { navigate(to); close(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticketMatch) goToTicket(ticketMatch);
    else if (matchedAccessories[0]) goToAccessory(matchedAccessories[0]);
    else if (matchedPages[0]) goToPage(matchedPages[0].to);
  };

  return (
    <>
      <button type="button" className="search-trigger" onClick={() => setOpen(true)} id="header-search-trigger">
        <Search size={16} />
        <span className="hide-mobile">Search tickets, accessories…</span>
      </button>

      {open && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
          <form className="search-overlay-bar" onSubmit={handleSubmit}>
            <Search size={20} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              className="search-overlay-input"
              type="text"
              placeholder="Ticket ID, accessory, or page…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="button" onClick={close} aria-label="Close search" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 6 }}>
              <X size={20} />
            </button>
          </form>

          <div className="search-overlay-body">
            {ticketMatch && (
              <>
                <p className="search-section-label">Track Repair</p>
                <button type="button" className="search-result-row" onClick={() => goToTicket(ticketMatch)}>
                  <Ticket size={18} style={{ color: 'var(--ios-blue)' }} />
                  Track ticket <strong>{ticketMatch}</strong>
                </button>
              </>
            )}

            {q && matchedAccessories.length > 0 && (
              <>
                <p className="search-section-label">Accessories</p>
                {matchedAccessories.map(item => (
                  <button type="button" key={item.id} className="search-result-row" onClick={() => goToAccessory(item)}>
                    <ShoppingBag size={18} style={{ color: 'var(--ios-pink)' }} />
                    <span style={{ flex: 1 }}>{item.name}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>₹{Number(item.price).toLocaleString('en-IN')}</span>
                  </button>
                ))}
              </>
            )}

            {matchedPages.length > 0 && (
              <>
                <p className="search-section-label">Pages</p>
                {matchedPages.map(p => (
                  <button type="button" key={p.to} className="search-result-row" onClick={() => goToPage(p.to)}>
                    <Compass size={18} style={{ color: 'var(--ios-indigo)' }} />
                    {p.label}
                  </button>
                ))}
              </>
            )}

            {q && !ticketMatch && matchedAccessories.length === 0 && matchedPages.length === 0 && (
              <p style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                No results for "{query}"
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
