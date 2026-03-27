import { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import logoImg from '../../logo-image/logo.png';
import './Auth.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sporton-api.onrender.com';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.username.trim()) return "Username ni kiriting";
    if (form.password.length < 6) return "Parol kamida 6 ta belgi bo'lishi kerak";
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login/' : '/api/auth/register/';
      const payload =
        mode === 'login'
          ? { username: form.username, password: form.password }
          : { username: form.username, full_name: form.username, password: form.password };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.message ||
          Object.values(data || {}).flat?.()[0] ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }

      onLogin(data.user, data.access);
    } catch (e) {
      setError(e?.message || 'Tarmoq xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-icon">
          <img src={logoImg} alt="SportON" style={{ height: '42px', width: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        <h1 className="auth-hero-title">SportON</h1>
        <p className="auth-hero-sub">O'zbekistondagi sport zallari</p>
      </div>

      <div className="auth-card">
        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Kirish
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Username</label>
            <div className="auth-input-wrap">
              <User size={16} className="auth-field-icon" />
              <input
                type="text"
                placeholder="username"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Parol</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-field-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>Akkauntingiz yo'qmi? <button onClick={() => { setMode('register'); setError(''); }}>Ro'yxatdan o'ting</button></>
          ) : (
            <>Allaqachon ro'yxatdanmisiz? <button onClick={() => { setMode('login'); setError(''); }}>Kiring</button></>
          )}
        </p>
      </div>
    </div>
  );
}
