import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Heart, Share2, Star, MapPin, Phone,
  Clock, Droplets, Car, Wifi, Lock, Wind,
  Activity, Dumbbell, Flame, Waves, Coffee,
  ChevronRight, ChevronLeft, CheckCircle2, Image, Eye, Instagram,
} from 'lucide-react';
import { apiFetch, getUser } from '../../utils/api';
import './GymDetail.css';

function YandexLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#FFDE00" />
      <path
        d="M6.7 16.8c.7-2 2.1-4.3 3.8-6.5l.6-.8c.9-1.1 1.4-1.7 1.8-2.2.3-.4.5-.7.7-.9.2.2.4.5.7.9.4.5.9 1.1 1.8 2.2l.6.8c1.7 2.2 3.1 4.5 3.8 6.5-1.8 1.3-4.1 2-6.7 2s-4.9-.7-6.7-2z"
        fill="#D80027"
        opacity="0.95"
      />
      <path
        d="M9 12c.7-1.9 1.7-3.5 3-5 1.3 1.5 2.3 3.1 3 5-1.1.8-2.1 1.2-3 1.2S10.1 12.8 9 12z"
        fill="#fff"
        opacity="0.85"
      />
    </svg>
  );
}

function TelegramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#229ED9"
        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
      />
    </svg>
  );
}

function GoogleLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21.35 11.1H12v2.98h5.36c-.54 2.08-2.43 3.64-5.36 3.64-3.16 0-5.73-2.57-5.73-5.73S8.84 6.26 12 6.26c1.53 0 2.8.6 3.77 1.58l2.27-2.27C16.43 3.99 14.35 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.64-3.65 8.64-8.78 0-.6-.07-1.07-.29-1.32z"
        fill="#4285F4"
      />
      <path
        d="M6.62 12.92c-.3-.9-.3-2.05 0-2.95l-2.5-2.5C2.5 8.38 2.3 9.7 2.3 12s.2 3.62.82 4.53l2.5-2.51z"
        fill="#34A853"
      />
      <path
        d="M21.65 12c0-.6-.07-1.07-.29-1.32H12v2.98h5.36c-.23.86-.73 1.63-1.4 2.19l2.13 1.65c1.25-1.16 1.93-2.9 1.93-4.5z"
        fill="#FBBC05"
      />
      <path
        d="M12 21c2.3 0 4.26-.76 5.68-2.07l-2.13-1.65c-.6.5-1.42.81-2.55.81-2.77 0-5.1-1.92-5.63-4.5l-2.55 2.51C5.7 18.9 8.6 21 12 21z"
        fill="#EA4335"
      />
    </svg>
  );
}

const facilityConfig = {
  shower:   { icon: Droplets,  key: 'facility_shower' },
  parking:  { icon: Car,       key: 'facility_parking' },
  wifi:     { icon: Wifi,      key: 'facility_wifi' },
  locker:   { icon: Lock,      key: 'facility_locker' },
  ac:       { icon: Wind,      key: 'facility_ac' },
  cardio:   { icon: Activity,  key: 'facility_cardio' },
  strength: { icon: Dumbbell,  key: 'facility_strength' },
  sauna:    { icon: Flame,     key: 'facility_sauna' },
  pool:     { icon: Waves,     key: 'facility_pool' },
  cafe:     { icon: Coffee,    key: 'facility_cafe' },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sporton-api.onrender.com';

function buildSlides(gym) {
  const images = Array.isArray(gym?.images) ? gym.images.filter(Boolean) : [];
  
  if (images.length > 0) {
    return images.map((url, i) => {
      // API_BASE_URL is prepended if the url is a relative path (e.g. /media/...)
      const resolvedSrc = (url.startsWith('/') && !url.startsWith('http')) 
        ? `${API_BASE_URL}${url}` 
        : url;
        
      return {
        src: resolvedSrc,
        bg: gym.gradient || '#0078FF',
        label: i === 0 ? 'Asosiy zal' : `Rasm ${i + 1}`,
      };
    });
  }

  // Agar admin umuman rasm yuklamagan bo'lsa, 10 ta fon yaratmaslik uchun bitta asosiy fon ko'rsatamiz
  return [
    { 
      bg: gym.gradient || 'linear-gradient(135deg, #0f172a 0%, #0078FF 100%)', 
      label: 'Surat mavjud emas' 
    },
  ];
}

function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price);
}

