import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PricingPlan } from '../../types';
import { PaymentModal } from './PaymentModal';
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  Tag,
  ArrowRight,
  HardDrive,
  UploadCloud,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface PricingSectionProps {
  id?: string;
  isStandalonePage?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  id = 'pricing',
  isStandalonePage = false,
}) => {
  const { systemSettings, navigateTo, addToast, currentUser } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PricingPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(() => {
    // If active discount campaign, auto-apply or leave ready
    return systemSettings?.discount_campaign?.is_active ? systemSettings.discount_campaign.code : null;
  });

  const campaign = systemSettings?.discount_campaign;
  const isCampaignActive = Boolean(campaign?.is_active);

  const discountPercent =
    appliedPromo && campaign?.code && appliedPromo.toUpperCase() === campaign.code.toUpperCase()
      ? campaign.percentage
      : 0;

  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = promoCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    if (campaign && campaign.is_active && cleanCode === campaign.code.toUpperCase()) {
      setAppliedPromo(cleanCode);
      addToast('Promo Code Applied!', `${campaign.percentage}% discount activated.`, 'success');
    } else {
      addToast('Invalid Promo Code', 'This code is expired or invalid.', 'error');
    }
  };

  const plans = systemSettings?.pricing_plans || [
    {
      id: 'plan_community',
      name: 'Community',
      badge: 'Free Account',
      monthly_price: 0,
      annual_price: 0,
      storage_gb: 0.5,
      max_file_mb: 10,
      description: 'Permanent free cloud storage of 500 MB for casual sharing, personal blogging, and fast uploads.',
      features: [
        '500 MB High-Speed Cloud Storage',
        '10 MB Maximum Single File Size',
        'Direct Shareable URLs & Embed Codes',
        'Global CDN Image Delivery',
        'Custom Folders & Tag Organization',
        'Live View & Download Counters',
        'Full Privacy (Public / Unlisted / Private)',
      ],
      is_popular: false,
      cta_label: 'Start Free (500 MB)',
    },
    {
      id: 'plan_prime',
      name: 'Prime',
      badge: 'Creator Choice',
      monthly_price: 4.99,
      annual_price: 3.99,
      storage_gb: 15,
      max_file_mb: 35,
      description: 'Ideal for creators, bloggers, and designers. 15 GB high-speed cloud storage at $4.99/mo.',
      features: [
        '15 GB Cloud Media Storage',
        '35 MB Maximum Single File Size',
        'Ultra-Fast CDN Edge Routing',
        'Automatic WebP & AVIF Compression',
        'Ad-Free Direct Media Pages',
        'Custom Folders & Tag Organization',
        'Priority Bandwidth Delivery',
      ],
      is_popular: false,
      cta_label: 'Choose Prime',
    },
    {
      id: 'plan_pro',
      name: 'Pro',
      badge: 'Most Popular',
      monthly_price: 9.99,
      annual_price: 7.99,
      storage_gb: 50,
      max_file_mb: 100,
      description: 'Built for professional photographers, studios, and high-volume media publishers.',
      features: [
        '50 GB Ultra Cloud Storage',
        '100 MB Maximum Single File Size',
        'Dedicated High-Speed CDN Edge Routing',
        'Custom Domain Link Embedding',
        'Multi-Folder Team Image Vault',
        'Full Analytics & Referrer History',
        '24/7 Priority Support',
      ],
      is_popular: true,
      cta_label: 'Choose Pro',
    },
  ];

  const handlePlanSelect = (plan: (typeof plans)[0]) => {
    const planKey = plan.id.includes('community')
      ? 'community'
      : plan.id.includes('prime')
      ? 'prime'
      : 'pro';

    if (currentUser) {
      navigateTo('dashboard-billing');
    } else {
      navigateTo('signup', { plan: planKey });
    }
  };

  return (
    <section
      id={id}
      className={`py-20 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800 relative overflow-hidden ${
        isStandalonePage ? 'min-h-[85vh] pt-12' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Transparent Pricing Architecture</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Flexible Storage Plans for Every Workflow
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
            Start with our generous free plan or unlock massive storage capacities and ultra-fast edge bandwidth.
          </p>

          {/* Discount Campaign Alert Banner */}
          {isCampaignActive && campaign && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 text-slate-800 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    Flash Sale Active: {campaign.percentage}% Discount!
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {campaign.banner_text}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-bold bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-800 dark:text-amber-300">
                  {campaign.code}
                </span>
                {appliedPromo === campaign.code ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setAppliedPromo(campaign.code);
                      addToast('Discount Applied', `${campaign.percentage}% discount applied to plans!`, 'success');
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow transition-all active:scale-95"
                  >
                    Apply Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-300/60 dark:border-slate-700/60">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const basePrice = billingCycle === 'annual' ? plan.annual_price : plan.monthly_price;
            const finalPrice =
              basePrice > 0 && discountPercent > 0
                ? (basePrice * (1 - discountPercent / 100)).toFixed(1).replace('.0', '')
                : basePrice;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.is_popular
                    ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 shadow-2xl scale-105 z-10'
                    : 'bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${
                      plan.is_popular
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  {/* Plan Name & Desc */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px] leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  {/* Price Display */}
                  <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-baseline gap-2">
                      {basePrice > 0 && discountPercent > 0 && (
                        <span className="text-xl font-semibold text-slate-400 line-through">
                          ${basePrice}
                        </span>
                      )}
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        ${finalPrice}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        / month {billingCycle === 'annual' && basePrice > 0 ? '(billed annually)' : ''}
                      </span>
                    </div>
                    {discountPercent > 0 && basePrice > 0 && (
                      <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{discountPercent}% discount active</span>
                      </div>
                    )}
                  </div>

                  {/* Storage & Limits Highlight */}
                  <div className="grid grid-cols-2 gap-2 mb-6 text-center">
                    <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/30">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Storage</div>
                      <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {plan.storage_gb < 1 ? `${Math.round(plan.storage_gb * 1000)} MB` : `${plan.storage_gb} GB`} Cloud
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/30">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Max Upload</div>
                      <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {plan.max_file_mb} MB / file
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8 text-xs text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action Button */}
                <button
                  id={`select-plan-${plan.id}`}
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    plan.is_popular
                      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/30'
                      : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
                  }`}
                >
                  <span>{plan.cta_label}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Promo Code Custom Input Box */}
        <div className="mt-14 max-w-md mx-auto p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Have a promotional discount coupon?</span>
          </div>
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <input
              type="text"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value)}
              placeholder="e.g. SAVE30"
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
            >
              Apply
            </button>
          </form>
          {appliedPromo && (
            <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Active coupon: <strong>{appliedPromo}</strong> applied to all plans!
            </p>
          )}
        </div>

        {/* Payment Verification Quick Access Banner */}
        <div className="mt-8 max-w-xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-blue-50/70 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-center flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Already transferred money via EasyPaisa, JazzCash, or Bank?
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Submit your Transaction ID, date, and screenshot to activate your account.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('payment-verification')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <span>Payment Verification Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Official Bank Payment & Voucher Upload Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPaymentPlan}
        billingCycle={billingCycle}
        discountPercent={discountPercent}
      />
    </section>
  );
};
