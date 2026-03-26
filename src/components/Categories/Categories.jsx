import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dumbbell, CircleDot, Target, Trophy, Shield, Swords, Zap,
  Flame, Users, Activity, Layers, Waves, Heart, Timer,
  Footprints, Grid3x3, Bike, LayoutGrid, PersonStanding,
} from 'lucide-react';
import './Categories.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sporton-api.onrender.com';

/** Lucide icon name (from backend) → component mapping */
const ICON_MAP = {
  Dumbbell,
  CircleDot,
  Target,
  Trophy,
  Shield,
  Swords,
  Zap,
  Flame,
  Users,
  Activity,
  Layers,
  Waves,
  PersonStanding,
  Heart,
  Timer,
  Footprints,
  Grid3x3,
  Bike,
  LayoutGrid,
  // Volleyball not found in lucide — fallback to CircleDot
  Volleyball: CircleDot,
};

function CategoryIcon({ name, size = 26 }) {
  const Comp = ICON_MAP[name];
  if (Comp) return <Comp size={size} strokeWidth={1.8} />;
  // Fallback: first letter
  return (
    <span style={{ fontWeight: 900, fontSize: 20 }}>
      {String(name || '?')[0].toUpperCase()}
    </span>
  );
}

export default function Categories({ activeSport, onCategorySelect } = {}) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/gyms/categories/`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.categories)) setCategories(data.categories);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = activeSport || null;

  return (
    <section className="categories-section">
      <div className="section-header">
        <h2 className="section-title">{t('categories')}</h2>
        {active && (
          <button className="see-all-btn" onClick={() => onCategorySelect?.(null)}>
            Hammasini ko'rish
          </button>
        )}
      </div>

      <div className="categories-scroll-wrap">
        <div className="categories-list">

          {/* "Barchasi" */}
          <button
            className={`category-item ${!active ? 'active' : ''}`}
            onClick={() => onCategorySelect?.(null)}
          >
            <div className="category-icon-wrap">
              <LayoutGrid size={26} strokeWidth={1.8} />
            </div>
            <span className="category-name">Barchasi</span>
          </button>

          {loading
            ? [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="category-item category-skeleton" />
              ))
            : categories.map(cat => (
                <button
                  key={cat.slug}
                  className={`category-item ${active === cat.slug ? 'active' : ''}`}
                  onClick={() => onCategorySelect?.(cat.slug)}
                >
                  <div className="category-icon-wrap">
                    <CategoryIcon name={cat.icon} size={26} />
                  </div>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))
          }
        </div>
      </div>
    </section>
  );
}
