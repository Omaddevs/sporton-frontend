import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Star, MapPin, Clock, RefreshCw } from 'lucide-react';
import GymDetail from '../GymDetail/GymDetail';
import { getGymImageUrl } from '../../utils/gymImageUrl';
import './GymList.css';

function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price ?? 0);
}

function GymGridSkeleton() {
  return (
    <div className="gym-grid gym-grid-skeleton" aria-busy="true" aria-label="Loading">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="gym-card-skeleton">
          <div className="gym-skel-visual" />
          <div className="gym-skel-body">
            <div className="gym-skel-line gym-skel-line--lg" />
            <div className="gym-skel-line gym-skel-line--md" />
            <div className="gym-skel-line gym-skel-line--sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GymList({
  gyms,
  allLoadedCount = 0,
  loading = false,
  error = null,
  onRetry,
  toggleLike,
  onNavigate,
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});

  const handleToggleLike = (e, id) => {
    e.stopPropagation();
    toggleLike?.(id);
  };

  const showContent = !loading && !error;

  return (
    <>
      <section className="gym-section">
        <div className="section-header">
          <h2 className="section-title">{t('gyms_section')}</h2>
          <button type="button" className="see-all-btn" disabled={loading || !!error}>
            {t('see_all')}
          </button>
        </div>

        {loading && <GymGridSkeleton />}

        {error && (
          <div className="gym-list-state gym-list-state--error" role="alert">
            <p className="gym-list-state-text">{error}</p>
            <button type="button" className="gym-list-retry-btn" onClick={() => onRetry?.()}>
              <RefreshCw size={16} />
              {t('gyms_retry')}
            </button>
          </div>
        )}

        {showContent && allLoadedCount === 0 && (
          <div className="gym-list-state gym-list-state--empty">
            <p className="gym-list-state-text">{t('gyms_empty')}</p>
          </div>
        )}

        {showContent && allLoadedCount > 0 && gyms.length === 0 && (
          <div className="gym-list-state gym-list-state--empty">
            <p className="gym-list-state-text">{t('gyms_filter_empty')}</p>
          </div>
        )}

        {showContent && gyms.length > 0 && (
        <div className="gym-grid">
          {gyms.map((gym) => {
            const imageUrl = brokenImages[gym.id] ? null : getGymImageUrl(gym);
            return (
            <div
              key={gym.id}
              className="gym-card"
              onClick={() => setSelected(gym)}
            >
              <div className="gym-card-visual" style={{ background: gym.gradient || '#0f172a' }}>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={gym.name || ''}
                    className="gym-card-bg-img"
                    loading="lazy"
                    onError={() => setBrokenImages((prev) => ({ ...prev, [gym.id]: true }))}
                  />
                )}

                <button
                  type="button"
                  className={`gym-heart-btn ${gym.liked ? 'liked' : ''}`}
                  onClick={(e) => handleToggleLike(e, gym.id)}
                >
                  <Heart
                    size={15}
                    fill={gym.liked ? '#ff5b5b' : 'none'}
                    stroke={gym.liked ? '#ff5b5b' : '#1a1a2e'}
                    strokeWidth={2.2}
                  />
                </button>

                <div className="gym-card-badges">
                  <span className={`gym-status-badge ${gym.isOpen ? 'open' : 'closed'}`}>
                    <span className="status-dot" />
                    {gym.isOpen ? t('open_now') : t('closed_now')}
                  </span>

                  <span className="gym-visual-stats-badge" aria-label="Statistika">
                    <Star size={12} fill="#96E20C" stroke="none" />
                    <span className="gym-visual-stats-rating">{gym.rating ?? 0}</span>
                    <span className="gym-visual-stats-reviews">({gym.reviewsCount ?? 0})</span>
                  </span>
                </div>

                {!imageUrl && (
                  <div className="gym-visual-icon">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <rect x="6" y="34" width="12" height="12" rx="4" fill="white" opacity="0.25"/>
                      <rect x="62" y="34" width="12" height="12" rx="4" fill="white" opacity="0.25"/>
                      <rect x="17" y="28" width="9" height="24" rx="4" fill="white" opacity="0.35"/>
                      <rect x="54" y="28" width="9" height="24" rx="4" fill="white" opacity="0.35"/>
                      <rect x="26" y="36" width="28" height="8" rx="4" fill="white" opacity="0.5"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="gym-card-info">
                <div className="gym-card-top">
                  <h3 className="gym-card-name">{gym.name}</h3>
                </div>

                <div className="gym-card-location">
                  <MapPin size={11} className="loc-icon" />
                  <span className="gym-card-address">{gym.address || gym.district || '—'}</span>
                </div>

                <div className="gym-card-footer">
                  <div className="gym-card-price">
                    <span className="price-amount">{formatPrice(gym.monthlyPrice)}</span>
                    <span className="price-unit"> so'm{t('per_month')}</span>
                  </div>
                  <div className="gym-card-hours">
                    <Clock size={11} />
                    <span>{gym.hours || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        )}
      </section>

      {selected && (
        <GymDetail
          key={selected.id}
          gym={gyms.find((g) => g.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          onToggleLike={(id) => {
            toggleLike?.(id);
          }}
          onRequireAuth={() => onNavigate?.('profile')}
        />
      )}
    </>
  );
}
