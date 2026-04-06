import AuthPage from './AuthPage';
import ProfileView from './ProfileView';

export default function Profile({
  user,
  onLogin,
  onLogout,
  gyms,
  gymsLoading,
  gymsError,
  onNavigate,
  onUpdateProfile,
}) {
  if (!user) {
    return <AuthPage onLogin={onLogin} />;
  }
  return (
    <ProfileView
      user={user}
      onLogout={onLogout}
      gyms={gyms}
      gymsLoading={gymsLoading}
      gymsError={gymsError}
      onNavigate={onNavigate}
      onUpdateProfile={onUpdateProfile}
    />
  );
}