/* ── Gallery ── */
function GalleryHero({ gym, onClose, liked, onToggleLike }) {
  const slides = buildSlides(gym);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [brokenSlides, setBrokenSlides] = useState({});

  const go = useCallback((next) => {
    if (animating) return;
    const d = next > idx ? 'left' : 'right';
    setDir(d);
    setAnimating(true);
    setTimeout(() => {
      setIdx(next);
      setAnimating(false);
    }, 260);
  }, [idx, animating]);

  const prev = (e) => { e.stopPropagation(); go(idx === 0 ? slides.length - 1 : idx - 1); };
  const next = (e) => { e.stopPropagation(); go(idx === slides.length - 1 ? 0 : idx + 1); };

  return (
    <div className="gd-gallery">
      {/* Slide background */}
      <div
        className={`gd-slide ${animating ? `slide-out-${dir}` : 'slide-in'}`}
        style={{ background: slides[idx].bg }}
        key={idx}
      >
        {slides[idx].src && !brokenSlides[slides[idx].src] && (
          <>
            <img
              className="gd-slide-bg-blur"
              src={slides[idx].src}
              alt=""
              aria-hidden
            />
            <img
              className="gd-slide-img"
              src={slides[idx].src}
              alt={slides[idx].label}
              draggable={false}
              onError={() => setBrokenSlides((prev) => ({ ...prev, [slides[idx].src]: true }))}
            />
          </>
        )}
        <div className="gd-hero-overlay" />
      </div>

      {/* ── Floating topbar (inside gallery) ── */}
      <div className="gd-topbar-overlay">
        <button className="gd-back-btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <div className="gd-topbar-right">
          <div className="gd-counter-badge">{idx + 1} / {slides.length}</div>
          <div className="gd-topbar-actions">
            <button className="gd-action-btn"><Share2 size={18} /></button>
            <button
              className={`gd-action-btn ${liked ? 'liked' : ''}`}
              onClick={onToggleLike}
            >
              <Heart
                size={18}
                fill={liked ? '#ff5b5b' : 'none'}
                stroke={liked ? '#ff5b5b' : 'currentColor'}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <button className="gd-nav-btn gd-nav-prev" onClick={prev}>
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>
      <button className="gd-nav-btn gd-nav-next" onClick={next}>
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>

      {/* Bottom: label + dots */}
      <div className="gd-gallery-bottom">
        <div className="gd-slide-label">
          <Image size={11} />
          <span>{slides[idx].label}</span>
        </div>
        <div className="gd-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`gd-dot ${i === idx ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); go(i); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GymDetail({ gym, onClose, onToggleLike, onRequireAuth }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [gymData, setGymData] = useState(gym);
  const [myScore, setMyScore] = useState(null);
  const [myComment, setMyComment] = useState('');
  const [hoverScore, setHoverScore] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const user = getUser();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => setVisible(true));

    // Fetch live data and my rating
    const fetchData = async () => {
      try {
        const data = await apiFetch(`/api/gyms/${gym.id}/`);
        setGymData(prev => ({ ...prev, ...data }));
      } catch {}
      if (user) {
        try {
          const r = await apiFetch(`/api/gyms/${gym.id}/rate/`);
          setMyScore(r.yourScore);
          setMyComment(r.yourComment || '');
        } catch {}
      }
    };
    fetchData();

    return () => {
      document.body.style.overflow = '';
      cancelAnimationFrame(raf);
    };
  }, [gym.id, user]);

  const handleRate = (score) => {
    const currentUser = getUser();
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    setMyScore(score);
    setShowCommentBox(true);
  };

  const handleSubmitReview = async () => {
    if (!myScore) return;
    setRatingLoading(true);
    try {
      const res = await apiFetch(`/api/gyms/${gym.id}/rate/`, {
        method: 'POST',
        body: JSON.stringify({ score: myScore, comment: myComment }),
      });
      setGymData(prev => ({
        ...prev,
        rating: res.newRating,
        ratingCount: res.ratingCount,
        ratingPercent: res.ratingPercent,
        reviews: [
          {
            id: Date.now(),
            username: user?.username,
            fullName: user?.username,
            score: myScore,
            comment: myComment,
            date: new Date().toLocaleDateString('uz-UZ'),
          },
          ...(prev.reviews || []).filter(r => r.username !== user?.username),
        ],
      }));
      setShowCommentBox(false);
    } catch (e) {
      alert(e?.message || 'Xato yuz berdi');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleClose = () => {
    setClosing(true);
    setVisible(false);
    setTimeout(onClose, 380);
  };

  const telHref = gymData?.phone ? `tel:${gymData.phone.replace(/\s/g,'')}` : null;
  const telegramUrl = (gymData?.telegramUrl || '').trim();
  const instagramUrl = (gymData?.instagramUrl || '').trim();
  const lat = Number(gymData?.lat ?? 0);
  const lng = Number(gymData?.lng ?? 0);
  const addressQuery = gymData?.address || gymData?.district || '';

  const googleMapsHref =
    gymData?.googleMapsUrl ||
    (lat && lng
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : `https://www.google.com/maps?q=${encodeURIComponent(addressQuery)}`);

  const yandexMapsHref =
    gymData?.yandexMapsUrl ||
    (lat && lng
      ? `https://yandex.com/maps/?ll=${lng},${lat}&z=12&l=map`
      : `https://yandex.com/maps/?text=${encodeURIComponent(addressQuery)}`);

  const displayScore = hoverScore ?? myScore;

  return (
    <div
      className={`gd-backdrop ${visible ? 'visible' : ''} ${closing ? 'closing' : ''}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`gd-sheet ${visible ? 'visible' : ''} ${closing ? 'closing' : ''}`}>

        {/* ── Gallery Hero (topbar inside) ── */}
        <GalleryHero
          gym={gym}
          onClose={handleClose}
          liked={gym.liked}
          onToggleLike={() => onToggleLike(gym.id)}
        />

        {/* Status + Rating bar */}
        <div className="gd-hero-bottom">
          <span className={`gd-status-badge ${gymData.isOpen ? 'open' : 'closed'}`}>
            <span className="gd-status-dot" />
            {gymData.isOpen ? t('open_now') : t('closed_now')}
          </span>
          <div className="gd-hero-rating">
            <Star size={13} fill="#96E20C" stroke="none" />
            <span>{gymData.rating}</span>
            <span className="gd-review-count">({gymData.reviewsCount} {t('reviews')})</span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="gd-content">

          <div className="gd-name-row">
            <div>
              <h1 className="gd-name">{gymData.name}</h1>
              <div className="gd-location">
                <MapPin size={13} className="gd-pin" />
                <span>{gymData.address}</span>
              </div>
            </div>
            <div className="gd-price-pill">
              <span className="gd-price-val">{formatPrice(gymData.monthlyPrice)}</span>
              <span className="gd-price-label">so'm{t('per_month')}</span>
            </div>
          </div>

          <div className="gd-stats">
            <div className="gd-stat">
              <div className="gd-stat-icon" style={{ background: '#dbeffe', color: '#0078FF' }}>
                <Clock size={17} />
              </div>
              <span className="gd-stat-val">{gymData.hours}</span>
              <span className="gd-stat-lbl">{t('working_hours')}</span>
            </div>
            <div className="gd-stat-div" />
            <div className="gd-stat">
              <div className="gd-stat-icon" style={{ background: '#f4fde0', color: '#4a7000' }}>
                <Star size={17} />
              </div>
              <span className="gd-stat-val">{gymData.rating} / 5</span>
              <span className="gd-stat-lbl">{t('rating')}</span>
            </div>
            <div className="gd-stat-div" />
            <div className="gd-stat">
              <div className="gd-stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
                <Eye size={17} />
              </div>
              <span className="gd-stat-val">{gymData.reviewsCount}</span>
              <span className="gd-stat-lbl">Ko'rishlar</span>
            </div>
          </div>

          <div className="gd-map-actions">
            <a
              className="gd-map-btn gd-map-btn-yandex"
              href={yandexMapsHref}
              target="_blank"
              rel="noreferrer"
            >
              <YandexLogo size={20} />
              <span>Yandex Maps</span>
            </a>

            <a
              className="gd-map-btn gd-map-btn-google"
              href={googleMapsHref}
              target="_blank"
              rel="noreferrer"
            >
              <GoogleLogo size={20} />
              <span>Google Maps</span>
            </a>
          </div>

          {/* Phone — clickable call button */}
          {gymData.phone ? (
            <a href={telHref} className="gd-phone-call-row">
              <div className="gd-phone-display-left">
                <Phone size={16} className="gd-phone-display-icon" />
                <span className="gd-phone-display-label">{t('phone')}</span>
              </div>
              <span className="gd-phone-display-number gd-phone-link">{gymData.phone}</span>
            </a>
          ) : (
            <div className="gd-phone-display">
              <div className="gd-phone-display-left">
                <Phone size={16} className="gd-phone-display-icon" />
                <span className="gd-phone-display-label">{t('phone')}</span>
              </div>
              <span className="gd-phone-display-number">—</span>
            </div>
          )}

          {/* Rating + Sharh qoldirish */}
          <div className="gd-rating-section">
            <div className="gd-rating-top">
              <div className="gd-rating-summary">
                <span className="gd-rating-big">{gymData.rating || '0.0'}</span>
                <div className="gd-rating-meta">
                  <div className="gd-rating-bar-wrap">
                    <div className="gd-rating-bar-fill" style={{ width: `${gymData.ratingPercent || 0}%` }} />
                  </div>
                  <span className="gd-rating-pct">{gymData.ratingPercent || 0}%</span>
                  <span className="gd-rating-count">{gymData.ratingCount || 0} ta baho</span>
                </div>
              </div>
              <div>
                <p className="gd-rating-label">{myScore ? 'Bahoyingiz:' : 'Baho bering:'}</p>
                <div className="gd-stars">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      className={`gd-star-btn ${star <= (hoverScore ?? myScore ?? 0) ? 'active' : ''}`}
                      onMouseEnter={() => setHoverScore(star)}
                      onMouseLeave={() => setHoverScore(null)}
                      onClick={() => handleRate(star)}
                      aria-label={`${star} yulduz`}
                    >
                      <Star
                        size={24}
                        fill={star <= (hoverScore ?? myScore ?? 0) ? '#f59e0b' : 'none'}
                        stroke={star <= (hoverScore ?? myScore ?? 0) ? '#f59e0b' : '#d1d5db'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {myScore && myComment && !showCommentBox && (
              <p className="gd-rating-your-score">
                {'★'.repeat(myScore)}{'☆'.repeat(5 - myScore)} — "{myComment}"
              </p>
            )}
            {showCommentBox && (
              <div className="gd-comment-box">
                <textarea
                  className="gd-comment-textarea"
                  placeholder="Sharh yozing (ixtiyoriy)..."
                  value={myComment}
                  onChange={e => setMyComment(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <div className="gd-comment-actions">
                  <button className="gd-comment-cancel" onClick={() => setShowCommentBox(false)}>
                    Bekor qilish
                  </button>
                  <button className="gd-comment-submit" onClick={handleSubmitReview} disabled={ratingLoading}>
                    {ratingLoading ? 'Saqlanmoqda…' : 'Yuborish ✓'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="gd-section">
            <h3 className="gd-section-title">{t('about_gym')}</h3>
            <p className="gd-desc">{gymData.description}</p>
          </div>

          <div className="gd-section">
            <h3 className="gd-section-title">{t('price_info')}</h3>
            <div className="gd-prices">
              <div className="gd-price-card" style={{ borderColor: '#dbeffe' }}>
                <span className="gd-price-card-label">{t('monthly_price')}</span>
                <span className="gd-price-card-val" style={{ color: '#0078FF' }}>
                  {formatPrice(gymData.monthlyPrice)} so'm
                </span>
                <span className="gd-price-card-period">{t('per_month')}</span>
              </div>
              <div className="gd-price-card" style={{ borderColor: '#f4fde0' }}>
                <span className="gd-price-card-label">{t('entry_price')}</span>
                <span className="gd-price-card-val" style={{ color: '#4a7000' }}>
                  {formatPrice(gymData.entryPrice)} so'm
                </span>
                <span className="gd-price-card-period">{t('per_entry')}</span>
              </div>
            </div>
          </div>

          <div className="gd-section">
            <h3 className="gd-section-title">{t('facilities')}</h3>
            <div className="gd-facilities">
              {(gymData.facilities || []).map((fKey) => {
                const cfg = facilityConfig[fKey];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return (
                  <div key={fKey} className="gd-facility-item">
                    <div className="gd-facility-icon">
                      <Icon size={18} />
                    </div>
                    <span>{t(cfg.key)}</span>
                    <CheckCircle2 size={13} className="gd-facility-check" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sharhlar ro'yxati */}
          {gymData.reviews && gymData.reviews.length > 0 && (
            <div className="gd-section">
              <h3 className="gd-section-title">
                Sharhlar
                <span className="gd-reviews-count-badge">{gymData.reviews.length}</span>
              </h3>
              <div className="gd-reviews-list">
                {gymData.reviews.map((r) => (
                  <div key={r.id} className="gd-review-card">
                    <div className="gd-review-header">
                      <div className="gd-review-avatar">
                        {(r.fullName || r.username || '?')[0].toUpperCase()}
                      </div>
                      <div className="gd-review-meta">
                        <span className="gd-review-name">{r.fullName || r.username}</span>
                        <span className="gd-review-date">{r.date}</span>
                      </div>
                      <div className="gd-review-stars">
                        <span style={{ color: '#f59e0b' }}>{'★'.repeat(r.score)}</span>
                        <span style={{ color: '#d1d5db' }}>{'☆'.repeat(5 - r.score)}</span>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="gd-review-comment">"{r.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="gd-footer">
          <div className="gd-footer-info">
            <span className="gd-footer-name">{gymData.name}</span>
            <span className="gd-footer-district">{gymData.district}</span>
          </div>
          {(telegramUrl || instagramUrl) && (
            <div className="gd-call-actions">
              {telegramUrl && (
                <a
                  className="gd-call-logo-btn gd-call-logo-btn-telegram"
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TelegramIcon size={20} />
                  <span>{t('social_telegram')}</span>
                </a>
              )}
              {instagramUrl && (
                <a
                  className="gd-call-logo-btn gd-call-logo-btn-instagram"
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} strokeWidth={2} className="gd-instagram-footer-icon" />
                  <span>{t('social_instagram')}</span>
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
