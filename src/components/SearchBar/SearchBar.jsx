import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({
  searchValue = '',
  onSearchValueChange,
  regions = [],
  districts = [],
  sports = [],
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
} = {}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
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

  return (
    <div className="searchbar-wrap">
      <div className="searchbar-input">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={searchValue}
          onChange={(e) => onSearchValueChange?.(e.target.value)}
        />
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
                className="filter-reset"
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
