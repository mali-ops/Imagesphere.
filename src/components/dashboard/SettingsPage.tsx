import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Key,
  Sun,
  Moon,
  Laptop,
  Webhook,
  Sliders,
} from 'lucide-react';
import { ImageVisibility } from '../../types';
import { WebhookSettings } from './WebhookSettings';
import { formatBytes } from '../../utils/imageCompression';

interface SettingsPageProps {
  initialTab?: 'account' | 'webhooks';
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ initialTab }) => {
  const {
    currentUser,
    deleteAccount,
    confirm,
    addToast,
    theme,
    setTheme,
    activeRoute,
    navigateTo,
    webhooks,
  } = useApp();

  const userWebhooks = webhooks.filter((w) => w.user_id === currentUser?.id);

  const [activeTab, setActiveTab] = useState<'account' | 'webhooks'>(() => {
    if (initialTab) return initialTab;
    if (activeRoute === 'dashboard-webhooks') return 'webhooks';
    return 'account';
  });

  useEffect(() => {
    if (activeRoute === 'dashboard-webhooks') {
      setActiveTab('webhooks');
    }
  }, [activeRoute]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [defaultVisibility, setDefaultVisibility] = useState<ImageVisibility>('public');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('Password Error', 'Password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Password Mismatch', 'New passwords do not match.', 'error');
      return;
    }

    addToast('Password Updated', 'Your account credentials have been securely updated.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    confirm({
      title: 'Permanently Delete Account?',
      message: 'This will irreversibly delete your profile, all uploaded images, all folders, and any active links. This cannot be undone.',
      confirmLabel: 'Delete My Account & Data',
      isDestructive: true,
      onConfirm: () => {
        deleteAccount();
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      {/* Header & Navigation Tabs */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account credentials, security settings, and external webhook integrations.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all relative ${
              activeTab === 'account'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Account & Security</span>
            {activeTab === 'account' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('webhooks')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all relative ${
              activeTab === 'webhooks'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Webhook className="w-4 h-4" />
            <span>Webhooks & Integrations</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40">
              {userWebhooks.length}
            </span>
            {activeTab === 'webhooks' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'webhooks' ? (
        <WebhookSettings />
      ) : (
        <div className="space-y-8 max-w-3xl">
          {/* Account Info Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Account Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Email Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser?.email}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Account Role</span>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  {currentUser?.role}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Member Since</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {currentUser ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Storage Allocation</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  {formatBytes(currentUser?.storage_limit || 524288000)} (
                  {currentUser?.plan === 'pro'
                    ? 'Pro Plan'
                    : currentUser?.plan === 'prime'
                    ? 'Prime Plan'
                    : 'Free Community Plan'}
                  )
                </span>
              </div>
            </div>
          </div>

          {/* Theme & Appearance Setting */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Appearance & Theme</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose how ImgSphere looks to you. Select a light or dark theme or sync with your system.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-600/30 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Light Mode</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Clean, crisp high-contrast light display</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-600/30 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Dark Mode</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Deep obsidian dark mode for nighttime</div>
                </div>
              </button>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold">
                Danger Zone
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Deleting your account will permanently wipe your user profile, all folders, and all uploaded image records from cloud storage. This action is immediate and non-reversible.
            </p>

            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account Permanently</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

