import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  CreditCard,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  Receipt,
  Plus,
  Edit2,
  Check,
  Lock,
  HardDrive,
  FileText,
  DollarSign,
  HelpCircle,
  UploadCloud,
  Eye,
  X,
} from 'lucide-react';
import { formatBytes } from '../../utils/imageCompression';
import { DirectCardPaymentModal } from '../public/DirectCardPaymentModal';
import { PaymentModal } from '../public/PaymentModal';
import { PaymentVerificationForm } from '../public/PaymentVerificationForm';

export const BillingSubscriptionPage: React.FC = () => {
  const {
    currentUser,
    invoices,
    fetchInvoices,
    paymentRequests,
    updatePaymentMethod,
    updateUserProfile,
    confirm,
    processAutoDeductions,
    addToast,
    navigateTo,
  } = useApp();

  const [isSimulating, setIsSimulating] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<'prime' | 'pro'>('prime');

  // Manual payment proof modal states
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [selectedPlanForProof, setSelectedPlanForProof] = useState<'prime' | 'pro'>('prime');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // Form states for card modal
  const [cardHolder, setCardHolder] = useState(currentUser?.full_name || 'Alex Rivera');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardBrand, setCardBrand] = useState(currentUser?.card_brand || 'Visa');
  const [autoDebit, setAutoDebit] = useState(currentUser?.auto_debit_enabled !== false);
  const [isSavingCard, setIsSavingCard] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const isTrialing = currentUser?.subscription_status === 'trialing';
  const isActive = currentUser?.subscription_status === 'active';
  const isPastDue = currentUser?.subscription_status === 'past_due' || currentUser?.subscription_status === 'expired';

  const trialStart = currentUser?.trial_start_date ? new Date(currentUser.trial_start_date) : new Date(Date.now() - 9 * 86400000);
  const trialEnd = currentUser?.trial_end_date ? new Date(currentUser.trial_end_date) : new Date(Date.now() + 5 * 86400000);
  const now = new Date();

  const totalTrialDays = currentUser?.trial_days_total || 14;
  const elapsedDays = Math.min(totalTrialDays, Math.max(1, Math.round((now.getTime() - trialStart.getTime()) / 86400000)));
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000));
  const progressPercent = Math.min(100, Math.max(5, Math.round((elapsedDays / totalTrialDays) * 100)));

  const formattedRenewal = trialEnd.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const nextBillingDate = currentUser?.next_billing_date
    ? new Date(currentUser.next_billing_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : formattedRenewal;

  const currentCardLast4 = currentUser?.card_last4 || '4242';
  const currentCardBrand = currentUser?.card_brand || 'Visa';
  const planAmount = currentUser?.billing_amount || 9.99;

  const handleToggleAutoDebit = async () => {
    const nextVal = !autoDebit;
    setAutoDebit(nextVal);
    await updatePaymentMethod(currentCardLast4, currentCardBrand, nextVal);
    addToast(
      nextVal ? 'Card On File Saved' : 'Card Billing Paused',
      nextVal
        ? 'Your payment card is saved on file for subscription renewal.'
        : 'Subscription renewal paused.',
      nextVal ? 'success' : 'info'
    );
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCard(true);
    try {
      const cleanDigits = cardNumber.replace(/\D/g, '');
      const last4 = cleanDigits.length >= 4 ? cleanDigits.slice(-4) : currentCardLast4;
      await updatePaymentMethod(last4, cardBrand, autoDebit);
      setShowCardModal(false);
      addToast('Card Saved', `Payment method updated to ${cardBrand} ending in •••• ${last4}.`, 'success');
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleSwitchToFree = () => {
    if (!currentUser) return;
    confirm({
      title: 'Downgrade to Free Community Plan (500 MB)?',
      message:
        'Your account will be moved to the permanent 500 MB Free Community plan. All recurring renewal billing will be cancelled. Your uploaded images within 500 MB remain safe and active.',
      confirmLabel: 'Confirm Switch to Free (500 MB)',
      onConfirm: async () => {
        updateUserProfile(currentUser.id, {
          plan: 'free',
          plan_name: 'Free Community (500 MB)',
          storage_limit: 500 * 1024 * 1024,
          subscription_status: 'active',
          billing_plan: 'free',
          billing_amount: 0,
        });
        addToast(
          'Plan Changed to Free Community (500 MB)',
          'Your account has been switched to the 500 MB Free Plan successfully.',
          'success'
        );
      },
    });
  };

  const handleStartUpgrade = (targetPlan: 'prime' | 'pro') => {
    setSelectedPlanForPayment(targetPlan);
    setIsCardModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>Subscription & Billing</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              }`}>
                {currentUser?.plan === 'community' || currentUser?.plan === 'free' ? 'Community Plan (Free 500 MB)' : currentUser?.plan === 'prime' ? 'Prime Plan (15 GB)' : 'Pro Creator Plan (50 GB)'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your media cloud storage plan, payment card, and official invoice receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedPlanForProof(currentUser?.plan === 'prime' ? 'pro' : 'prime');
                setIsPaymentProofModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Payment Proof</span>
            </button>
            <button
              type="button"
              onClick={() => handleStartUpgrade(currentUser?.plan === 'pro' ? 'prime' : 'pro')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay via Safepay</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCardModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>Update Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trial Countdown & Status Spotlight */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {currentUser?.plan === 'community' || currentUser?.plan === 'free'
                      ? 'Community Cloud (500 MB Free)'
                      : currentUser?.plan === 'prime'
                      ? 'Prime Creator Plan (15 GB)'
                      : 'Pro Studio Plan (50 GB)'}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentUser?.plan === 'community' || currentUser?.plan === 'free' ? '500 MB Storage' : currentUser?.plan === 'prime' ? '15 GB Storage' : '50 GB Storage'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {currentUser?.plan === 'community' || currentUser?.plan === 'free'
                    ? '100% Free permanent cloud media storage. Upgrade to Prime or Pro anytime.'
                    : `Active subscription renewed monthly at $${planAmount.toFixed(2)}/mo on ${formattedRenewal}.`}
                </p>
              </div>
            </div>

            {/* Billing Status Stat */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl shrink-0">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subscription Status
                </span>
                <span className="text-lg font-black text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {currentUser?.plan === 'community' || currentUser?.plan === 'free' ? 'Free Forever' : 'Active Subscription'}
                </span>
              </div>
            </div>
          </div>

          {/* Cloud Hosting Notice */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Cloud Media Storage Active</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentUser?.plan === 'community' || currentUser?.plan === 'free'
                    ? 'Your Community account gives you 500 MB free storage forever with direct embed URLs.'
                    : `Your ${currentUser?.plan === 'prime' ? 'Prime (15 GB)' : 'Pro (50 GB)'} cloud media storage is active. Invoices are recorded on your profile.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans & Instant Switching */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Available Storage Plans (منصوبہ تبدیل کریں)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch anytime between Free (500 MB), Prime (15 GB), and Pro (50 GB). Payments processed securely via Safepay.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 w-fit">
            Current: {currentUser?.plan === 'pro' ? 'Pro (50 GB)' : currentUser?.plan === 'prime' ? 'Prime (15 GB)' : 'Free (500 MB)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Free Tier */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            !currentUser?.plan || currentUser?.plan === 'free' || currentUser?.plan === 'community'
              ? 'border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs ring-2 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Starter
                </span>
                {(!currentUser?.plan || currentUser?.plan === 'free' || currentUser?.plan === 'community') && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    Active Plan ✓
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Community Free</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">$0.00</span>
                  <span className="text-xs text-slate-500">/ free forever</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> 500 MB Cloud Storage
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Max 10 MB per file
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Direct Embed Links
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800">
              {!currentUser?.plan || currentUser?.plan === 'free' || currentUser?.plan === 'community' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 cursor-default"
                >
                  Current Active Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSwitchToFree}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all active:scale-95"
                >
                  Switch to Free (500 MB)
                </button>
              )}
            </div>
          </div>

          {/* Prime Tier */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            currentUser?.plan === 'prime'
              ? 'border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs ring-2 ring-blue-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Creator Choice
                </span>
                {currentUser?.plan === 'prime' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                    Active Plan ✓
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Prime Creator</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">$4.99</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                  <Check className="w-3.5 h-3.5" /> 15 GB Cloud Storage
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Max 35 MB per file
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Ultra CDN Edge Delivery
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800">
              {currentUser?.plan === 'prime' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600/20 text-blue-700 dark:text-blue-300 cursor-default"
                >
                  Current Active Plan
                </button>
              ) : (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanForProof('prime');
                      setIsPaymentProofModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Payment Proof ($4.99/mo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartUpgrade('prime')}
                    className="w-full py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700"
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Or Pay via Safepay</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pro Tier */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            currentUser?.plan === 'pro'
              ? 'border-indigo-500/80 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs ring-2 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Studio Master
                </span>
                {currentUser?.plan === 'pro' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                    Active Plan ✓
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Pro Studio</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">$9.99</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                  <Check className="w-3.5 h-3.5" /> 50 GB Ultra Storage
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Max 100 MB per file
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Priority CDN & Analytics
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800">
              {currentUser?.plan === 'pro' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 cursor-default"
                >
                  Current Active Plan
                </button>
              ) : (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanForProof('pro');
                      setIsPaymentProofModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Payment Proof ($9.99/mo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartUpgrade('pro')}
                    className="w-full py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700"
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Or Pay via Safepay</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Connected Payment Card + Feature Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Card Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Payment Method</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowCardModal(true)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          {/* Visual Credit Card Preview */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md relative overflow-hidden border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold tracking-widest uppercase text-slate-400">ImgSphere Pay</span>
              <span className="font-extrabold text-sm text-indigo-300">{currentCardBrand}</span>
            </div>

            <div className="text-base sm:text-lg font-mono tracking-widest text-slate-100 mb-4">
              •••• •••• •••• {currentCardLast4}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <div>
                <span className="block text-[9px] uppercase tracking-wider">Card Holder</span>
                <span className="font-semibold text-slate-200">{currentUser?.full_name || 'Account Owner'}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider">Expires</span>
                <span className="font-semibold text-slate-200">12/28</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span>Plan Subscription Rate</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">${planAmount.toFixed(2)}/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Billing Cycle</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Monthly</span>
            </div>
          </div>
        </div>

        {/* Pro Plan Feature Inclusions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Pro Plan Capabilities & Storage Quota</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { title: '50 GB Cloud Storage', desc: 'Ample space for thousands of high-res photos and prototypes' },
              { title: 'Global CDN Delivery', desc: 'Sub-45ms delivery with permanent direct embed URLs' },
              { title: 'Zero Compression Loss', desc: 'Original fidelity preserved or WebP optimized automatically' },
              { title: 'Ad-Free Direct URLs', desc: 'Direct /i/ links for forums, markdown, HTML, and websites' },
              { title: 'Unlimited Folders & Tags', desc: 'Organize assets with deep search & batch operations' },
              { title: 'Priority Support & SLA', desc: 'Direct ticket response within 2 hours' },
            ].map((feat, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{feat.title}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">{feat.desc}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* My Payment Proof Submissions (رسید کی تصدیق کی حیثیت) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Payment Proof Submissions & Verification Status (میری جمع کرائی گئی رسیدیں)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track your manual bank, EasyPaisa, and JazzCash payment proofs submitted for Admin & Owner approval.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPlanForProof(currentUser?.plan === 'prime' ? 'pro' : 'prime');
              setIsPaymentProofModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-xs w-fit"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Payment Proof</span>
          </button>
        </div>

        {(() => {
          const userRequests = paymentRequests.filter(
            (r) =>
              (currentUser?.id && r.user_id === currentUser.id) ||
              (currentUser?.email && r.customer_email.toLowerCase() === currentUser.email.toLowerCase())
          );

          if (userRequests.length === 0) {
            return (
              <div className="py-8 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-850">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No Payment Proofs Submitted Yet
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm mx-auto">
                  When you purchase Prime or Pro via EasyPaisa, JazzCash, or Meezan Bank, upload your screenshot here. Admin & Owner will review and activate your plan.
                </p>
              </div>
            );
          }

          return (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Screenshot Proof</th>
                    <th className="py-3 px-3">Plan Requested</th>
                    <th className="py-3 px-3">Channel & TRX ID</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Submission Date</th>
                    <th className="py-3 px-3">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => setPreviewScreenshotUrl(req.voucher_url)}
                          className="group relative block w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 transition-all shrink-0"
                          title="Click to view full screenshot"
                        >
                          <img
                            src={req.voucher_url}
                            alt="Payment Voucher"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {req.plan_name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                          {req.billing_cycle || 'monthly'} cycle
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 block">
                          {req.payment_method || 'Bank Transfer'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {req.transaction_id ? `TRX: ${req.transaction_id}` : 'No TRX ID'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        ${req.amount} USD
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        {req.status === 'pending' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse border border-amber-300/60 dark:border-amber-700/60">
                              <Clock className="w-3 h-3" />
                              <span>Pending Verification (زیرِ غور)</span>
                            </span>
                            <span className="block text-[10px] text-slate-400 leading-tight">
                              Owner/Admin is reviewing your receipt
                            </span>
                          </div>
                        )}
                        {req.status === 'approved' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approved & Active (منظور شدہ)</span>
                            </span>
                            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight">
                              Plan Activated ✓
                            </span>
                          </div>
                        )}
                        {req.status === 'rejected' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/60 dark:border-rose-700/60">
                              <X className="w-3 h-3" />
                              <span>Rejected (مسترد)</span>
                            </span>
                            {req.admin_notes && (
                              <span className="block text-[10px] text-rose-600 dark:text-rose-400 leading-tight">
                                {req.admin_notes}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* Invoices & Billing Receipts History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Invoices & Payment Receipts</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official billing receipts with invoice ID, payment method timestamp, and plan details.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchInvoices}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Invoices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              No Invoices Generated Yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Your official subscription invoices and receipts will appear here as soon as payment is processed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Plan / Description</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-100 block">
                        {inv.plan_name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs block">
                        {inv.description}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        {inv.card_brand || 'Visa'} •••• {inv.card_last4 || '4242'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Paid (Auto-Debited)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => addToast('Invoice Download', `Receipt for ${inv.id} ready to print.`, 'info')}
                        className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Payment Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Update Auto-Payment Card</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Card will be securely stored for automatic monthly renewal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cardholder Full Name
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-hidden pr-20"
                    placeholder="4242 4242 4242 4242"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-slate-400">
                    <span className="text-[11px] font-bold text-blue-600">Visa / MC</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                    placeholder="MM/YY"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Security Code (CVC)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-hidden"
                    placeholder="•••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDebit}
                    onChange={(e) => setAutoDebit(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    Keep payment card securely on file for subscription plan billing.
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCard}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSavingCard ? 'Saving...' : 'Save & Link Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Safepay Direct Card Payment & Upgrade Modal */}
      <DirectCardPaymentModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        plan={selectedPlanForPayment}
        customerDetails={{
          fullName: currentUser?.full_name || 'Account Owner',
          email: currentUser?.email || '',
        }}
        onSuccess={(res) => {
          setIsCardModalOpen(false);
          const targetPlan = res.plan || selectedPlanForPayment;
          const isPrime = targetPlan === 'prime';
          const newQuota = isPrime ? 15 * 1024 * 1024 * 1024 : 50 * 1024 * 1024 * 1024;
          const newPlanName = isPrime ? 'Prime Plan (15 GB)' : 'Pro Creator Plan (50 GB)';
          const newAmount = isPrime ? 4.99 : 9.99;

          if (currentUser) {
            updateUserProfile(currentUser.id, {
              plan: targetPlan,
              plan_name: newPlanName,
              storage_limit: newQuota,
              subscription_status: 'active',
              billing_plan: targetPlan,
              billing_amount: newAmount,
              card_last4: res.cardLast4,
              card_brand: res.cardBrand,
              auto_debit_enabled: true,
            });
          }

          updatePaymentMethod(res.cardLast4, res.cardBrand, true);
          fetchInvoices();
          addToast(
            'Plan Upgraded Successfully 🎉',
            `Your account has been upgraded to ${newPlanName} with ${isPrime ? '15 GB' : '50 GB'} storage. Safepay verified!`,
            'success'
          );
        }}
      />

      {/* Lightbox Screenshot Preview Modal */}
      {previewScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Payment Proof Screenshot Receipt
              </span>
              <button
                type="button"
                onClick={() => setPreviewScreenshotUrl(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/50 p-2">
              <img
                src={previewScreenshotUrl}
                alt="Payment Proof Full Receipt"
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Form Modal */}
      {isPaymentProofModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setIsPaymentProofModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PaymentVerificationForm
              initialPlanId={selectedPlanForProof === 'pro' ? 'plan_pro' : 'plan_prime'}
              onCancel={() => setIsPaymentProofModalOpen(false)}
              onSuccess={() => {
                fetchInvoices();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
