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
  Users,
  Search,
  Filter,
  DollarSign,
  ChevronRight,
  Sliders,
  Building,
  Wallet,
  HelpCircle,
  UploadCloud,
  Eye,
} from 'lucide-react';
import { formatBytes } from '../../utils/imageCompression';

export const AdminSubscriptionsPage: React.FC = () => {
  const {
    users,
    invoices,
    fetchInvoices,
    extendTrial,
    processAutoDeductions,
    syncUsersFromDatabase,
    systemSettings,
    updateSystemSettings,
    addToast,
    confirm,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'trialing' | 'active' | 'expired'>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    const userStatus = u.subscription_status || 'trialing';
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const trialUsersCount = users.filter((u) => (u.subscription_status || 'trialing') === 'trialing').length;
  const activePaidCount = users.filter((u) => u.subscription_status === 'active').length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amount || 9.99), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Subscriptions & Revenue Billing</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              Billing Engine Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage user subscription plans (Community, Prime, Pro) and verify manual payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo('admin-payments')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-all shadow-sm active:scale-95"
            title="Review pending payment proofs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Review Payment Proofs</span>
          </button>
          <button
            type="button"
            onClick={fetchInvoices}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-purple-600" />
            <span>Refresh Records</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Community (Free) Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {users.filter(u => !u.plan || u.plan === 'community').length} Users
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
            500 MB permanent storage
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Paid (Prime & Pro)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {users.filter(u => u.plan === 'prime' || u.plan === 'pro').length} Accounts
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Active paid subscriptions
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Auto-Debited Invoices</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {invoices.length} Receipts
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
            Recorded in database
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-purple-600 dark:text-purple-400">
            ${totalRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Monthly automated volume
          </p>
        </div>
      </div>

      {/* Owner Revenue & Personal Account Payout Guide */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Wallet className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                How Revenue Reaches Your Personal Account (پیسے آپ کے ذاتی اکاؤنٹ میں کیسے آئیں گے)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Platform revenue is routed to you in 2 distinct, flexible ways:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> 1. Direct Bank / JazzCash / EasyPaisa
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Customers transfer money directly to your personal bank account or mobile wallet. The full amount arrives in your personal balance immediately.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="font-bold text-blue-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> 2. Direct Card Billing & Manual Deductions
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  When card deductions execute from the Admin Panel, the funds are debited from the customer's payment card on file and credited to your account.
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              type="button"
              onClick={() => navigateTo('admin-payments')}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Building className="w-4 h-4" />
              <span>Configure Personal Bank / Wallet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('admin-settings')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 transition-all text-center"
            >
              <span>Payment Gateway Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Plan Status Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>User Subscriptions & Plans</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review user subscription tiers, renewal dates, and payment history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-hidden"
            >
              <option value="all">All Plans</option>
              <option value="active">Active Paid</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Plan / Tier</th>
                <th className="py-3 px-4">Trial / Subscription Status</th>
                <th className="py-3 px-4">Auto-Debit Card</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u, idx) => {
                const isTrial = (u.subscription_status || 'trialing') === 'trialing';
                const trialEnd = u.trial_end_date ? new Date(u.trial_end_date) : new Date(Date.now() + 14 * 86400000);
                const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000));

                return (
                  <tr key={`sub-user-${u.id || u.user_id || 'u'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${u.id}`}
                          alt={u.full_name}
                          className="w-7 h-7 rounded-full bg-slate-100"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{u.full_name}</span>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="capitalize">{u.plan || 'Pro'}</span> ({formatBytes(u.storage_limit || 26843545600)})
                    </td>

                    <td className="py-3.5 px-4">
                      {u.plan === 'community' || u.plan === 'free' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                          Free Tier (500 MB)
                        </span>
                      ) : u.subscription_status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Active Paid (${(u.billing_amount || 9.99).toFixed(2)}/mo)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending Payment Verification
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        {u.card_brand || 'Visa'} •••• {u.card_last4 || '4242'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {u.next_billing_date ? new Date(u.next_billing_date).toLocaleDateString() : trialEnd.toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => navigateTo('admin-payments')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition-colors inline-flex items-center gap-1 border border-blue-200/50 dark:border-blue-800"
                        title="View user payment slips in verification desk"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Payment Proofs</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Invoices & Upgrades Archive */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-4 h-4 text-blue-600" />
          <span>All System Billing Invoices & Receipts</span>
        </h3>

        {invoices.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No invoices recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv, idx) => (
                  <tr key={`admin-inv-${inv.id || 'i'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      {inv.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{inv.user_id}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{inv.description}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Paid & Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
