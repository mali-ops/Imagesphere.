import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../ui/StatsCard';
import { StorageProgress } from '../ui/StorageProgress';
import { AdminActivityGraph } from './AdminActivityGraph';
import {
  Users,
  Images,
  HardDrive,
  Eye,
  Flag,
  Mail,
  Shield,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Settings,
  CreditCard,
  RefreshCw,
  Activity,
  Sparkles,
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const {
    users,
    images,
    reports,
    supportMessages,
    paymentRequests,
    activityLogs,
    navigateTo,
    resolveReport,
    deleteImage,
    confirm,
    syncUsersFromDatabase,
    isSyncingUsers,
    addToast,
  } = useApp();

  // Sync latest user registrations & logins from database on page load
  useEffect(() => {
    syncUsersFromDatabase();
  }, []);

  const totalUsers = users.length;
  const totalImages = images.length;
  const totalViews = images.reduce((sum, img) => sum + img.views, 0);
  const totalBytes = images.reduce((sum, img) => sum + img.file_size, 0);
  const pendingReports = reports.filter((r) => r.status.toLowerCase() === 'pending');
  const newSupport = supportMessages.filter((m) => m.status === 'new');
  const pendingPayments = paymentRequests.filter((p) => p.status === 'pending');

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const handleManualRefresh = async () => {
    await syncUsersFromDatabase();
    addToast('Data Refreshed', 'Synced latest user accounts and activity metrics.', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with real-time sync status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>System Overview & Reports</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
              Live DB Synced
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time user telemetry, percentage breakdowns, growth velocity, and media capacity.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleManualRefresh}
            disabled={isSyncingUsers}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingUsers ? 'animate-spin text-purple-600' : ''}`} />
            <span>{isSyncingUsers ? 'Syncing Users...' : 'Sync Latest Data'}</span>
          </button>
        </div>
      </div>

      {/* 6 High-Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Platform Images"
          value={totalImages}
          icon={Images}
          color="blue"
        />
        <StatsCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
          color="emerald"
        />
        <StatsCard
          title="Storage Used"
          value={`${(totalBytes / (1024 * 1024)).toFixed(1)} MB`}
          icon={HardDrive}
          color="indigo"
        />
        <StatsCard
          title="Abuse Reports"
          value={pendingReports.length}
          subtitle={pendingReports.length > 0 ? 'Requires review' : 'All clear'}
          icon={Flag}
          color="rose"
        />
        <StatsCard
          title="Support Tickets"
          value={newSupport.length}
          subtitle={newSupport.length > 0 ? 'Pending answers' : 'Inbox clear'}
          icon={Mail}
          color="amber"
        />
      </div>

      {/* INTERACTIVE ACTIVITY GRAPH & PERCENTAGE BREAKDOWN REPORTS ("Kia Hua Hai" & "Kitny Percent Hua Hai") */}
      <AdminActivityGraph />

      {/* Global Storage Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StorageProgress
            usedBytes={totalBytes}
            limitBytes={50 * 1024 * 1024 * 1024} // 50 GB system capacity benchmark
            showBreakdown
            breakdown={{
              jpeg: totalBytes * 0.5,
              png: totalBytes * 0.3,
              webp: totalBytes * 0.15,
              gif: totalBytes * 0.05,
            }}
          />
        </div>

        {/* Quick Moderation Checklist */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Action Items
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pending administrative tasks
            </p>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => navigateTo('admin-payments')}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Pending Payment Vouchers</span>
                </div>
                <span className="font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-mono">
                  {pendingPayments.length}
                </span>
              </div>

              <div
                onClick={() => navigateTo('admin-reports')}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-500" />
                  <span>Pending Abuse Flags</span>
                </div>
                <span className="font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-mono">
                  {pendingReports.length}
                </span>
              </div>

              <div
                onClick={() => navigateTo('admin-support')}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span>Unresolved Inquiries</span>
                </div>
                <span className="font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-mono">
                  {newSupport.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => navigateTo('admin-settings')}
              className="w-full py-2.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-xl transition-colors text-center flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span>System Settings (Cloudinary & Storage)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent User Registrations
            </h3>
            <p className="text-xs text-slate-500">
              Latest members onboarded to the platform
            </p>
          </div>
          <button
            onClick={() => navigateTo('admin-users')}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>View All Users</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Storage Used</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentUsers.map((u, idx) => (
                <tr key={`overview-user-${u.id || u.user_id || 'u'}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 flex items-center gap-2.5">
                    <img
                      src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={u.full_name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {u.full_name}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    {u.email}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                    {(u.storage_used / (1024 * 1024)).toFixed(1)} MB / {(u.storage_limit / (1024 * 1024)).toFixed(0)} MB
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
