import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  LogOut,
  ChevronRight,
  Heart,
  MapPin,
  Bell,
  Shield,
  HelpCircle,
  Compass,
  Building2,
  X,
} from 'lucide-react';
import './Profile.css';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import LocationPicker from '../../components/LocationPicker/LocationPicker';
import NotificationsPopup from '../../components/Notifications/NotificationsPopup';
import PostGymModal from '../../components/PostGymModal/PostGymModal';

const TELEGRAM_HELP = 'https://t.me/sporton_admin';

export default function ProfileView({
  user,
  onLogout,
  gyms,
  gymsLoading,
  gymsError,
  onNavigate,
  onUpdateProfile,
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [editingFullName, setEditingFullName] = useState(false);
  const [draftFullName, setDraftFullName] = useState(user?.fullName || '');
  const { t, i18n } = useTranslation();
  const langSectionRef = useRef(null);

  const list = Array.isArray(gyms) ? gyms : [];
  const likedCount = gymsLoading ? null : list.filter((g) => g.liked).length;
  const gymTotal = gymsLoading ? null : list.length;

  const displayName = user?.fullName || user?.username || user?.email || 'User';
  const initialsSource = user?.fullName?.trim() || user?.username || user?.email || 'U';
  const initials =
    initialsSource.includes(' ')
      ? initialsSource
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : initialsSource.slice(0, 2).toUpperCase();

  const scrollToLangSection = () => {
    langSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const menuItems = [
    {
      icon: MapPin,
      label: t('profile_menu_location'),
      sub: t('profile_menu_location_sub'),
      action: scrollToLangSection,
      tone: 'blue',
    },
    {
      icon: Bell,
      label: t('profile_menu_notify'),
      sub: t('profile_menu_notify_sub'),
      action: () => setShowNotifications(true),
      tone: 'amber',
    },
    {
      icon: Shield,
      label: t('profile_menu_privacy'),
      sub: t('profile_menu_privacy_sub'),
      action: () => setShowPrivacyModal(true),
      tone: 'slate',
    },
    {
      icon: HelpCircle,
      label: t('profile_menu_help'),
      sub: t('profile_menu_help_sub'),
      action: () => window.open(TELEGRAM_HELP, '_blank', 'noopener,noreferrer'),
      tone: 'green',
    },
  ];

  const startEdit = () => {
    setDraftFullName(user?.fullName || '');
    setEditingFullName(true);
  };

  const cancelEdit = () => {
    setEditingFullName(false);
    setDraftFullName(user?.fullName || '');
  };

  const saveEdit = () => {
    const name = (draftFullName || '').trim();
    if (!name) return;
    onUpdateProfile?.({ full_name: name });
    setEditingFullName(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-scroll">
        <div className="profile-hero">
          <div className="profile-hero-decor" aria-hidden />
          <span className="profile-member-pill">{t('profile_member')}</span>

          <div className="profile-avatar">
            <div className="avatar-initials">{initials}</div>
            {user.provider === 'google' && (
              <div className="provider-badge">
                <svg viewBox="0 0 24 24" width="12" height="12">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
            )}
          </div>

          <h2 className="profile-name">{displayName}</h2>
          {user?.email && <p className="profile-email">{user.email}</p>}

          <div className="profile-stats">
            <button type="button" className="stat-item stat-clickable" onClick={() => onNavigate?.('favorite')}>
              <span className="stat-num">
                {gymsLoading ? '…' : gymsError ? '—' : likedCount}
              </span>
              <span className="stat-label">{t('profile_stat_fav')}</span>
            </button>
            <div className="stat-divider" />
            <button type="button" className="stat-item stat-clickable" onClick={() => onNavigate?.('explore')}>
              <span className="stat-num">
                {gymsLoading ? '…' : gymsError ? '—' : gymTotal}
              </span>
              <span className="stat-label">{t('profile_stat_gyms')}</span>
            </button>
            <div className="stat-divider" />
            <button type="button" className="stat-item stat-clickable" onClick={() => setShowNotifications(true)}>
              <Bell size={16} strokeWidth={2.25} className="stat-icon" aria-hidden />
              <span className="stat-label">{t('profile_stat_notify')}</span>
            </button>
          </div>
        </div>

        <div className="profile-body">
          <h3 className="profile-section-title">{t('profile_quick_title')}</h3>
          <div className="profile-quick-grid">
            <button type="button" className="profile-quick-card profile-quick-explore" onClick={() => onNavigate?.('explore')}>
              <span className="profile-quick-icon">
                <Compass size={22} strokeWidth={2.2} />
              </span>
              <span className="profile-quick-label">{t('profile_quick_explore')}</span>
              <span className="profile-quick-sub">{t('profile_quick_explore_sub')}</span>
            </button>
            <button type="button" className="profile-quick-card profile-quick-fav" onClick={() => onNavigate?.('favorite')}>
              <span className="profile-quick-icon">
                <Heart size={22} strokeWidth={2.2} />
              </span>
              <span className="profile-quick-label">{t('profile_quick_fav')}</span>
              <span className="profile-quick-sub">{t('profile_quick_fav_sub', { count: likedCount })}</span>
            </button>
            <button type="button" className="profile-quick-card profile-quick-post" onClick={() => setShowPostModal(true)}>
              <span className="profile-quick-icon">
                <Building2 size={22} strokeWidth={2.2} />
              </span>
              <span className="profile-quick-label">{t('profile_quick_post')}</span>
              <span className="profile-quick-sub">{t('profile_quick_post_sub')}</span>
            </button>
          </div>

          <h3 className="profile-section-title">{t('profile_personal')}</h3>
          <div className="profile-info-card">
            <div className="info-row">
              <User size={16} className="info-icon" />
              <div>
                <span className="info-label">To'liq ism</span>
                {editingFullName ? (
                  <div className="info-edit">
                    <input
                      className="info-edit-input"
                      value={draftFullName}
                      onChange={(e) => setDraftFullName(e.target.value)}
                    />
                    <div className="info-edit-actions">
                      <button type="button" className="info-edit-cancel" onClick={cancelEdit}>
                        Bekor qilish
                      </button>
                      <button type="button" className="info-edit-save" onClick={saveEdit}>
                        Saqlash
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="info-value-row">
                    <span className="info-value">{user.fullName || '—'}</span>
                    <button type="button" className="info-edit-btn" onClick={startEdit} aria-label="Tahrirlash">
                      Tahrirlash
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="info-row">
              <Mail size={16} className="info-icon" />
              <div>
                <span className="info-label">Username</span>
                <span className="info-value">{user.username || user.email}</span>
              </div>
            </div>
          </div>

          <div ref={langSectionRef} id="profile-lang-section" className="profile-langloc-card">
            <div className="langloc-title">Til va joylashuv</div>
            <div className="langloc-row">
              <LocationPicker lang={i18n.language} />
              <LanguageSwitcher />
            </div>
          </div>

          <h3 className="profile-section-title">{t('profile_app_section')}</h3>
          <div className="profile-menu">
            {menuItems.map(({ icon: Icon, label, sub, action, tone }) => (
              <button key={label} type="button" className={`menu-item menu-item-active menu-tone-${tone}`} onClick={action}>
                <div className="menu-icon-wrap">
                  <Icon size={17} strokeWidth={2.1} />
                </div>
                <div className="menu-text">
                  <span className="menu-label">{label}</span>
                  <span className="menu-sub">{sub}</span>
                </div>
                <ChevronRight size={16} className="menu-arrow" />
              </button>
            ))}
          </div>

          <div className="profile-logout-wrap">
            {!showLogoutConfirm ? (
              <button type="button" className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
                <LogOut size={17} />
                Chiqish
              </button>
            ) : (
              <div className="logout-confirm">
                <p>Rostdan ham chiqmoqchimisiz?</p>
                <div className="logout-confirm-btns">
                  <button type="button" className="confirm-cancel" onClick={() => setShowLogoutConfirm(false)}>
                    Bekor qilish
                  </button>
                  <button type="button" className="confirm-ok" onClick={onLogout}>
                    Ha, chiqish
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="profile-footer-note">{t('profile_footer')}</p>
          <div className="bottom-spacer" />
        </div>
      </div>

      <NotificationsPopup open={showNotifications} onClose={() => setShowNotifications(false)} />
      {showPostModal && <PostGymModal onClose={() => setShowPostModal(false)} />}

      {showPrivacyModal && (
        <div
          className="profile-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-privacy-title"
          onClick={(e) => e.target === e.currentTarget && setShowPrivacyModal(false)}
        >
          <div className="profile-modal-card">
            <div className="profile-modal-head">
              <h4 id="profile-privacy-title">{t('profile_privacy_modal_title')}</h4>
              <button type="button" className="profile-modal-close" onClick={() => setShowPrivacyModal(false)} aria-label={t('cancel')}>
                <X size={18} />
              </button>
            </div>
            <ul className="profile-privacy-list">
              <li>{t('profile_privacy_tip1')}</li>
              <li>{t('profile_privacy_tip2')}</li>
              <li>{t('profile_privacy_tip3')}</li>
            </ul>
            <button type="button" className="profile-modal-primary" onClick={() => setShowPrivacyModal(false)}>
              {t('profile_privacy_ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
