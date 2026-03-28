import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Building2 } from 'lucide-react';
import './PostGymModal.css';

export default function PostGymModal({ onClose }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => {
      document.body.style.overflow = '';
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleTelegram = () => {
    window.open('https://t.me/omadbek_egamberdiyev', '_blank');
    handleClose();
  };

  return (
    <div
      className={`pgm-backdrop ${visible ? 'visible' : ''}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`pgm-card ${visible ? 'visible' : ''}`}>

        <button className="pgm-close" onClick={handleClose}>
          <X size={18} />
        </button>

        <div className="pgm-icon-wrap">
          <Building2 size={32} />
        </div>

        <h2 className="pgm-title">{t('post_gym_title')}</h2>
        <p className="pgm-desc">{t('post_gym_desc')}</p>

        <button className="pgm-telegram-btn" onClick={handleTelegram}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          {t('contact_telegram')}
        </button>

        <button className="pgm-cancel-btn" onClick={handleClose}>
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}
