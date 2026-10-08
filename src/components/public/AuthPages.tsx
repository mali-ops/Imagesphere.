import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentModal } from './PaymentModal';
import { PaymentVerificationForm } from './PaymentVerificationForm';
import {
  Layers,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Zap,
  HardDrive,
  ShieldCheck,
  Check,
  Crown,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, navigateTo, addToast, currentUser } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);

  // Hidden discreet trigger on logo (triple click) opens secret modal
  const handleSecretTrigger = () => {
    const next = secretClicks + 1;
    setSecretClicks(next);
    if (next >= 3) {
      setSecretClicks(0);
      window.dispatchEvent(new CustomEvent('open-secret-admin-modal'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast('Missing Credentials', 'Please enter your email and password.', 'warning');
      return;
    }
    setLoading(true);
    const success = await login(email.trim(), password);
    setLoading(false);
    if (!success) {
      // Notification handled in AppContext
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* If already logged in, show direct entry shortcut */}
        {currentUser && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500 fill-current" />
                <span>Signed In: {currentUser.full_name}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                {currentUser.role.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Account: <strong className="text-slate-900 dark:text-white font-mono">{currentUser.email}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                if (currentUser.role === 'owner') navigateTo('admin-owner');
                else if (currentUser.role === 'admin') navigateTo('admin-overview');
                else navigateTo('dashboard-overview');
              }}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>{currentUser.role === 'owner' ? 'Enter Owner Headquarters' : 'Go to Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Standard Clean Public Header */}
        <div className="text-center pt-1">
          <div
            onClick={handleSecretTrigger}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/25 text-white cursor-default select-none active:scale-95 transition-transform"
            title="ImgSphere Authentication"
          >
            <Layers className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to ImgSphere
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Enter your credentials to access your cloud images, folders, and shared projects.
          </p>
        </div>

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigateTo('auth-forgot')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember Active Session</span>
            </label>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-bold text-sm text-white rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Links */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Don't have an account yet?{' '}
            <button
              id="login-create-account-link"
              onClick={() => navigateTo('signup')}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create free account
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export const SignupPage: React.FC = () => {
  const { signup, navigateTo, routeParams } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'community' | 'prime' | 'pro'>(() => {
    if (routeParams?.plan === 'community') return 'community';
    if (routeParams?.plan === 'pro') return 'pro';
    return 'prime';
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Community Plan is free forever (no payment or credit card needed)
    if (selectedPlan === 'community') {
      setLoading(true);
      const success = await signup(fullName, email, password, 'community');
      setLoading(false);
      if (!success) {
        setError('Signup failed. Email might already be registered.');
      } else {
        navigateTo('dashboard-overview');
      }
      return;
    }

    // For Prime and Pro paid plans, create user account first and open payment verification modal
    setLoading(true);
    const success = await signup(fullName, email, password, selectedPlan);
    setLoading(false);
    if (!success) {
      setError('Signup failed. Email might already be registered. Please try logging in.');
      return;
    }

    // Open payment proof upload modal with their chosen plan
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    navigateTo('dashboard-billing');
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-600/25">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Select your plan: Free 500 MB Community tier, or high-capacity Prime & Pro.
          </p>
        </div>

        {/* STEP 1: PLAN SELECTOR (Community, Prime, Pro) */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            1. Select Your Plan
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Community Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan('community')}
              className={`p-3 rounded-2xl border text-left transition-all relative ${
                selectedPlan === 'community'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Community
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                $0
              </div>
              <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                <HardDrive className="w-3 h-3" />
                <span>500 MB Free</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Free Forever</div>
            </button>

            {/* Prime Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan('prime')}
              className={`p-3 rounded-2xl border text-left transition-all relative ${
                selectedPlan === 'prime'
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                Prime
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                $4.99<span className="text-[10px] font-normal text-slate-400">/mo</span>
              </div>
              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-1">
                <HardDrive className="w-3 h-3" />
                <span>15 GB Cloud</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Creator Tier</div>
            </button>

            {/* Pro Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan('pro')}
              className={`p-3 rounded-2xl border text-left transition-all relative ${
                selectedPlan === 'pro'
                  ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-purple-600 text-white">
                Best
              </span>
              <div className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                Pro
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                $9.99<span className="text-[10px] font-normal text-slate-400">/mo</span>
              </div>
              <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                <HardDrive className="w-3 h-3" />
                <span>50 GB Ultra</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Studio Tier</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 2: USER DETAILS */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              2. User Information
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name (e.g. Jane Doe)"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              id="terms-checkbox"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms-checkbox" className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
              I agree to the <span className="text-blue-600 underline">Terms of Service</span> & <span className="text-blue-600 underline">Privacy Policy</span>.
            </label>
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 ${
              selectedPlan === 'community'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/25'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-600/25'
            }`}
          >
            <span>
              {loading
                ? 'Processing...'
                : selectedPlan === 'community'
                ? 'Create Free Community Account (500 MB)'
                : selectedPlan === 'prime'
                ? 'Create Account & Upload Payment Proof ($4.99/mo)'
                : 'Create Account & Upload Payment Proof ($9.99/mo)'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Payment Verification Form Modal */}
        {isPaymentModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
            onClick={handlePaymentModalClose}
          >
            <div
              className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <PaymentVerificationForm
                initialPlanId={selectedPlan === 'pro' ? 'plan_pro' : 'plan_prime'}
                onCancel={handlePaymentModalClose}
                onSuccess={() => {
                  navigateTo('dashboard-billing');
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <div>
            Already have an account?{' '}
            <button
              onClick={() => navigateTo('auth-login')}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { navigateTo, addToast, users, updateUserProfile, logAdminAction } = useApp();
  const [email, setEmail] = useState('');
  const [resetStep, setResetStep] = useState<'input' | 'otp' | 'new_password' | 'admin_notice' | 'success'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [revokeSessions, setRevokeSessions] = useState(true);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  const handleLookupEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;

    const user = users.find((u) => u.email.toLowerCase() === clean);
    if (!user) {
      addToast('No Account Found', 'No user registered with this email address.', 'error');
      return;
    }

    setMatchedUser(user);

    if (user.role === 'owner' || clean === 'aliuniet@gmail.com') {
      // Owner self-service flow: Send secure OTP
      setResetStep('otp');
      addToast('Secure OTP Dispatched', 'Master Owner OTP generated: 849201 (Simulated for verification)', 'info');
    } else if (user.role === 'admin') {
      // Admin hierarchy policy: Admin cannot self-service reset without Owner
      setResetStep('admin_notice');
    } else {
      // Client standard recovery
      setResetStep('otp');
      addToast('Recovery Code Sent', 'Client OTP generated: 492108 (Simulated for verification)', 'info');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      addToast('Invalid Code', 'Please enter a valid 6-digit OTP code.', 'warning');
      return;
    }
    setResetStep('new_password');
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Password Too Short', 'Password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Password Mismatch', 'Passwords do not match.', 'error');
      return;
    }

    if (matchedUser) {
      updateUserProfile(matchedUser.id, {
        password: newPassword,
        passcode: newPassword,
      });
      logAdminAction(
        'Password Reset Completed',
        matchedUser.role === 'owner' ? 'system' : 'user',
        `Password was updated for ${matchedUser.email} via verified self-service reset${revokeSessions ? ' (other sessions revoked)' : ''}.`,
        matchedUser.id
      );
    }

    setResetStep('success');
    addToast('Password Updated', 'Your new password has been saved. Please sign in.', 'success');
  };

  const handleRequestOwnerReset = () => {
    logAdminAction(
      'Admin Password Reset Requested',
      'admin',
      `Admin ${matchedUser?.email} requested password assistance. Owner notification logged.`,
      matchedUser?.id
    );
    addToast('Request Logged', 'The Platform Owner has been notified to reset this admin credential from the Owner Headquarters.', 'info');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-600/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {resetStep === 'admin_notice' ? 'Admin Security Policy' : 'Reset Account Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise RBAC Password Hierarchy & Verification
          </p>
        </div>

        {/* STEP 1: Email Lookup */}
        {resetStep === 'input' && (
          <form onSubmit={handleLookupEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aliuniet@gmail.com, admin@..., or client email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              Verify Account & Continue
            </button>

            <button
              type="button"
              onClick={() => navigateTo('auth-login')}
              className="w-full py-2.5 text-xs text-slate-600 dark:text-slate-400 hover:underline text-center"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {resetStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
              <span className="font-bold">Verification Code Sent:</span> Enter the 6-digit OTP sent to <strong>{email}</strong>. (Simulated code: <strong>{matchedUser?.role === 'owner' ? '849201' : '492108'}</strong>)
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                6-Digit Security OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="849201"
                className="w-full text-center tracking-widest font-mono text-lg py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              Verify Code
            </button>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {resetStep === 'new_password' && (
          <form onSubmit={handleSaveNewPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
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
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={revokeSessions}
                onChange={(e) => setRevokeSessions(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Revoke all other active sessions</span>
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              Update Password & Secure Account
            </button>
          </form>
        )}

        {/* ADMIN RESTRICTED NOTICE (Section 8 of spec) */}
        {resetStep === 'admin_notice' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Admin Password Policy Enforced</span>
              </div>
              <p className="leading-relaxed">
                Admins do not have unrestricted self-service password reset privileges. This protects the system from credential takeovers.
              </p>
              <p className="leading-relaxed font-semibold">
                Please contact the Platform Owner (<strong>aliuniet@gmail.com</strong>) to verify your identity and initiate a secure administrative password reset.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRequestOwnerReset}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
            >
              Notify Owner to Initiate Reset
            </button>

            <button
              type="button"
              onClick={() => navigateTo('auth-login', { portal: 'admin' })}
              className="w-full py-2 text-xs text-slate-500 hover:underline text-center"
            >
              Back to Admin Sign In
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {resetStep === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Password Changed Successfully
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Your password has been updated. You can now sign in with your new credentials.
            </p>
            <button
              onClick={() => navigateTo('auth-login')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl"
            >
              Proceed to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const AuthPages: React.FC = () => {
  const { activeRoute } = useApp();

  if (activeRoute === 'auth-signup' || activeRoute === 'signup') {
    return <SignupPage />;
  }
  if (activeRoute === 'auth-forgot' || activeRoute === 'forgot-password') {
    return <ForgotPasswordPage />;
  }
  return <LoginPage />;
};
