import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X, History, ChevronRight, RotateCcw } from 'lucide-react';
import './SearchBar.css';

const SEARCH_HISTORY_KEY = 'sporton_search_history_v1';
const MAX_HISTORY = 7;

export default function SearchBar({
  searchValue = '',
  onSearchValueChange,
  regions = [],
  districts = [],
  sports = [],
  searchSuggestions = [],
  filters = {
    region: '',
    district: '',
    sport: '',
    priceBand: 'any',
    openNow: false,
    minRating: 0,
    minReviews: 0,
  },
  onFiltersChange,
  onSearchClick,
  searchLoading = false,
} = {}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const wrapRef = useRef(null);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setHistoryItems(parsed.filter((v) => typeof v === 'string' && v.trim()));
    } catch {}
  }, []);

  const persistHistory = (next) => {
    setHistoryItems(next);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  const pushHistory = (query) => {
    const q = (query || '').trim();
    if (!q) return;
    const next = [q, ...historyItems.filter((v) => v.toLowerCase() !== q.toLowerCase())].slice(0, MAX_HISTORY);
    persistHistory(next);
  };

  const applySearch = (query, save = true) => {
    const q = (query || '').trim();
    onSearchValueChange?.(query);
    if (save && q) pushHistory(q);
    setShowHistory(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setShowHistory(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const setFilter = (patch) => onFiltersChange?.({ ...filters, ...patch });

  const regionOptions = regions;
  const minRatingOptions = [
    { label: 'Har qanday', value: 0 },
    { label: '4.5+', value: 4.5 },
    { label: '4.7+', value: 4.7 },
    { label: '4.8+', value: 4.8 },
  ];

  const minReviewsOptions = [
    { label: 'Har qanday', value: 0 },
    { label: '100+ sharh', value: 100 },
    { label: '150+ sharh', value: 150 },
    { label: '200+ sharh', value: 200 },
    { label: '300+ sharh', value: 300 },
  ];

  const priceBandOptions = [
    { label: 'Har qanday', value: 'any' },
    { label: '300k gacha', value: 'lt300' },
    { label: '300k-450k', value: '300-450' },
    { label: '450k dan yuqori', value: 'gt450' },
  ];

  const sportLabel = (key) => {
    const translated = t(`category_${key}`);
    return translated === `category_${key}` ? key : translated;
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const q = (searchValue || '').trim().toLowerCase();
  const matchedSuggestions = q
    ? searchSuggestions
        .filter((v) => String(v || '').toLowerCase().includes(q))
        .slice(0, 7)
    : [];

  const listTitle = q ? 'Search suggestions' : 'Recent searches';
  const listItems = q ? matchedSuggestions : historyItems;

  return (
    <div className="searchbar-wrap">
      <div className="searchbar-input-wrap" ref={searchWrapRef}>
      <div className="searchbar-input">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={searchValue}
          onChange={(e) => onSearchValueChange?.(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              applySearch(searchValue, true);
            }
          }}
        />
      </div>
      {showHistory && (
        <div className="search-history-popover">
          <div className="search-history-head">
            <span>{listTitle}</span>
          </div>
          <div className="search-history-list">
            {listItems.map((item) => (
              <button
                type="button"
                key={item}
                className="search-history-item"
                onClick={() => {
                  applySearch(item, true);
                }}
              >
                <span className="search-history-item-left">
                  <History size={15} />
                  <span>{item}</span>
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
            {listItems.length === 0 && (
              <div className="search-history-empty">No suggestions yet</div>
            )}
          </div>
          <div className="search-history-actions">
            <button
              type="button"
              className="search-history-clear"
              onClick={() => persistHistory([])}
              disabled={historyItems.length === 0}
            >
              <RotateCcw size={15} />
              Clear all
            </button>
            <button
              type="button"
              className="search-history-filter-cta"
              onClick={() => {
                setShowHistory(false);
                setOpen(true);
              }}
            >
              Filters
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
      </div>

      <div className="filter-wrap" ref={wrapRef}>
        <button
          className="filter-btn"
          onClick={() => setOpen((o) => !o)}
          aria-label="Filtr"
          type="button"
        >
          <SlidersHorizontal size={18} strokeWidth={2.5} />
        </button>

        {open && (
          <div className="filter-overlay" onClick={() => setOpen(false)}>
            <div
              className="filter-popover"
              role="dialog"
              aria-modal="true"
              aria-label="Filtr"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="filter-header">
                <div className="filter-title">Filtr</div>
                <button
                  type="button"
                  className="filter-close"
                  aria-label="Yopish"
                  onClick={() => setOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

            <div className="filter-row">
              <div className="filter-label">Viloyat</div>
              <select
                className="filter-select"
                value={filters.region}
                onChange={(e) => setFilter({ region: e.target.value, district: '' })}
              >
                <option value="">Barchasi</option>
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-row">
              <div className="filter-label">Tuman</div>
              <select
                className="filter-select"
                value={filters.district}
                onChange={(e) => setFilter({ district: e.target.value })}
              >
                <option value="">Barchasi</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-row">
              <div className="filter-label">Sport turi</div>
              <select
                className="filter-select"
                value={filters.sport}
                onChange={(e) => setFilter({ sport: e.target.value })}
              >
                <option value="">Barchasi</option>
                {sports.map((s) => (
                  <option key={s} value={s}>
                    {sportLabel(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-row">
              <div className="filter-label">Narx (oylik)</div>
              <select
                className="filter-select"
                value={filters.priceBand}
                onChange={(e) => setFilter({ priceBand: e.target.value })}
              >
                {priceBandOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="filter-row filter-check">
              <input
                type="checkbox"
                checked={!!filters.openNow}
                onChange={(e) => setFilter({ openNow: e.target.checked })}
              />
              <span>Hozir ochiq</span>
            </label>

            <div className="filter-row">
              <div className="filter-label">Minimal reyting</div>
              <select
                className="filter-select"
                value={filters.minRating}
                onChange={(e) => setFilter({ minRating: parseFloat(e.target.value) })}
              >
                {minRatingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-row">
              <div className="filter-label">Minimal sharhlar</div>
              <select
                className="filter-select"
                value={filters.minReviews}
                onChange={(e) => setFilter({ minReviews: parseInt(e.target.value, 10) })}
              >
                {minReviewsOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-actions">
              <button
                type="button"
                className="filter-search-submit"
                disabled={searchLoading}
                aria-busy={searchLoading}
                onClick={async () => {
                  await onSearchClick?.();
                  setOpen(false);
                }}
              >
                {searchLoading ? 'Qidirilmoqda…' : 'Qidirish'}
              </button>
              <button
                type="button"
                className="filter-reset"
                disabled={searchLoading}
                onClick={() => {
                  onFiltersChange?.({
                    region: '',
                    district: '',
                    sport: '',
                    priceBand: 'any',
                    openNow: false,
                    minRating: 0,
                    minReviews: 0,
                  });
                }}
              >
                Tozalash
              </button>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
