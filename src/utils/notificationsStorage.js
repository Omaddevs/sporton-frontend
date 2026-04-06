const STORAGE_KEY = 'sporton_notifications';

function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch {
    return fallback;
  }
}

export function getAllNotifications() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const arr = safeParse(raw, []);
  return Array.isArray(arr) ? arr : [];
}

export function setAllNotifications(notifs) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(notifs) ? notifs : []));
}

export function createNotification({ message, title = 'Bildirishnoma', from = 'admin' }) {
  const now = Date.now();
  return {
    id: `${now}_${Math.random().toString(16).slice(2)}`,
    title,
    message: String(message ?? ''),
    from,
    createdAt: now,
  };
}

export function pushNotification(notification) {
  const all = getAllNotifications();
  const next = [notification, ...all];
  setAllNotifications(next);
  return notification.id;
}

export function getUserKey(user) {
  if (!user) return 'guest';
  return user.username || user.email || user.fullName || 'guest';
}

function seenStorageKey(userKey) {
  return `sporton_notifications_seen_${userKey}`;
}

export function getSeenMap(user) {
  const userKey = getUserKey(user);
  const raw = window.localStorage.getItem(seenStorageKey(userKey));
  const map = safeParse(raw, {});
  return map && typeof map === 'object' ? map : {};
}

export function setSeenMap(user, map) {
  const userKey = getUserKey(user);
  window.localStorage.setItem(seenStorageKey(userKey), JSON.stringify(map || {}));
}

export function markNotificationsSeen(user, notificationIds = []) {
  const current = getSeenMap(user);
  const next = { ...current };
  notificationIds.forEach((id) => {
    next[id] = true;
  });
  setSeenMap(user, next);
  return next;
}

