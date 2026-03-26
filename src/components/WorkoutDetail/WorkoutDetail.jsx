import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Heart, Share2, Star, Clock, Layers,
  Calendar, User, CheckCircle2, Play, Zap,
} from 'lucide-react';
import './WorkoutDetail.css';

const levelColors = {
  Beginner:      { bg: '#e0fce7', text: '#166534' },
  "Boshlang'ich":{ bg: '#e0fce7', text: '#166534' },
  'Начинающий':  { bg: '#e0fce7', text: '#166534' },
  Intermediate:  { bg: '#fef9c3', text: '#854d0e' },
  "O'rta":       { bg: '#fef9c3', text: '#854d0e' },
  'Средний':     { bg: '#fef9c3', text: '#854d0e' },
  Advanced:      { bg: '#fee2e2', text: '#991b1b' },
  "Ilg'or":      { bg: '#fee2e2', text: '#991b1b' },
  'Продвинутый': { bg: '#fee2e2', text: '#991b1b' },
};

export default function WorkoutDetail({ workout, onClose }) {
  const { t } = useTranslation();
  const [liked, setLiked]     = useState(workout.liked);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // lock body scroll
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => {
      document.body.style.overflow = '';
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleClose = () => {
    setClosing(true);
    setVisible(false);
    setTimeout(onClose, 380);
  };

  const level   = t(`${workout.titleKey.replace('_title', '_level')}`);
  const levelStyle = levelColors[level] || { bg: '#e0f0ff', text: '#0057b3' };

  const includes = ['include_1', 'include_2', 'include_3', 'include_4'];

  return (
    <div
      className={`wd-backdrop ${visible ? 'visible' : ''} ${closing ? 'closing' : ''}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`wd-sheet ${visible ? 'visible' : ''} ${closing ? 'closing' : ''}`}>

        {/* ── Hero ── */}
        <div className={`wd-hero ${workout.bg}`}>
          <div className="wd-hero-overlay" />

          {/* Top bar */}
          <div className="wd-topbar">
            <button className="wd-back-btn" onClick={handleClose}>
              <ArrowLeft size={20} />
            </button>
            <div className="wd-topbar-actions">
              <button className="wd-action-btn">
                <Share2 size={18} />
              </button>
              <button
                className={`wd-action-btn ${liked ? 'liked' : ''}`}
                onClick={() => setLiked((l) => !l)}
              >
                <Heart size={18} fill={liked ? '#ff5b5b' : 'none'} stroke={liked ? '#ff5b5b' : 'currentColor'} />
              </button>
            </div>
          </div>

          {/* Hero tag + play */}
          <div className="wd-hero-bottom">
            <span className="wd-hero-tag">{t(workout.tagKey)}</span>
            <button className="wd-play-btn">
              <Play size={20} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="wd-content">

          {/* Title row */}
          <div className="wd-title-row">
            <div>
              <span
                className="wd-level-badge"
                style={{ background: levelStyle.bg, color: levelStyle.text }}
              >
                <Zap size={11} />
                {level}
              </span>
              <h1 className="wd-title">{t(workout.titleKey)}</h1>
            </div>
            <div className="wd-price-block">
              <span className="wd-price">${workout.price}</span>
              <span className="wd-price-sub">/session</span>
            </div>
          </div>

          {/* Rating */}
          <div className="wd-rating-row">
            {[1,2,3,4,5].map((s) => (
              <Star
                key={s}
                size={15}
                fill={s <= Math.round(workout.rating) ? '#96E20C' : '#e5e7eb'}
                stroke="none"
              />
            ))}
            <span className="wd-rating-val">{workout.rating}</span>
            <span className="wd-rating-count">(128 {t('reviews')})</span>
          </div>

          {/* Stats */}
          <div className="wd-stats">
            <div className="wd-stat">
              <div className="wd-stat-icon"><Clock size={18} /></div>
              <span className="wd-stat-val">{t(workout.titleKey.replace('_title', '_duration'))}</span>
              <span className="wd-stat-label">{t('duration')}</span>
            </div>
            <div className="wd-stat-divider" />
            <div className="wd-stat">
              <div className="wd-stat-icon"><Layers size={18} /></div>
              <span className="wd-stat-val">{t(workout.titleKey.replace('_title', '_sessions'))}</span>
              <span className="wd-stat-label">{t('sessions')}</span>
            </div>
            <div className="wd-stat-divider" />
            <div className="wd-stat">
              <div className="wd-stat-icon"><Calendar size={18} /></div>
              <span className="wd-stat-val">{t('mon_wed_fri')}</span>
              <span className="wd-stat-label">{t('schedule')}</span>
            </div>
          </div>

          {/* Trainer */}
          <div className="wd-trainer-card">
            <div className="wd-trainer-avatar">
              <User size={22} />
            </div>
            <div className="wd-trainer-info">
              <span className="wd-trainer-name">{t(workout.trainerKey)}</span>
              <span className="wd-trainer-role">Professional Trainer</span>
            </div>
            <button className="wd-follow-btn">Follow</button>
          </div>

          {/* About */}
          <div className="wd-section">
            <h3 className="wd-section-title">{t('about_workout')}</h3>
            <p className="wd-desc">{t(workout.titleKey.replace('_title', '_desc'))}</p>
          </div>

          {/* Includes */}
          <div className="wd-section">
            <h3 className="wd-section-title">{t('includes')}</h3>
            <div className="wd-includes">
              {includes.map((key) => (
                <div key={key} className="wd-include-item">
                  <CheckCircle2 size={16} className="wd-check-icon" />
                  <span>{t(key)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom spacer for button */}
          <div style={{ height: 100 }} />
        </div>

        {/* ── Fixed Book Button ── */}
        <div className="wd-footer">
          <div className="wd-footer-price">
            <span className="wd-footer-amount">${workout.price}.00</span>
            <span className="wd-footer-per">/session</span>
          </div>
          <button className="wd-book-btn">
            {t('book_now')}
          </button>
        </div>

      </div>
    </div>
  );
}
