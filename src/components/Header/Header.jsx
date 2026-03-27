import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import logoImg from '../../logo-image/logo.png';
import './Header.css';
import NotificationsPopup from '../Notifications/NotificationsPopup';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sporton-api.onrender.com';
const POLL_INTERVAL = 15000; // 15 soniyada bir tekshir

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);

  const prevCountRef = useRef(-1); // -1 means initial load
  const intervalRef = useRef(null);
  const toastTimerRef = useRef(null);

  const fetchUnread = async () => {
    try {
      const token = localStorage.getItem('sporton_access_token');
      if (!token) { setUnreadCount(0); return; }

      const res = await fetch(`${API_BASE_URL}/api/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      const newCount = data?.unreadCount ?? 0;

      // Agar oldingi holatdan ko'paygan bo'lsa (yangi xabar kelgan bo'lsa), toast chiqaramiz.
      // Eslatma: component mount bo'lganda (prevCountRef === -1) toast chiqarmaymiz.
      if (prevCountRef.current !== -1 && newCount > prevCountRef.current) {
        setToastVisible(true);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
          setToastVisible(false);
        }, 5000);
      }

      prevCountRef.current = newCount;
      setUnreadCount(newCount);
    } catch {
      // tarmoq xatosi — indamaymiz
    }
  };

  // Mount bo'lganda va har 15 soniyada polling
  useEffect(() => {
    prevCountRef.current = -1;
    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleClose = () => {
    setShowNotifications(false);
    fetchUnread(); // popup yopilganda badge ni tezda yangilash
  };

  return (
    <>
      {/* Pop-up Toast */}
      {toastVisible && (
        <div
          className="header-toast show"
          onClick={() => {
            setToastVisible(false);
            setShowNotifications(true);
          }}
        >
          <div className="header-toast-icon">
            <Bell size={18} color="#fff" strokeWidth={2.5} />
            <span className="header-toast-ping"></span>
          </div>
          <div className="header-toast-content">
            <strong>Yangi bildirishnoma!</strong>
            <span>O'qish uchun bu yerni bosing</span>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-top">
          <div className="header-brand">
            <div className="brand-logo">
              <img src={logoImg} alt="SportON Logo" width="34" height="34" style={{ objectFit: 'contain' }} />
            </div>
            {/* <span className="brand-name">SportON</span> */}
          </div>

          <div className="header-right">
            <button className="bell-btn" type="button" onClick={() => setShowNotifications(true)}>
              <Bell size={19} strokeWidth={2} />
              {unreadCount > 0 && <span className="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
          </div>
        </div>

        <NotificationsPopup
          open={showNotifications}
          onClose={handleClose}
          onUnreadCountChange={setUnreadCount}
        />
      </header>
    </>
  );
}
