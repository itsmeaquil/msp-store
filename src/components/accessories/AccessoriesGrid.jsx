// src/components/accessories/AccessoriesGrid.jsx
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Heart } from 'lucide-react';
import { useAccessories } from '../../hooks/useAccessories';
import { useFavorites } from '../../hooks/useFavorites';
import AccessoryCard from './AccessoryCard';
import AccessoryModal from './AccessoryModal';

const CATEGORIES = ['All', 'Cases', 'Chargers', 'Audio', 'Cables', 'Screen Protectors', 'Other'];
const FAVORITES_FILTER = 'Favorites';

const SKELETON_COUNT = 8;

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
      <div className="skeleton" style={{ width: '100%', aspectRatio: '1' }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 16, width: '75%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
      </div>
    </div>
  );
}

export default function AccessoriesGrid() {
  const [category,       setCategory]       = useState('All');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [selectedItem,   setSelectedItem]   = useState(null);
  const [searchParams,   setSearchParams]   = useSearchParams();

  const { accessories, loading } = useAccessories(category === FAVORITES_FILTER ? 'All' : category);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Deep link from the header search overlay: /accessories?id=<accessoryId>
  useEffect(() => {
    const highlightId = searchParams.get('id');
    if (!highlightId || loading) return;
    const match = accessories.find(a => a.id === highlightId);
    if (match) {
      setSelectedItem(match);
      setSearchParams(prev => { prev.delete('id'); return prev; }, { replace: true });
    }
  }, [searchParams, accessories, loading, setSearchParams]);

  const filtered = useMemo(() => {
    let list = category === FAVORITES_FILTER
      ? accessories.filter(a => favorites.includes(a.id))
      : accessories;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [accessories, searchQuery, category, favorites]);

  return (
    <div>
      {/* Filters bar */}
      <div style={{ marginBottom: 28 }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={18} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)', pointerEvents: 'none',
          }} />
          <input
            id="accessories-search"
            type="text"
            className="input"
            placeholder="Search accessories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-tab ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
              id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
          <button
            className={`filter-tab ${category === FAVORITES_FILTER ? 'active' : ''}`}
            onClick={() => setCategory(FAVORITES_FILTER)}
            id="cat-filter-favorites"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Heart size={13} fill={category === FAVORITES_FILTER ? 'currentColor' : 'none'} />
            Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
          {category !== 'All' ? ` in ${category}` : ''}
          {searchQuery ? ` for "${searchQuery}"` : ''}
        </p>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {loading
          ? Array.from({ length: SKELETON_COUNT }, (_, i) => <SkeletonCard key={i} />)
          : filtered.map(item => (
              <AccessoryCard
                key={item.id}
                accessory={item}
                onClick={() => setSelectedItem(item)}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            ))
        }
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Package size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No accessories found</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            {searchQuery
              ? `No results for "${searchQuery}". Try a different keyword.`
              : category === FAVORITES_FILTER
                ? "You haven't favorited anything yet. Tap the heart on a product to save it here."
                : 'No accessories in this category yet. Check back soon!'}
          </p>
          {(searchQuery || category !== 'All') && (
            <button className="btn btn-ghost" style={{ marginTop: 16 }}
              onClick={() => { setSearchQuery(''); setCategory('All'); }}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Product modal */}
      {selectedItem && (
        <AccessoryModal
          accessory={selectedItem}
          onClose={() => setSelectedItem(null)}
          isFavorite={isFavorite(selectedItem.id)}
          onToggleFavorite={() => toggleFavorite(selectedItem.id)}
        />
      )}
    </div>
  );
}
