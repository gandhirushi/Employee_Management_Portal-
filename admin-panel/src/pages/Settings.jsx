import { useState } from 'react';
import { User, Palette, Bell, ShieldCheck } from 'lucide-react';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useSettings } from '../hooks/useSettings';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'account', label: 'Account', icon: ShieldCheck },
];

function Toggle({ checked, onChange }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="switch-track" />
    </label>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { updateProfile, changePassword, updateProfilePhoto, deleteProfilePhoto } = useProfile();
  const { theme, setTheme } = useTheme();
  const { settings, changeSettings } = useSettings();
  const { notify } = useNotifications();
  const { showToast } = useToast();

  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    const res = await updateProfile({ fullName: profileForm.fullName, email: profileForm.email });
    if (res?.ok) {
      notify('Profile updated', 'Your profile information was saved.', 'system');
      showToast('Profile updated', 'Your changes have been saved.', 'success');
    } else {
      showToast('Update failed', res?.error || 'Failed to update profile.', 'error');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.next.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('Passwords do not match.');
      return;
    }
    const res = await changePassword(passwordForm.next);
    if (res?.ok) {
      notify('Password changed', 'Your account password was updated.', 'system');
      showToast('Password changed', 'Use your new password next time you sign in.', 'success');
      setPasswordForm({ current: '', next: '', confirm: '' });
    } else {
      const errorMsg = res?.error || 'Failed to change password.';
      setPasswordError(errorMsg);
      showToast('Password error', errorMsg, 'error');
    }
  };

  const handleThemePick = (val) => {
    setTheme(val);
    notify('Settings changed', `Appearance set to ${val} mode.`, 'system');
  };

  const toggleNotif = (key) => (e) => {
    changeSettings({ [key]: e.target.checked });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Preferences</span>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="settings-layout">
        <div className="card card-pad settings-tabs">
          {TABS.map(({ key, label, icon: Icon }) => (
            <div key={key} className={`settings-tab ${tab === key ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => setTab(key)}>
              <Icon size={16} /> {label}
            </div>
          ))}
        </div>

        <div className="card card-pad">
          {tab === 'profile' && (
            <div>
              <div className="section-title">Profile settings</div>
              <div className="avatar-picker" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <Avatar name={profileForm.fullName || 'User'} src={user?.profilePhoto} size="lg" />
                <div>
                  <div style={{ fontWeight: 600 }}>{profileForm.fullName}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                      Upload new photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const result = await updateProfilePhoto(file);
                            if (result.ok) {
                              showToast('Photo updated', 'Your profile photo was updated.');
                            } else {
                              showToast('Upload error', result.error);
                            }
                          }
                        }}
                      />
                    </label>
                    {user?.profilePhoto && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={async () => {
                          const result = await deleteProfilePhoto();
                          if (result.ok) {
                            showToast('Photo removed', 'Profile photo removed.');
                          } else {
                            showToast('Error', result.error);
                          }
                        }}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <form onSubmit={saveProfile}>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="fullName">Full name</label>
                    <input id="fullName" value={profileForm.fullName} onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="profileEmail">Email address</label>
                    <input id="profileEmail" type="email" value={profileForm.email} onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Save profile</button>
              </form>
            </div>
          )}

          {tab === 'appearance' && (
            <div>
              <div className="section-title">Appearance</div>
              <div className="theme-options">
                <div className={`theme-opt ${theme === 'light' ? 'active' : ''}`} onClick={() => handleThemePick('light')}>
                  <div className="theme-opt-preview" style={{ background: 'linear-gradient(160deg, #F6F7FB, #E7E8F7)' }} />
                  <span>Light mode</span>
                </div>
                <div className={`theme-opt ${theme === 'dark' ? 'active' : ''}`} onClick={() => handleThemePick('dark')}>
                  <div className="theme-opt-preview" style={{ background: 'linear-gradient(160deg, #171B27, #0F1219)' }} />
                  <span>Dark mode</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              <div className="section-title">Notification settings</div>
              <div className="toggle-row">
                <div className="toggle-row-text">
                  <div className="toggle-title">Employee notifications</div>
                  <div className="toggle-desc">Get notified when employees are added, updated, or removed.</div>
                </div>
                <Toggle checked={settings?.notifyEmployee || false} onChange={toggleNotif('notifyEmployee')} />
              </div>
              <div className="toggle-row">
                <div className="toggle-row-text">
                  <div className="toggle-title">System notifications</div>
                  <div className="toggle-desc">Get notified about profile and settings changes.</div>
                </div>
                <Toggle checked={settings?.notifySystem || false} onChange={toggleNotif('notifySystem')} />
              </div>
              <div className="toggle-row">
                <div className="toggle-row-text">
                  <div className="toggle-title">Login notifications</div>
                  <div className="toggle-desc">Get notified every time you sign in.</div>
                </div>
                <Toggle checked={settings?.notifyLogin || false} onChange={toggleNotif('notifyLogin')} />
              </div>
            </div>
          )}

          {tab === 'account' && (
            <div>
              <div className="section-title">Change password</div>
              {passwordError && <div className="form-banner error">{passwordError}</div>}
              <form onSubmit={savePassword}>
                <div className="field">
                  <label htmlFor="current">Current password</label>
                  <input id="current" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))} />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="next">New password</label>
                    <input id="next" type="password" value={passwordForm.next} onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="confirm">Confirm new password</label>
                    <input id="confirm" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Update password</button>
              </form>
              <hr className="divider" />
              <div className="section-title">Session</div>
              <button className="btn btn-danger" onClick={logout}>Log out of YORK</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
