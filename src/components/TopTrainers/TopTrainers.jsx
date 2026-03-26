import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import './TopTrainers.css';

const trainers = [
  { id: 1, nameKey: 'trainer_1', specialty: 'Yoga',      rating: 4.9, color: '#dbeffe', textColor: '#0057b3' },
  { id: 2, nameKey: 'trainer_2', specialty: 'GYM',       rating: 4.8, color: '#f4fde0', textColor: '#4a7000' },
  { id: 3, nameKey: 'trainer_3', specialty: 'Running',   rating: 4.7, color: '#e0f7fa', textColor: '#006064' },
  { id: 4, nameKey: 'trainer_4', specialty: 'Swimming',  rating: 4.9, color: '#e8f0fe', textColor: '#1a56db' },
];

const initials = (name) => name.slice(0, 2).toUpperCase();

export default function TopTrainers() {
  const { t } = useTranslation();

  return (
    <section className="trainers-section">
      <div className="section-header">
        <h2 className="section-title">{t('top_trainer')}</h2>
        <button className="see-all-btn">{t('see_all')}</button>
      </div>
      <div className="trainers-list">
        {trainers.map((tr) => (
          <div key={tr.id} className="trainer-card">
            <div
              className="trainer-avatar"
              style={{ background: tr.color, color: tr.textColor }}
            >
              {initials(t(tr.nameKey))}
            </div>
            <div className="trainer-info">
              <span className="trainer-name">{t(tr.nameKey)}</span>
              <span className="trainer-specialty">{tr.specialty}</span>
            </div>
            <div className="trainer-rating">
              <Star size={12} fill="#96E20C" stroke="none" />
              <span>{tr.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
