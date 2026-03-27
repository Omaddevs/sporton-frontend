import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Star, MapPin, Clock } from 'lucide-react';
import GymDetail from '../GymDetail/GymDetail';
import { getGymImageUrl } from '../../utils/gymImageUrl';
import './GymList.css';

function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price);
}

export default function GymList({ gyms = [], toggleLike }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});

  const handleToggleLike = (e, id) => {
    e.stopPropagation();
    toggleLike?.(id);
  };

  return (
    <>
      <section className="gym-section">
        <div className="section-header">
          <h2 className="section-title">{t('gyms_section')}</h2>
          <button className="see-all-btn">{t('see_all')}</button>
        </div>

        <div className="gym-grid">
          {gyms.map((gym) => {
            const imageUrl = brokenImages[gym.id] ? null : getGymImageUrl(gym);
            return (
            <div
              key={gym.id}
              className="gym-card"
              onClick={() => setSelected(gym)}
            >
              {/* Card visual */}
              <div className="gym-card-visual" style={{ background: gym.gradient || '#0f172a' }}>
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt={gym.name} 
                    className="gym-card-bg-img"
                    loading="lazy"
                    onError={() => setBrokenImages((prev) => ({ ...prev, [gym.id]: true }))}
                  />
                )}
                
                <button
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
                    <span className="gym-visual-stats-rating">{gym.rating}</span>
                    <span className="gym-visual-stats-reviews">({gym.reviewsCount})</span>
                  </span>
                </div>

                {!imageUrl && (
                  <div className="gym-visual-icon">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="34" width="12" height="12" rx="4" fill="white" opacity="0.25"/>
                      <rect x="62" y="34" width="12" height="12" rx="4" fill="white" opacity="0.25"/>
                      <rect x="17" y="28" width="9" height="24" rx="4" fill="white" opacity="0.35"/>
                      <rect x="54" y="28" width="9" height="24" rx="4" fill="white" opacity="0.35"/>
                      <rect x="26" y="36" width="28" height="8" rx="4" fill="white" opacity="0.5"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Card info */}
              <div className="gym-card-info">
                <div className="gym-card-top">
                  <h3 className="gym-card-name">{gym.name}</h3>
                </div>

                <div className="gym-card-location">
                  <MapPin size={11} className="loc-icon" />
                  <span className="gym-card-address">{gym.address || gym.district}</span>
                </div>

                <div className="gym-card-footer">
                  <div className="gym-card-price">
                    <span className="price-amount">{formatPrice(gym.monthlyPrice)}</span>
                    <span className="price-unit"> so'm{t('per_month')}</span>
                  </div>
                  <div className="gym-card-hours">
                    <Clock size={11} />
                    <span>{gym.hours}</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {selected && (
        <GymDetail
          gym={gyms.find((g) => g.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          onToggleLike={(id) => {
            toggleLike?.(id);
          }}
        />
      )}
    </>
  );
}
