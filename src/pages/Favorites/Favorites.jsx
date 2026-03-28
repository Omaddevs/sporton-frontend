import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Star, MapPin, Clock, HeartOff, RefreshCw } from 'lucide-react';
import Header from '../../components/Header/Header';
import GymDetail from '../../components/GymDetail/GymDetail';
import './Favorites.css';

function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price ?? 0);
}

export default function Favorites({
  gyms,
  gymsLoading,
  gymsError,
  onRetryGyms,
  toggleLike,
  onNavigate,
}) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(null);

  const list = Array.isArray(gyms) ? gyms : [];
  const liked = list.filter((g) => g.liked);
  const selectedGym = selectedId != null ? list.find((g) => g.id === selectedId) : null;

  const handleUnlike = (e, id) => {
    e.stopPropagation();
    toggleLike?.(id);
  };

  return (
    <div className="favorites-page">
      <Header />

      <div className="favorites-scroll">
        <div className="favorites-header">
          <h2 className="favorites-title">
            <Heart size={20} fill="#ff5b5b" stroke="none" />
            Sevimlilar
          </h2>
          {!gymsLoading && !gymsError && liked.length > 0 && (
            <span className="favorites-count">{liked.length} ta sport zali</span>
          )}
        </div>

        {gymsLoading && (
          <div className="favorites-state">
            <p className="favorites-state-text">{t('gyms_loading')}</p>
          </div>
        )}

        {gymsError && (
          <div className="favorites-state favorites-state--error">
            <p className="favorites-state-text">{gymsError}</p>
            <button type="button" className="favorites-retry-btn" onClick={() => onRetryGyms?.()}>
              <RefreshCw size={16} />
              {t('gyms_retry')}
            </button>
          </div>
        )}

        {!gymsLoading && !gymsError && list.length === 0 && (
          <div className="favorites-empty">
            <div className="empty-icon-wrap">
              <HeartOff size={48} strokeWidth={1.5} />
            </div>
            <h3>{t('gyms_empty')}</h3>
            <p>{t('gyms_empty_hint')}</p>
          </div>
        )}

        {!gymsLoading && !gymsError && list.length > 0 && liked.length === 0 && (
          <div className="favorites-empty">
            <div className="empty-icon-wrap">
              <HeartOff size={48} strokeWidth={1.5} />
            </div>
            <h3>Hali hech narsa yo'q</h3>
            <p>Sport zallarni yoqtirganda ular shu yerda saqlanadi</p>
          </div>
        )}

        {!gymsLoading && !gymsError && liked.length > 0 && (
          <div className="fav-grid">
            {liked.map((gym) => (
              <div
                key={gym.id}
                className="fav-card"
                onClick={() => setSelectedId(gym.id)}
              >
                <div className="fav-card-visual" style={{ background: gym.gradient }}>
                  <button
                    type="button"
                    className="fav-unlike-btn"
                    onClick={(e) => handleUnlike(e, gym.id)}
                    title="Sevimlilardan olib tashlash"
                  >
                    <Heart size={16} fill="#ff5b5b" stroke="#ff5b5b" strokeWidth={2} />
                  </button>

                  <div className="fav-visual-icon">
                    <svg viewBox="0 0 80 80" fill="none" aria-hidden>
                      <rect x="6" y="34" width="12" height="12" rx="4" fill="white" opacity="0.25"/>
                      <rect x="62" y="34" width="12" height="12" rx="4" fill="white" opacity="0.25"/>
                      <rect x="17" y="28" width="9" height="24" rx="4" fill="white" opacity="0.35"/>
                      <rect x="54" y="28" width="9" height="24" rx="4" fill="white" opacity="0.35"/>
                      <rect x="26" y="36" width="28" height="8" rx="4" fill="white" opacity="0.5"/>
                    </svg>
                  </div>

                  <div className="fav-card-badges">
                    <span className={`fav-status ${gym.isOpen ? 'open' : 'closed'}`}>
                      <span className="status-dot" />
                      {gym.isOpen ? t('open_now') : t('closed_now')}
                    </span>
                  </div>
                </div>

                <div className="fav-card-info">
                  <div className="fav-card-top">
                    <h3 className="fav-card-name">{gym.name}</h3>
                    <div className="fav-card-rating">
                      <Star size={12} fill="#96E20C" stroke="none" />
                      <span>{gym.rating ?? 0}</span>
                    </div>
                  </div>

                  <div className="fav-card-location">
                    <MapPin size={11} />
                    <span>{gym.district || '—'}</span>
                  </div>

                  <div className="fav-card-footer">
                    <span className="fav-price">
                      {formatPrice(gym.monthlyPrice)} so'm/oy
                    </span>
                    <div className="fav-hours">
                      <Clock size={11} />
                      <span>{gym.hours || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bottom-spacer" />
      </div>

      {selectedGym && (
        <GymDetail
          key={selectedGym.id}
          gym={selectedGym}
          onClose={() => setSelectedId(null)}
          onToggleLike={(id) => toggleLike?.(id)}
          onRequireAuth={() => onNavigate?.('profile')}
        />
      )}
    </div>
  );
}
