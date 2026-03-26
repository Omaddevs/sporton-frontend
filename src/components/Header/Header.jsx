import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
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
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                <rect width="28" height="28" rx="8" fill="#0078FF"/>
                <rect x="3" y="12" width="4.5" height="4.5" rx="1.5" fill="white" opacity="0.7"/>
                <rect x="20.5" y="12" width="4.5" height="4.5" rx="1.5" fill="white" opacity="0.7"/>
                <rect x="7" y="9.5" width="3.5" height="9" rx="1.75" fill="white" opacity="0.9"/>
                <rect x="17.5" y="9.5" width="3.5" height="9" rx="1.75" fill="white" opacity="0.9"/>
                <rect x="10.5" y="12.75" width="7" height="2.5" rx="1.25" fill="white"/>
              </svg>
            </div>
            <span className="brand-name">SportON</span>
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
