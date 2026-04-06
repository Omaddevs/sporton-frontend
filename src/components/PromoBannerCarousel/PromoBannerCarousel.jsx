import { useState, useRef, useEffect, useCallback } from 'react';
import { Compass, Heart, Home, ExternalLink, Sparkles } from 'lucide-react';
import './PromoBannerCarousel.css';

const SWIPE_THRESHOLD = 48;

function handleBannerAction(banner, onNavigate) {
  const { target, link_url: linkUrl } = banner;
  if (target === 'external' && linkUrl) {
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  if (target === 'explore' || target === 'favorite' || target === 'home') {
    onNavigate?.(target);
  }
}

export default function PromoBannerCarousel({ banners = [], onNavigate }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const touchStartRef = useRef(null);

  const count = banners.length;
  const safeIndex = count ? Math.min(index, count - 1) : 0;

  useEffect(() => {
    setIndex(0);
  }, [count]);

  const go = useCallback(
    (dir) => {
      if (count <= 1) return;
      setIndex((i) => {
        if (dir < 0) return i <= 0 ? count - 1 : i - 1;
        return i >= count - 1 ? 0 : i + 1;
      });
    },
    [count]
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el || count < 1) return;
    const pct = -(safeIndex * (100 / count));
    el.style.transform = `translateX(${pct}%)`;
  }, [safeIndex, count]);

  const onTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const start = touchStartRef.current;
    if (start == null) return;
    touchStartRef.current = null;
    const end = e.changedTouches[0].clientX;
    const dx = end - start;
    if (dx > SWIPE_THRESHOLD) go(-1);
    else if (dx < -SWIPE_THRESHOLD) go(1);
  };

  if (!count) return null;

  const slidePct = 100 / count;

  return (
    <section className="promo-banner-section" aria-label="Aksiyalar">
      <div className="promo-banner-viewport">
        <div
          ref={trackRef}
          className="promo-banner-track"
          style={{ width: `${count * 100}%` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {banners.map((b) => (
            <article
              key={b.id}
              className="promo-banner-slide"
              style={{ width: `${slidePct}%` }}
            >
              <div
                className={`promo-banner-card ${b.image_url ? 'has-image' : ''}`}
                style={{
                  background:
                    b.gradient ||
                    `linear-gradient(135deg, ${b.bg_color_start || '#0078FF'} 0%, ${b.bg_color_end || '#004aad'} 100%)`,
                }}
              >
                {b.image_url ? (
                  <img
                    src={b.image_url}
                    alt=""
                    className="promo-banner-bg-img"
                    loading="lazy"
                  />
                ) : null}
                <div className="promo-banner-waves" aria-hidden />
                <div className="promo-banner-inner">
                  <div className="promo-banner-copy">
                    <h3 className="promo-banner-title">{b.title}</h3>
                    {b.subtitle ? <p className="promo-banner-sub">{b.subtitle}</p> : null}
                    <button
                      type="button"
                      className="promo-banner-cta"
                      onClick={() => handleBannerAction(b, onNavigate)}
                    >
                      <TargetIcon target={b.target} />
                      {b.cta_text || "Ko'rish"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {count > 1 ? (
          <div className="promo-banner-dots-wrap">
            <div className="promo-banner-dots" role="tablist" aria-label="Bannerlar">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIndex}
                  className={`promo-dot ${i === safeIndex ? 'active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`${i + 1} / ${count}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TargetIcon({ target }) {
  const p = { size: 15, strokeWidth: 2.4 };
  switch (target) {
    case 'explore':
      return <Compass {...p} />;
    case 'favorite':
      return <Heart {...p} />;
    case 'home':
      return <Home {...p} />;
    case 'external':
      return <ExternalLink {...p} />;
    default:
      return <Sparkles {...p} />;
  }
}
