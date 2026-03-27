import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { Search, Star, MapPin, Clock, Phone, X, ChevronUp } from 'lucide-react';
import GymDetail from '../../components/GymDetail/GymDetail';
import { getGymImageUrl } from '../../utils/gymImageUrl';
import './Explore.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createGymIcon(gym, isActive) {
  return L.divIcon({
    className: '',
    html: `
      <div class="gym-map-pin ${isActive ? 'active' : ''}" style="--accent:${gym.accentColor}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="10" width="4" height="4" rx="1"/>
          <rect x="18" y="10" width="4" height="4" rx="1"/>
          <rect x="5.5" y="7" width="3" height="10" rx="1.5"/>
          <rect x="15.5" y="7" width="3" height="10" rx="1.5"/>
          <rect x="8.5" y="11" width="7" height="2" rx="1"/>
        </svg>
        <div class="pin-tail"></div>
      </div>`,
    iconSize: isActive ? [46, 54] : [38, 46],
    iconAnchor: isActive ? [23, 54] : [19, 46],
    popupAnchor: [0, -50],
  });
}

function FlyToGym({ gym }) {
  const map = useMap();
  useEffect(() => {
    if (gym) map.flyTo([gym.lat, gym.lng], 15, { duration: 0.9 });
  }, [gym, map]);
  return null;
}

function InvalidateMapOnPanelToggle({ panelOpen }) {
  const map = useMap();
  useEffect(() => {
    // Leaflet container height changes with the bottom sheet; it must be told to recalc.
    const t = setTimeout(() => map.invalidateSize(), 360);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [panelOpen, map]);
  return null;
}

function formatPrice(p) {
  return new Intl.NumberFormat('uz-UZ').format(p);
}

export default function Explore({ gyms = [], toggleLike }) {
  const { t } = useTranslation();
  const [activeGym, setActiveGym] = useState(null);
  const [detailGym, setDetailGym] = useState(null);
  const [search, setSearch] = useState('');
  const [brokenThumbs, setBrokenThumbs] = useState({});
  const panelOpen = true; // Always open (no hamburger collapse)
  const listRef = useRef(null);

  const filtered = gyms.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.district.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectGym = (gym, collapsePanelOnSelect = false) => {
    setActiveGym(gym);
    // Mobile UX: user taps a gym card => collapse bottom sheet so map becomes visible.
    // (Removed) panel never collapses now.
    // scroll list item into view on mobile
    setTimeout(() => {
      const el = document.getElementById(`gym-item-${gym.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleToggleLike = (id) => {
    toggleLike?.(id);
  };

  return (
    <div className="explore-page">

      {/* ── Map ── */}
      <div className="explore-map-wrap">
        <MapContainer
          center={[41.2995, 69.2401]}
          zoom={12}
          className="explore-map"
          zoomControl={false}
        >
          <InvalidateMapOnPanelToggle panelOpen={panelOpen} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {filtered.map((gym) => (
            <Marker
              key={gym.id}
              position={[gym.lat, gym.lng]}
              icon={createGymIcon(gym, activeGym?.id === gym.id)}
              eventHandlers={{ click: () => handleSelectGym(gym) }}
            >
              <Popup className="gym-popup" closeButton={false}>
                <div className="popup-inner">
                  <div className="popup-top" style={{ background: gym.gradient }}>
                    <span className="popup-name">{gym.name}</span>
                  </div>
                  <div className="popup-body">
                    <div className="popup-rating">
                      <Star size={11} fill="#96E20C" stroke="none" />
                      <span>{gym.rating}</span>
                      <span className="popup-reviews">({gym.reviewsCount})</span>
                    </div>
                    <div className="popup-location">
                      <MapPin size={10} />
                      <span>{gym.district}</span>
                    </div>
                    <button
                      className="popup-detail-btn"
                      onClick={() => setDetailGym(gym)}
                    >
                      Ko'rish
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {activeGym && <FlyToGym gym={activeGym} />}
        </MapContainer>

        {/* Map count badge */}
        <div className="map-count-badge">
          <MapPin size={13} />
          {filtered.length} ta sport zali
        </div>
      </div>

      {/* ── Side / Bottom Panel ── */}
      <div className={`explore-panel ${panelOpen ? 'open' : 'collapsed'}`}>

        {/* Search */}
        <div className="panel-search">
          <Search size={15} className="panel-search-icon" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="panel-search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* List */}
        <div className="panel-list" ref={listRef}>
          {filtered.length === 0 && (
            <div className="panel-empty">
              <MapPin size={32} opacity={0.3} />
              <p>Sport zal topilmadi</p>
            </div>
          )}
          {filtered.map((gym) => {
            const thumbSrc = brokenThumbs[gym.id] ? null : getGymImageUrl(gym);
            return (
            <div
              id={`gym-item-${gym.id}`}
              key={gym.id}
              className={`panel-gym-card ${activeGym?.id === gym.id ? 'active' : ''}`}
              onClick={() => handleSelectGym(gym, true)}
            >
              <div className="panel-gym-thumb" style={{ background: gym.gradient }}>
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt=""
                    className="panel-gym-thumb-img"
                    loading="lazy"
                    onError={() => setBrokenThumbs((prev) => ({ ...prev, [gym.id]: true }))}
                  />
                ) : (
                  <svg viewBox="0 0 40 40" fill="none" width="22" height="22" aria-hidden>
                    <rect x="3" y="16" width="6" height="6" rx="2" fill="white" opacity="0.5"/>
                    <rect x="31" y="16" width="6" height="6" rx="2" fill="white" opacity="0.5"/>
                    <rect x="8.5" y="12" width="5" height="16" rx="2.5" fill="white" opacity="0.75"/>
                    <rect x="26.5" y="12" width="5" height="16" rx="2.5" fill="white" opacity="0.75"/>
                    <rect x="13.5" y="18" width="13" height="4" rx="2" fill="white"/>
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="panel-gym-info">
                <div className="panel-gym-top">
                  <span className="panel-gym-name">{gym.name}</span>
                  <div className="panel-gym-rating">
                    <Star size={10} fill="#96E20C" stroke="none" />
                    <span>{gym.rating}</span>
                  </div>
                </div>
                <div className="panel-gym-district">
                  <MapPin size={10} />
                  <span>{gym.district}</span>
                </div>
                <div className="panel-gym-footer">
                  <span className="panel-gym-price">
                    {formatPrice(gym.monthlyPrice)} so'm/oy
                  </span>
                  <span className={`panel-gym-status ${gym.isOpen ? 'open' : 'closed'}`}>
                    {gym.isOpen ? t('open_now') : t('closed_now')}
                  </span>
                </div>
              </div>

              {/* Detail button */}
              <button
                className="panel-detail-btn"
                onClick={(e) => { e.stopPropagation(); setDetailGym(gym); }}
              >
                <ChevronUp size={16} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>
            );
          })}
        </div>
      </div>

      {/* Gym Detail Modal */}
      {detailGym && (
        <GymDetail
          gym={gyms.find((g) => g.id === detailGym.id) || detailGym}
          onClose={() => setDetailGym(null)}
          onToggleLike={handleToggleLike}
        />
      )}
    </div>
  );
}
