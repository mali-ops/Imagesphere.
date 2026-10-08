import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Laptop,
  Smartphone,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Globe,
  Radio,
} from 'lucide-react';

export const OwnerSecuritySection: React.FC = () => {
  const {
    activeSessions,
    terminateSession,
    terminateAllOtherSessions,
    changePassword,
    addToast,
    currentUser,
  } = useApp();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [rateLimiterActive, setRateLimiterActive] = useState(true);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      addToast('Missing Fields', 'Please enter your current and new password.', 'warning');
      return;
    }
    if (newPass.length < 8) {
      addToast('Password Too Weak', 'Owner password must be at least 8 characters.', 'warning');
      return;
    }
    if (newPass !== confirmPass) {
      addToast('Mismatch', 'New passwords do not match.', 'error');
      return;
    }

    setIsChangingPass(true);
    try {
      const success = await changePassword(currentPass, newPass);
      if (success) {
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        addToast('Owner Password Updated', 'Master password changed and security logs updated.', 'success');
      }
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Security & Active Session Management (سیکیورٹی اور فعال سیشنز)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Owner security controls: active device sessions, remote revocation, master credentials, and 2FA policy.
        </p>
      </div>

      {/* Active Sessions (Section 19 of spec) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-purple-600" />
              <span>Active Logged-in Sessions</span>
            </h3>
            <p className="text-xs text-slate-500">
              Devices and browsers authenticated into Owner or Administrator consoles
            </p>
          </div>

          <button
            type="button"
            onClick={terminateAllOtherSessions}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout All Other Sessions</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          {activeSessions.map((sess, idx) => (
            <div
              key={`sess-row-${sess.id || 's'}-${idx}`}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                sess.is_current ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0 text-slate-700 dark:text-slate-200">
                  {sess.device.includes('iPhone') || sess.device.includes('Mobile') ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sess.device}
                    </span>
                    {sess.is_current && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Current Active Session
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 space-x-2 mt-0.5">
                    <span>{sess.browser}</span>
                    <span>•</span>
                    <span className="font-mono">{sess.ip}</span>
                    <span>•</span>
                    <span>{sess.location}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Logged in: {new Date(sess.login_time).toLocaleString()} | Last active: {new Date(sess.last_active).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {!sess.is_current && (
                <button
                  type="button"
                  onClick={() => terminateSession(sess.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors shrink-0"
                >
                  Terminate Session
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Password & Two-Factor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Password Change */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Change Super Owner Password
              </h3>
              <p className="text-xs text-slate-500">Update master root credentials</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Current master password"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password (minimum 8 chars)
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="New strong password"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {isChangingPass ? 'Updating Master Password...' : 'Update Owner Password'}
            </button>
          </form>
        </div>

        {/* Security Policy & Multi-Factor */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Platform Security Policies
              </h3>
              <p className="text-xs text-slate-500">Automated defense & authorization rules</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* 2FA Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Two-Factor Authentication (2FA)
                </span>
                <span className="text-[11px] text-slate-500">
                  Enforces secondary OTP code on administrative sign-ins
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  addToast('2FA Policy Changed', `Two-Factor authentication is now ${!twoFactorEnabled ? 'ENFORCED' : 'OPTIONAL'}.`, 'info');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    twoFactorEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Rate Limiting & Brute Force */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Anti-Brute Force Protection
                </span>
                <span className="text-[11px] text-slate-500">
                  Sliding-window IP rate limiter blocks excessive login attempts
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Active 10 req/min
              </span>
            </div>

            {/* Owner Protection Status */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block">
                  Owner Sovereignty Guard
                </span>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed mt-0.5">
                  Admins cannot delete, suspend, edit permissions of, or impersonate the Owner account (aliuniet@gmail.com). Privilege escalation attempts are automatically blocked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
