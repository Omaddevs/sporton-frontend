import { useEffect, useState, useCallback } from 'react';
import './i18n';
import Home from './pages/Home';
import Explore from './pages/Explore/Explore';
import Favorites from './pages/Favorites/Favorites';
import Profile from './pages/Profile/Profile';
import BottomNav from './components/BottomNav/BottomNav';
import Header from './components/Header/Header';
import { apiFetch } from './utils/api';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sporton-api.onrender.com';

function loadUser() {
  try {
    const token = localStorage.getItem('sporton_access_token');
    if (!token) return null;
    return JSON.parse(localStorage.getItem('sporton_user')) || null;
  }
  catch { return null; }
}

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [gyms, setGyms] = useState([]);
  const [gymsLoading, setGymsLoading] = useState(true);
  const [gymsError, setGymsError] = useState(null);
  const [user, setUser] = useState(loadUser);

  const loadGyms = useCallback(async (signal) => {
    setGymsLoading(true);
    setGymsError(null);
    try {
      const data = await apiFetch('/api/gyms/', signal ? { signal } : {});
      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      setGyms((prev) => {
        const likedById = new Map((prev || []).map((g) => [g.id, g.liked]));
        return items.map((g) => ({
          ...g,
          liked: g.liked ?? (likedById.get(g.id) ?? false),
        }));
      });
    } catch (e) {
      if (e?.name === 'AbortError') return;
      setGymsError(e?.message || "Ma'lumotlarni yuklashda xato");
      setGyms([]);
    } finally {
      if (!signal || !signal.aborted) {
        setGymsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadGyms(controller.signal);
    return () => controller.abort();
  }, [loadGyms]);

  const toggleLike = async (id) => {
    if (!user) {
      setActivePage('profile');
      return;
    }

    setGyms((prev) =>
      prev.map((g) => (g.id === id ? { ...g, liked: !g.liked } : g))
    );

    try {
      const data = await apiFetch(`/api/gyms/${id}/like/`, {
        method: 'POST',
      });
      setGyms((prev) =>
        prev.map((g) => (g.id === id ? { ...g, liked: data.liked } : g))
      );
    } catch (e) {
      console.error('Like toggle failed:', e);
      setGyms((prev) =>
        prev.map((g) => (g.id === id ? { ...g, liked: !g.liked } : g))
      );
    }
  };

  const handleLogin = (userData, token, refreshToken) => {
    setUser(userData);
    localStorage.setItem('sporton_user', JSON.stringify(userData));
    if (token) localStorage.setItem('sporton_access_token', token);
    if (refreshToken) localStorage.setItem('sporton_refresh_token', refreshToken);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sporton_user');
    localStorage.removeItem('sporton_access_token');
    localStorage.removeItem('sporton_refresh_token');
  };

  const handleUpdateProfile = async (patch) => {
    const token = localStorage.getItem('sporton_access_token');
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch || {}),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;

    setUser((prev) => ({
      ...(prev || {}),
      ...(data?.user || {}),
    }));

    const nextUser = data?.user;
    if (nextUser) localStorage.setItem('sporton_user', JSON.stringify(nextUser));
  };

  const gymsProps = {
    gyms,
    gymsLoading,
    gymsError,
    onRetryGyms: () => loadGyms(),
    toggleLike,
    onNavigate: setActivePage,
  };

  return (
    <div className="app-shell">
      {activePage === 'explore' ? (
        <>
          <Header />
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Explore {...gymsProps} />
          </div>
        </>
      ) : activePage === 'home' ? (
        <Home {...gymsProps} />
      ) : activePage === 'favorite' ? (
        <Favorites {...gymsProps} />
      ) : activePage === 'profile' ? (
        <Profile
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          gyms={gyms}
          gymsLoading={gymsLoading}
          gymsError={gymsError}
          onNavigate={setActivePage}
          onUpdateProfile={handleUpdateProfile}
        />
      ) : null}

      <BottomNav activePage={activePage} onNavigate={setActivePage} />
    </div>
  );
}
