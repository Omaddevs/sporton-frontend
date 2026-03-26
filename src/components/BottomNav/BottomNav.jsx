import { useTranslation } from 'react-i18next';
import { Home, Compass, Heart, User } from 'lucide-react';
import './BottomNav.css';

const navItems = [
  { key: 'home',     icon: Home,    labelKey: 'home' },
  { key: 'explore',  icon: Compass, labelKey: 'explore' },
  { key: 'favorite', icon: Heart,   labelKey: 'favorite' },
  { key: 'profile',  icon: User,    labelKey: 'profile' },
];

export default function BottomNav({ activePage = 'home', onNavigate }) {
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav">
      <div className="nav-inner">
        {navItems.map(({ key, icon: Icon, labelKey }) => {
          const isActive = activePage === key;
          return (
            <button
              key={key}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate?.(key)}
            >
              <div className="nav-icon-wrap">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="nav-label">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
