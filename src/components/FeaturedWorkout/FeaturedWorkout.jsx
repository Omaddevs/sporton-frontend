import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Star, User } from 'lucide-react';
import WorkoutDetail from '../WorkoutDetail/WorkoutDetail';
import './FeaturedWorkout.css';

const workouts = [
  { id: 1, titleKey: 'workout_1_title', trainerKey: 'workout_1_trainer', tagKey: 'workout_1_tag', rating: 4.9, price: 150, bg: 'card-bg-1', liked: false },
  { id: 2, titleKey: 'workout_2_title', trainerKey: 'workout_2_trainer', tagKey: 'workout_2_tag', rating: 4.8, price: 150, bg: 'card-bg-2', liked: false },
  { id: 3, titleKey: 'workout_3_title', trainerKey: 'workout_3_trainer', tagKey: 'workout_3_tag', rating: 4.7, price: 120, bg: 'card-bg-3', liked: true },
  { id: 4, titleKey: 'workout_4_title', trainerKey: 'workout_4_trainer', tagKey: 'workout_4_tag', rating: 4.6, price: 100, bg: 'card-bg-4', liked: false },
];

export default function FeaturedWorkout() {
  const { t } = useTranslation();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [likedIds, setLikedIds] = useState(
    workouts.filter((w) => w.liked).map((w) => w.id)
  );

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">{t('featured_workout')}</h2>
          <button className="see-all-btn">{t('see_all')}</button>
        </div>
        <div className="featured-list">
          {workouts.map((w) => {
            const isLiked = likedIds.includes(w.id);
            return (
              <div
                key={w.id}
                className="workout-card"
                onClick={() => setSelectedWorkout({ ...w, liked: isLiked })}
              >
                <div className={`card-image ${w.bg}`}>
                  <button
                    className={`heart-btn ${isLiked ? 'liked' : ''}`}
                    onClick={(e) => toggleLike(e, w.id)}
                  >
                    <Heart
                      size={16}
                      fill={isLiked ? '#ff5b5b' : 'none'}
                      stroke={isLiked ? '#ff5b5b' : '#fff'}
                    />
                  </button>
                  <div className="card-tag">{t(w.tagKey)}</div>
                </div>
                <div className="card-body">
                  <div className="card-rating">
                    <Star size={12} fill="#96E20C" stroke="none" />
                    <span>{w.rating}</span>
                  </div>
                  <h3 className="card-title">{t(w.titleKey)}</h3>
                  <div className="card-trainer">
                    <div className="trainer-avatar-small">
                      <User size={12} />
                    </div>
                    <span>{t(w.trainerKey)}</span>
                  </div>
                  <div className="card-price">${w.price}.00</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedWorkout && (
        <WorkoutDetail
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}
    </>
  );
}
