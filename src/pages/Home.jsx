import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header/Header';
import SearchBar from '../components/SearchBar/SearchBar';
import Categories from '../components/Categories/Categories';
import GymList from '../components/GymList/GymList';
import PostGymModal from '../components/PostGymModal/PostGymModal';
import PromoBannerCarousel from '../components/PromoBannerCarousel/PromoBannerCarousel';
import { Plus } from 'lucide-react';
import { apiFetch } from '../utils/api';
import './Home.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sporton-api.onrender.com';

const EMPTY_FILTERS = {
  region: '',
  district: '',
  sport: '',
  priceBand: 'any',
  openNow: false,
  minRating: 0,
  minReviews: 0,
};

function buildGymsQuery(searchValue, filters) {
  const params = new URLSearchParams();
  const q = (searchValue || '').trim();
  if (q) params.set('q', q);
  if (filters.region) params.set('region', filters.region);
  if (filters.district) params.set('district', filters.district);
  if (filters.sport) params.set('category', filters.sport);
  if (filters.openNow) params.set('openNow', 'true');
  if (filters.priceBand && filters.priceBand !== 'any') params.set('priceBand', filters.priceBand);
  if (filters.minRating > 0) params.set('minRating', String(filters.minRating));
  if (filters.minReviews > 0) params.set('minReviews', String(filters.minReviews));
  const qs = params.toString();
  return qs ? `/api/gyms/?${qs}` : '/api/gyms/';
}

export default function Home({
  gyms,
  gymsLoading,
  gymsError,
  onRetryGyms,
  toggleLike,
  onNavigate,
}) {
  const [showPostModal, setShowPostModal] = useState(false);
  const [promoBanners, setPromoBanners] = useState([]);

  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  /** null = ro‘yxat hali “Qidirish”siz, parentdan kelgan `gyms` ko‘rsatiladi */
  const [homeGyms, setHomeGyms] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const regions = Array.from(new Set((gyms || []).map((g) => g.region))).filter(Boolean).sort();
  const sports = Array.from(
    new Set((gyms || []).flatMap((g) => {
      const catSlugs = (g.categories || []).map(c => c.slug);
      const rawSports = g.sports || [];
      return [...catSlugs, ...rawSports];
    }))
  ).filter(Boolean).sort();
  const searchSuggestions = Array.from(
    new Set(
      (gyms || []).flatMap((g) => [g.name, g.district]).filter(Boolean)
    )
  );

  const availableDistricts = Array.from(
    new Set(
      (gyms || [])
        .filter((g) => !filters.region || g.region === filters.region)
        .map((g) => g.district)
    )
  ).filter(Boolean).sort();

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/banners/`, { signal: ac.signal });
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        // Safety on frontend: hide carousel until image banner exists.
        setPromoBanners(items.filter((b) => Boolean(b?.image_url)));
      } catch (e) {
        if (e?.name === 'AbortError') return;
      }
    })();
    return () => ac.abort();
  }, []);

  const runGymSearch = useCallback(async (overrideFilters, overrideSearch) => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const activeFilters = overrideFilters || filters;
      const activeSearch = overrideSearch !== undefined ? overrideSearch : searchValue;
      const path = buildGymsQuery(activeSearch, activeFilters);
      const data = await apiFetch(path);
      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];
      const likedById = new Map((gyms || []).map((g) => [g.id, g.liked]));
      setHomeGyms(
        items.map((g) => ({
          ...g,
          liked: g.liked ?? (likedById.get(g.id) ?? false),
        }))
      );
    } catch (e) {
      setSearchError(e?.message || "Qidiruvda xato");
      setHomeGyms([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchValue, filters, gyms]);

  useEffect(() => {
    setHomeGyms((prev) => {
      if (prev === null) return prev;
      if (!prev.length) return prev;
      const byId = new Map((gyms || []).map((g) => [g.id, g]));
      return prev.map((g) => {
        const fresh = byId.get(g.id);
        return fresh ? { ...g, liked: fresh.liked ?? g.liked } : g;
      });
    });
  }, [gyms]);

  const listGyms = homeGyms !== null ? homeGyms : gyms || [];

  return (
    <div className="home-page">
      <Header />
      <SearchBar
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        regions={regions}
        districts={availableDistricts}
        sports={sports}
        searchSuggestions={searchSuggestions}
        filters={filters}
        onFiltersChange={setFilters}
        onSearchClick={runGymSearch}
        searchLoading={searchLoading}
      />
      <div className="home-scroll">
        <Categories
          activeSport={filters.sport}
          sports={sports}
          onCategorySelect={(key) => {
            const newSport = filters.sport === key ? '' : key;
            const newFilters = { ...filters, sport: newSport };
            setFilters(newFilters);
            runGymSearch(newFilters);
          }}
        />
        <PromoBannerCarousel banners={promoBanners} onNavigate={onNavigate} />
        <GymList
          gyms={listGyms}
          allLoadedCount={(gyms || []).length}
          loading={gymsLoading}
          error={gymsError || searchError}
          onRetry={() => {
            if (searchError) {
              setSearchError(null);
              runGymSearch();
            } else {
              onRetryGyms?.();
            }
          }}
          toggleLike={toggleLike}
          onNavigate={onNavigate}
        />
        <div className="bottom-spacer" />
      </div>

      <button className="fab-btn" onClick={() => setShowPostModal(true)}>
        <Plus size={22} strokeWidth={2.8} />
      </button>

      {showPostModal && (
        <PostGymModal onClose={() => setShowPostModal(false)} />
      )}
    </div>
  );
}
