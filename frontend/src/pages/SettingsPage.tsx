import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Shield, 
  UserCircle, 
  AlertTriangle, 
  Trash2,
  Mail,
  Share2,
  Briefcase,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { settingsApi } from '../api/settings.api';
import type { UserSettings } from '../api/settings.api';
import { authApi } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => {
  return (
    <div 
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${enabled ? 'bg-primary' : 'bg-white/10'}`}
      onClick={() => onChange(!enabled)}
    >
      <motion.div 
        className="w-4 h-4 bg-white rounded-full shadow-md"
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    referral_notifications: true,
    application_status_updates: true,
    mentorship_notifications: true,
    public_profile: true,
    show_email: false
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsApi.getSettings();
        setSettings(response.data.data);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = async (key: keyof UserSettings, value: boolean) => {
    // Optimistic UI update
    setSettings(prev => ({ ...prev, [key]: value }));
    try {
      await settingsApi.updateSettings({ [key]: value });
    } catch (err) {
      // Revert on failure
      setSettings(prev => ({ ...prev, [key]: !value }));
      console.error('Failed to update setting', err);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await settingsApi.deleteAccount();
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to delete account', err);
      setIsDeleting(false);
      setShowDeleteModal(false);
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError('New passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return setPasswordError('New password must be at least 6 characters');
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const userProvider = (user as any)?.provider;
  const isOAuth = userProvider === 'google' || userProvider === 'linkedin';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and configurations.</p>
      </div>

      <div className="grid gap-6">
        
        {/* Notifications Section */}
        <div className="bg-[#1c1f26] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2"><Mail size={16} className="text-muted-foreground"/> Email Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">Receive important updates via email.</p>
              </div>
              <Toggle enabled={settings.email_notifications} onChange={(v) => handleToggle('email_notifications', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2"><Share2 size={16} className="text-muted-foreground"/> Referral Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">Get notified when someone interacts with your referrals.</p>
              </div>
              <Toggle enabled={settings.referral_notifications} onChange={(v) => handleToggle('referral_notifications', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2"><Briefcase size={16} className="text-muted-foreground"/> Application Status Updates</h3>
                <p className="text-sm text-muted-foreground mt-1">Updates when your application status changes.</p>
              </div>
              <Toggle enabled={settings.application_status_updates} onChange={(v) => handleToggle('application_status_updates', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <UserCircle size={16} className="text-muted-foreground"/> Mentorship Notifications
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Get notified about new sessions or mentorship updates.</p>
              </div>
              <Toggle enabled={settings.mentorship_notifications ?? true} onChange={(v) => handleToggle('mentorship_notifications', v)} />
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-[#1c1f26] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Privacy</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Public Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">Make your profile visible to other users.</p>
              </div>
              <Toggle enabled={settings.public_profile} onChange={(v) => handleToggle('public_profile', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Show Email</h3>
                <p className="text-sm text-muted-foreground mt-1">Allow other users to see your email address.</p>
              </div>
              <Toggle enabled={settings.show_email} onChange={(v) => handleToggle('show_email', v)} />
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-[#1c1f26] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <UserCircle size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Account</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-semibold text-white">Login Method</h3>
                <p className="text-sm text-muted-foreground mt-1">How you sign in to Alumni Connect.</p>
              </div>
              
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  {userProvider === 'google' ? (
                    <div className="bg-white p-2 rounded-lg">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    </div>
                  ) : userProvider === 'linkedin' ? (
                    <div className="bg-[#0a66c2] p-2 rounded-lg text-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </div>
                  ) : (
                    <div className="bg-white/10 p-2 rounded-lg text-white">
                      <Mail size={20} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white capitalize">{userProvider || 'Email / Password'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                {isOAuth ? (
                  <span className="text-xs font-semibold px-3 py-1 bg-white/10 text-muted-foreground rounded-full">
                    Managed by {userProvider === 'google' ? 'Google' : 'LinkedIn'}
                  </span>
                ) : (
                  <button 
                    onClick={() => {
                      setPasswordError('');
                      setPasswordSuccess('');
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                      setShowPasswordModal(true);
                    }}
                    className="text-sm font-bold text-primary hover:text-brand-400 transition-colors flex items-center gap-1"
                  >
                    <Key size={14} /> Change Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-red-500/10 flex items-center gap-3">
            <div className="p-2 bg-red-500/20 text-red-500 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-xl font-bold text-red-500">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">Delete Account</h3>
                <p className="text-sm text-red-400/80 mt-1 max-w-lg">
                  Permanently remove your personal account and all of its contents. This action is not reversible.
                </p>
              </div>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="whitespace-nowrap px-6 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-bold border border-red-500/20 rounded-xl transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1c1f26] border border-red-500/20 rounded-2xl p-6 z-50 shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete Account?</h3>
              <p className="text-muted-foreground text-center mb-6">
                Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete your profile, applications, and referrals.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1c1f26] border border-white/10 rounded-3xl p-8 z-50 shadow-2xl"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Key size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-2">Change Password</h3>
              <p className="text-muted-foreground text-center mb-6 text-sm">
                Ensure your account is using a long, random password to stay secure.
              </p>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm text-center">
                    {passwordSuccess}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={isChangingPassword}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-brand-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isChangingPassword ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
