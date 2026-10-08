import React from 'react';
import { useApp } from '../../../context/AppContext';
import { formatBytes } from '../../../utils/imageCompression';
import {
  Users,
  ShieldCheck,
  Zap,
  HardDrive,
  CreditCard,
  FolderGit2,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Crown,
  ArrowRight,
} from 'lucide-react';

interface OwnerOverviewSectionProps {
  onNavigateTab: (tab: string) => void;
  onOpenAppointAdmin: () => void;
  onOpenCreateProject: () => void;
}

export const OwnerOverviewSection: React.FC<OwnerOverviewSectionProps> = ({
  onNavigateTab,
  onOpenAppointAdmin,
  onOpenCreateProject,
}) => {
  const {
    users,
    invoices,
    clientIssues,
    adminActivityLogs,
    clientProjects,
    paymentRequests,
  } = useApp();

  const ownerUsers = users.filter((u) => u.role === 'owner');
  const adminUsers = users.filter((u) => u.role === 'admin');
  const activeAdmins = adminUsers.filter((u) => u.status === 'active');
  const clientUsers = users.filter((u) => !u.role || u.role === 'user');
  const activeClients = clientUsers.filter((u) => u.status === 'active');

  const totalProjects = clientProjects.length;
  const pendingProjects = clientProjects.filter((p) => p.status === 'pending');
  const completedProjects = clientProjects.filter((p) => p.status === 'completed');

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const pendingPayments = paymentRequests.filter((p) => p.status === 'pending');
  const openIssues = clientIssues.filter((t) => t.status !== 'resolved');

  const totalStorageUsed = users.reduce((sum, u) => sum + (u.storage_used || 0), 0);
  const totalStorageQuota = users.reduce((sum, u) => sum + (u.storage_limit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Pending Payment Verification Alert Banner */}
      {pendingPayments.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/40 dark:border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md shadow-amber-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {pendingPayments.length} Payment Verification Request{pendingPayments.length > 1 ? 's' : ''} Pending Review
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                نئے صارفین نے اکاؤنٹ کے لیے پیمنٹ رسید اور اسکرین شاٹ اپلوڈ کیا ہے۔ برائے مہربانی رسید چیک کریں اور پلان ایکٹیویٹ کریں۔
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('payments')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <span>Review Receipts & Approve ({pendingPayments.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 10 Executive KPI Cards (Section 12 of spec) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Admins */}
        <div
          onClick={() => onNavigateTab('admins')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Total Admins</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {adminUsers.length}
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
            + {ownerUsers.length} Super Owner
          </span>
        </div>

        {/* 2. Active Admins */}
        <div
          onClick={() => onNavigateTab('admins')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Active Admins</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {activeAdmins.length}
          </div>
          <span className="text-[10px] text-slate-400">Operational staff</span>
        </div>

        {/* 3. Total Clients */}
        <div
          onClick={() => onNavigateTab('clients')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Total Clients</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {clientUsers.length}
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
            Registered accounts
          </span>
        </div>

        {/* 4. Active Clients */}
        <div
          onClick={() => onNavigateTab('clients')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Active Clients</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {activeClients.length}
          </div>
          <span className="text-[10px] text-slate-400">
            {clientUsers.length - activeClients.length} suspended
          </span>
        </div>

        {/* 5. Total Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalProjects}
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
            Client assignments
          </span>
        </div>

        {/* 6. Pending Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Pending Projects</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingProjects.length}
          </div>
          <span className="text-[10px] text-slate-400">In queue/review</span>
        </div>

        {/* 7. Completed Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Completed Projects</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {completedProjects.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Delivered</span>
        </div>

        {/* 8. Revenue */}
        <div
          onClick={() => onNavigateTab('payments')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ${totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Settled via Direct Vault
          </span>
        </div>

        {/* 9. Pending Payments */}
        <div
          onClick={() => onNavigateTab('payments')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Pending Payments</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingPayments.length}
          </div>
          <span className="text-[10px] text-slate-400">Requires verification</span>
        </div>

        {/* 10. Recent Activities */}
        <div
          onClick={() => onNavigateTab('activity_logs')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Audit Events</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {adminActivityLogs.length}
          </div>
          <span className="text-[10px] text-slate-400">Recorded audit events</span>
        </div>
      </div>

      {/* Clean Analytics & Operational Visualizations (Section 12 of spec) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: User Growth & Plan Tiers */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Client Growth & Tier Distribution</span>
              </h3>
              <p className="text-xs text-slate-500">Live breakdown of active subscriptions</p>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
              {clientUsers.length} Total Users
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Pro Tier ($9.99/mo)</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">
                  {clientUsers.filter((u) => u.plan === 'pro').length} clients
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{
                    width: `${(clientUsers.filter((u) => u.plan === 'pro').length / (clientUsers.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Prime Tier ($4.99/mo)</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {clientUsers.filter((u) => u.plan === 'prime').length} clients
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{
                    width: `${(clientUsers.filter((u) => u.plan === 'prime').length / (clientUsers.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Free Community Tier</span>
                <span className="font-mono text-slate-500">
                  {clientUsers.filter((u) => !u.plan || u.plan === 'free' || u.plan === 'community').length} clients
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full"
                  style={{
                    width: `${(clientUsers.filter((u) => !u.plan || u.plan === 'free' || u.plan === 'community').length / (clientUsers.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Resource Allocation & Storage Usage */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <span>System Resource & Quota Allocation</span>
              </h3>
              <p className="text-xs text-slate-500">Global disk and capacity utilization</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              {formatBytes(totalStorageUsed)} / {formatBytes(totalStorageQuota)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Media Storage Engine (Edge S3/Supabase)
              </span>
              <span className="font-mono font-bold text-emerald-600">
                {Math.round((totalStorageUsed / (totalStorageQuota || 1)) * 100)}% Capacity Used
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(4, Math.round((totalStorageUsed / (totalStorageQuota || 1)) * 100)))}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Community baseline: 500 MB permanent</span>
              <span>Pro maximum: 50 GB / client</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Problem Attention Banner (if open issues exist) */}
      {openIssues.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 shrink-0">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{openIssues.length} Client Tickets Need Administrative Attention</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                  Priority
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Storage limit issues, quota stalls, and credential unlocks can be solved in 1 click.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('client_issues')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shrink-0 shadow-md transition-all active:scale-95"
          >
            Open Problem Solver Desk &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
