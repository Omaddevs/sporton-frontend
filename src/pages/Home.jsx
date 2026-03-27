import { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import SearchBar from '../components/SearchBar/SearchBar';
import Categories from '../components/Categories/Categories';
import GymList from '../components/GymList/GymList';
import PostGymModal from '../components/PostGymModal/PostGymModal';
import PromoBannerCarousel from '../components/PromoBannerCarousel/PromoBannerCarousel';
import { Plus } from 'lucide-react';
import './Home.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sporton-api.onrender.com';

export default function Home({ gyms, toggleLike, onNavigate }) {
  const [showPostModal, setShowPostModal] = useState(false);
  const [promoBanners, setPromoBanners] = useState([]);

  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    district: '',
    sport: '',
    priceBand: 'any', // any | lt300 | 300-450 | gt450
    openNow: false,
    minRating: 0,
    minReviews: 0,
  });

  const regions = Array.from(new Set((gyms || []).map((g) => g.region))).filter(Boolean).sort();
  const sports = Array.from(new Set((gyms || []).flatMap((g) => g.sports || []))).sort();
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

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredGyms = (gyms || []).filter((g) => {
    const matchesSearch =
      !normalizedSearch ||
      g.name.toLowerCase().includes(normalizedSearch) ||
      (g.district || '').toLowerCase().includes(normalizedSearch) ||
      (g.sports || []).some((s) => String(s).toLowerCase().includes(normalizedSearch));

    const matchesRegion = !filters.region || g.region === filters.region;
    const matchesDistrict = !filters.district || g.district === filters.district;
    const matchesSport = !filters.sport || (g.sports || []).includes(filters.sport);
    const matchesPrice =
      filters.priceBand === 'any' ||
      (filters.priceBand === 'lt300' && g.monthlyPrice < 300000) ||
      (filters.priceBand === '300-450' && g.monthlyPrice >= 300000 && g.monthlyPrice <= 450000) ||
      (filters.priceBand === 'gt450' && g.monthlyPrice > 450000);
    const matchesOpenNow = !filters.openNow || g.isOpen === true;
    const matchesMinRating = !filters.minRating || g.rating >= filters.minRating;
    const matchesMinReviews = !filters.minReviews || g.reviewsCount >= filters.minReviews;

    return (
      matchesSearch &&
      matchesRegion &&
      matchesDistrict &&
      matchesSport &&
      matchesPrice &&
      matchesOpenNow &&
      matchesMinRating &&
      matchesMinReviews
    );
  });

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
      />
      <div className="home-scroll">
        <Categories
          activeSport={filters.sport}
          sports={sports}
          onCategorySelect={(key) => {
            setFilters((prev) => ({
              ...prev,
              sport: prev.sport === key ? '' : key,
            }));
          }}
        />
        <PromoBannerCarousel banners={promoBanners} onNavigate={onNavigate} />
        <GymList gyms={filteredGyms} toggleLike={toggleLike} onNavigate={onNavigate} />
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
