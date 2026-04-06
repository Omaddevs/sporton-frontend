import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, X, Send, Check, Mail, MailOpen, Search, Users, Globe, Megaphone, ArrowLeft, Trash2 } from 'lucide-react';
import { apiFetch, getToken, getUser } from '../../utils/api';
import './NotificationsPopup.css';

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString('uz-UZ', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

export default function NotificationsPopup({ open, onClose, onUnreadCountChange }) {
  const [notifs, setNotifs]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [tab, setTab]                 = useState('new');
  const [adminMsg, setAdminMsg]       = useState('');
  const [adminTitle, setAdminTitle]   = useState('');
  const [sendMode, setSendMode]       = useState('all');
  const [sending, setSending]         = useState(false);
  const [viewingNotif, setViewingNotif] = useState(null);

  // Admin: users list
  const [allUsers, setAllUsers]       = useState([]);  // [{id, username, full_name}]
  const [selectedIds, setSelectedIds] = useState([]);
  const [userSearch, setUserSearch]   = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  const markTimerRef = useRef(null);
  const [user, setUser] = useState(() => getUser());

  const isAdmin = useMemo(() =>
    !!(user?.username?.toLowerCase() === 'admin' || user?.is_staff || user?.is_superuser)
  , [user]);

  // ── Notifications fetch ─────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true);
    try {
      const data = await apiFetch('/api/notifications/');
      const items = Array.isArray(data?.items) ? data.items : [];
      setNotifs(items);
      const count = data?.unreadCount ?? items.filter(n => !n.isRead).length;
      onUnreadCountChange?.(count);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  // ── Users list for admin ────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    if (!isAdmin || allUsers.length > 0) return;
    setUsersLoading(true);
    try {
      const data = await apiFetch('/api/auth/users/');
      setAllUsers(Array.isArray(data?.users) ? data.users : []);
    } catch {
      // silent
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin, allUsers.length]);

  // Popup ochilganda yuklash
  useEffect(() => {
    if (!open) return;
    setUser(getUser());
    setTab('new');
    setViewingNotif(null);
    refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (open && isAdmin && sendMode === 'selected') {
      loadUsers();
    }
  }, [open, isAdmin, sendMode, loadUsers]);

  // ── Mark read ───────────────────────────────────────────────────────────
  const handleMarkOne = async (id) => {
    try {
      await apiFetch('/api/notifications/mark-read/', {
        method: 'POST',
        body: JSON.stringify({ ids: [id] }),
      });
      await refresh();
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu bildirishnomani rostdan ham o'chirmoqchimisiz?")) return;
    try {
      await apiFetch('/api/notifications/delete/', {
        method: 'POST',
        body: JSON.stringify({ ids: [id] }),
      });
      setViewingNotif(null);
      await refresh();
    } catch (e) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  const handleMarkAll = async () => {
    const unreadIds = notifs.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;
    clearTimeout(markTimerRef.current);
    try {
      await apiFetch('/api/notifications/mark-read/', {
        method: 'POST',
        body: JSON.stringify({ ids: unreadIds }),
      });
      await refresh();
    } catch { /* silent */ }
  };

  // ── Admin send ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const msg = adminMsg.trim();
    if (!msg) return;
    if (sendMode === 'selected' && selectedIds.length === 0) {
      alert("Kamida bir foydalanuvchi tanlang!");
      return;
    }
    setSending(true);
    try {
      const payload = {
        title: adminTitle.trim() || 'Bildirishnoma',
        message: msg,
      };
      if (sendMode === 'selected') {
        payload.send_to = 'selected';
        payload.selected_user_ids = selectedIds;
      } else {
        payload.send_to = 'all';
      }

      const res = await apiFetch('/api/notifications/admin/send/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAdminMsg('');
      setAdminTitle('');
      setSelectedIds([]);
      await refresh();
      alert(`✅ Yuborildi! ${res.sentTo ?? ''} ta foydalanuvchiga.`);
    } catch (e) {
      alert(e?.message || 'Xato yuz berdi');
    } finally {
      setSending(false);
    }
  };

  const toggleUser = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredUsers = allUsers.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      !q ||
      u.username?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  if (!open) return null;

  const newNotifs     = notifs.filter(n => !n.isRead);
  const readNotifs    = notifs.filter(n => n.isRead);
  const visibleNotifs = tab === 'new' ? newNotifs : readNotifs;

  return (
    <div className="np-overlay" onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="np-pop" role="dialog" aria-modal="true" aria-label="Bildirishnomalar">

        {/* Header */}
        <div className="np-header">
          {viewingNotif ? (
            <button className="np-back-btn" onClick={() => setViewingNotif(null)} type="button">
              <ArrowLeft size={18} strokeWidth={2.5} />
              <span>Ortga</span>
            </button>
          ) : (
            <div className="np-title">
              <Bell size={18} />
              <span>Bildirishnomalar</span>
            </div>
          )}
          <button className="np-close" type="button" onClick={onClose} aria-label="Yopish">
            <X size={16} />
          </button>
        </div>

        {viewingNotif ? (
          <div className="np-detail-view">
            <div className="np-detail-top">
              <h3 className="np-detail-title">{viewingNotif.title}</h3>
              <button
                className="np-detail-delete"
                onClick={() => handleDelete(viewingNotif.id)}
                title="Bildirishnomani o'chirish"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="np-detail-time">{formatTime(viewingNotif.createdAt)}</div>
            <div className="np-detail-body">
              {viewingNotif.message.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            <div className="np-bottom-spacer" />
          </div>
        ) : (
          <>
            {/* Tabs */}
        <div className="np-tabs">
          <button className={`np-tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>
            <Mail size={14} />
            Yangi
            {newNotifs.length > 0 && <span className="np-tab-badge">{newNotifs.length}</span>}
          </button>
          <button className={`np-tab ${tab === 'read' ? 'active' : ''}`} onClick={() => setTab('read')}>
            <MailOpen size={14} />
            O'qilgan
            {readNotifs.length > 0 && <span className="np-tab-badge read">{readNotifs.length}</span>}
          </button>
        </div>

        {/* Mark all */}
        {tab === 'new' && newNotifs.length > 0 && (
          <div className="np-actions">
            <button className="np-mark" type="button" onClick={handleMarkAll} disabled={loading}>
              <Check size={15} />
              Hammasini ko'rildi
            </button>
          </div>
        )}

        {/* ── Admin panel ── */}
        {isAdmin && (
          <div className="np-admin">
            <div className="np-admin-title">
              <Megaphone size={14} strokeWidth={2} />
              Admin: xabar yuborish
            </div>

            {/* Title input */}
            <input
              className="np-admin-title-input"
              placeholder="Sarlavha (ixtiyoriy)..."
              value={adminTitle}
              onChange={e => setAdminTitle(e.target.value)}
              maxLength={80}
            />

            {/* Recipients: checkboxes */}
            <div className="np-send-mode-row">
              <label
                className={`np-send-mode-option ${sendMode === 'all' ? 'active' : ''}`}
                title="Barcha ro'yxatdan o'tgan userlarga yuboriladi"
              >
                <input
                  type="checkbox"
                  checked={sendMode === 'all'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSendMode('all');
                      setSelectedIds([]);
                    }
                  }}
                />
                <span className="np-send-mode-text">
                  <Globe size={13} /> Barchaga
                </span>
              </label>

              <label
                className={`np-send-mode-option ${sendMode === 'selected' ? 'active' : ''}`}
                title="Foydalanuvchilarni checkbox bilan tanlaysiz"
              >
                <input
                  type="checkbox"
                  checked={sendMode === 'selected'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSendMode('selected');
                      loadUsers();
                    } else {
                      setSendMode('all');
                      setSelectedIds([]);
                    }
                  }}
                />
                <span className="np-send-mode-text">
                  <Users size={13} /> Tanlangan ({selectedIds.length})
                </span>
              </label>
            </div>

            {/* Users checklist */}
            {sendMode === 'selected' && (
              <div className="np-users-panel">
                <div className="np-users-selectall">
                  <label className="np-selectall-label">
                    <input
                      type="checkbox"
                      checked={allUsers.length > 0 && selectedIds.length === allUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(allUsers.map(u => u.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      disabled={usersLoading}
                      className="np-user-check"
                    />
                    Barchasini tanlash
                  </label>
                </div>
                <div className="np-users-search-wrap">
                  <Search size={13} className="np-users-search-icon" />
                  <input
                    className="np-users-search"
                    placeholder="Foydalanuvchi qidirish..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>
                <div className="np-users-list">
                  {usersLoading ? (
                    <div className="np-users-loading">Yuklanmoqda…</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="np-users-loading">Foydalanuvchi topilmadi</div>
                  ) : filteredUsers.map(u => (
                    <label key={u.id} className={`np-user-row ${selectedIds.includes(u.id) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u.id)}
                        onChange={() => toggleUser(u.id)}
                        className="np-user-check"
                      />
                      <div className="np-user-avatar">{(u.username || '?')[0].toUpperCase()}</div>
                      <div className="np-user-info">
                        <span className="np-user-name">{u.full_name || u.username}</span>
                        <span className="np-user-username">@{u.username}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedIds.length > 0 && (
                  <div className="np-selected-summary">
                    {selectedIds.length} ta tanlandi
                    <button className="np-clear-sel" onClick={() => setSelectedIds([])}>Bekor</button>
                  </div>
                )}
              </div>
            )}

            {/* Message textarea */}
            <textarea
              className="np-admin-text"
              placeholder={
                sendMode === 'selected'
                  ? `${selectedIds.length} ta tanlangan userlarga yuboriladi...`
                  : 'Barcha foydalanuvchilarga yuboriladi...'
              }
              value={adminMsg}
              onChange={e => setAdminMsg(e.target.value)}
              rows={3}
            />
            <button
              type="button"
              className="np-admin-send"
              onClick={handleSend}
              disabled={
                !adminMsg.trim() ||
                sending ||
                (sendMode === 'selected' && selectedIds.length === 0)
              }
            >
              <Send size={16} />
              {sending ? 'Yuborilmoqda...' : 'Yuborish'}
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="np-list">
          {loading ? (
            <div className="np-loading"><span className="np-spinner" /></div>
          ) : visibleNotifs.length === 0 ? (
            <div className="np-empty">
              {tab === 'new' ? "Yangi bildirishnoma yo'q." : "O'qilgan bildirishnoma yo'q."}
            </div>
          ) : (
            visibleNotifs.map(n => (
              <div
                key={n.id}
                className={`np-item ${n.isRead ? 'seen' : 'unseen'} clickable`}
                onClick={() => {
                  setViewingNotif(n);
                  if (!n.isRead) handleMarkOne(n.id);
                }}
              >
                <div className="np-item-top">
                  <div className="np-item-title">
                    {!n.isRead && <span className="np-dot" />}
                    {n.title}
                  </div>
                  <div className="np-item-time">{formatTime(n.createdAt)}</div>
                </div>
                <div className="np-item-msg">{n.message}</div>
                <div className="np-item-click-hint">O'qish uchun ustiga bosing</div>
              </div>
            ))
          )}
        </div>

        <div className="np-bottom-spacer" />
          </>
        )}
      </div>
    </div>
  );
}
