import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/auth/me', profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-lg space-y-10">
      <div>
        <p className="eyebrow mb-2">Console</p>
        <h1 className="heading-display text-3xl">Settings</h1>
      </div>

      <form onSubmit={saveProfile} className="glass p-6 space-y-4">
        <p className="text-sm text-gold">Profile</p>
        <div>
          <label className="block text-[11px] tracking-widest2 uppercase text-ivory/50 mb-2">Name</label>
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-widest2 uppercase text-ivory/50 mb-2">Phone</label>
          <input
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>
        <button disabled={savingProfile} className="px-6 py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50">
          {savingProfile ? 'Saving…' : 'Save Profile'}
        </button>
      </form>

      <form onSubmit={savePassword} className="glass p-6 space-y-4">
        <p className="text-sm text-gold">Change Password</p>
        <input
          type="password"
          required
          placeholder="Current password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
          className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="New password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
          className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
        />
        <input
          type="password"
          required
          placeholder="Confirm new password"
          value={passwords.confirm}
          onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
          className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
        />
        <button disabled={savingPassword} className="px-6 py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50">
          {savingPassword ? 'Saving…' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
