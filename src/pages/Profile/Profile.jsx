import AuthPage from './AuthPage';
import ProfileView from './ProfileView';

export default function Profile({ user, onLogin, onLogout, gyms, onNavigate, onUpdateProfile }) {
  if (!user) {
    return <AuthPage onLogin={onLogin} />;
  }
  return (
    <ProfileView
      user={user}
      onLogout={onLogout}
      gyms={gyms}
      onNavigate={onNavigate}
      onUpdateProfile={onUpdateProfile}
    />
  );
}
