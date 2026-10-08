import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { User, AdminPermission } from '../../../types';
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Users,
  Save,
  Check,
  X,
  Lock,
} from 'lucide-react';

const PERM_CATEGORIES: { category: string; perms: { id: AdminPermission; label: string; desc: string }[] }[] = [
  {
    category: 'Dashboard',
    perms: [{ id: 'dashboard.view', label: 'View Dashboard', desc: 'Access to system overview and metrics' }],
  },
  {
    category: 'Users / Clients',
    perms: [
      { id: 'users.view', label: 'View Clients', desc: 'Browse customer list and quotas' },
      { id: 'users.create', label: 'Create Clients', desc: 'Directly register new client accounts' },
      { id: 'users.edit', label: 'Edit Clients', desc: 'Update customer profiles, plans, and quotas' },
      { id: 'users.delete', label: 'Delete Clients', desc: 'Permanently remove customer accounts' },
      { id: 'users.suspend', label: 'Suspend Clients', desc: 'Temporarily freeze customer logins' },
    ],
  },
  {
    category: 'Admins',
    perms: [
      { id: 'admins.view', label: 'View Admins', desc: 'Inspect administrative roster' },
      { id: 'admins.create', label: 'Add Admin', desc: 'Appoint new administrative staff' },
      { id: 'admins.edit', label: 'Edit Admin', desc: 'Modify staff profile and role tier' },
      { id: 'admins.remove', label: 'Remove Admin', desc: 'Demote administrator back to user' },
      { id: 'admins.suspend', label: 'Suspend Admin', desc: 'Temporarily lock admin console access' },
      { id: 'admins.reset_password', label: 'Reset Password', desc: 'Generate verified temporary access token' },
    ],
  },
  {
    category: 'Resources & Media',
    perms: [
      { id: 'resources.view', label: 'View Resources', desc: 'Inspect cloud storage files and CDN' },
      { id: 'resources.create', label: 'Create Resources', desc: 'Upload media on behalf of platform' },
      { id: 'resources.edit', label: 'Edit Resources', desc: 'Modify metadata, visibility, and tags' },
      { id: 'resources.delete', label: 'Delete Resources', desc: 'Purge files from storage engine' },
    ],
  },
  {
    category: 'Projects',
    perms: [
      { id: 'projects.view', label: 'View Projects', desc: 'Inspect client assignments & tasks' },
      { id: 'projects.create', label: 'Create Projects', desc: 'Initialize new design work' },
      { id: 'projects.edit', label: 'Edit Projects', desc: 'Update deliverables, status, and budget' },
      { id: 'projects.delete', label: 'Delete Projects', desc: 'Remove project from system' },
      { id: 'projects.assign', label: 'Assign Projects', desc: 'Delegate project to specific staff' },
    ],
  },
  {
    category: 'Payments',
    perms: [
      { id: 'payments.view', label: 'View Payments', desc: 'Review invoice archives and vouchers' },
      { id: 'payments.approve', label: 'Approve Payments', desc: 'Verify receipt and unlock storage' },
      { id: 'payments.reject', label: 'Reject Payments', desc: 'Decline invalid transaction slips' },
      { id: 'payments.refund', label: 'Refund Payments', desc: 'Process customer refund requests' },
    ],
  },
  {
    category: 'Reports & Moderation',
    perms: [
      { id: 'reports.view', label: 'View Reports', desc: 'Inspect flagged content and copyright complaints' },
      { id: 'reports.export', label: 'Export Reports', desc: 'Download CSV and JSON moderation archives' },
    ],
  },
  {
    category: 'Website Management',
    perms: [
      { id: 'website.content', label: 'Manage Content', desc: 'Edit homepage text, features, and FAQs' },
      { id: 'website.pages', label: 'Manage Pages', desc: 'Control navigation menu and links' },
      { id: 'website.media', label: 'Manage Media', desc: 'Update platform hero visuals and banners' },
      { id: 'website.seo', label: 'Manage SEO', desc: 'Configure title tags and open graph metadata' },
    ],
  },
  {
    category: 'Settings',
    perms: [
      { id: 'settings.view', label: 'View Settings', desc: 'Read platform configuration and limits' },
      { id: 'settings.edit', label: 'Edit Settings', desc: 'Change site name, logos, and defaults' },
    ],
  },
  {
    category: 'Security',
    perms: [
      { id: 'security.logs', label: 'View Logs', desc: 'Audit system activity and login events' },
      { id: 'security.sessions', label: 'Manage Sessions', desc: 'Inspect active browser sessions' },
      { id: 'security.permissions', label: 'Manage Permissions', desc: 'Adjust delegated access matrices' },
    ],
  },
];

export const OwnerPermissionsSection: React.FC = () => {
  const { users, assignAdminRole, addToast, syncUsersFromDatabase } = useApp();

  const admins = users.filter((u) => u.role === 'admin');
  const [selectedAdminId, setSelectedAdminId] = useState<string>(admins[0]?.id || '');
  const [currentPerms, setCurrentPerms] = useState<AdminPermission[]>(() => {
    return admins[0]?.admin_permissions || [];
  });
  const [isSaving, setIsSaving] = useState(false);

  const selectedAdmin = users.find((u) => u.id === selectedAdminId);

  const handleSelectAdmin = (adminId: string) => {
    setSelectedAdminId(adminId);
    const target = users.find((u) => u.id === adminId);
    setCurrentPerms(target?.admin_permissions || []);
  };

  const handleTogglePerm = (permId: AdminPermission) => {
    setCurrentPerms((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAll = () => {
    const all = PERM_CATEGORIES.flatMap((c) => c.perms.map((p) => p.id));
    setCurrentPerms(Array.from(new Set(all)));
  };

  const handleRemoveAll = () => {
    setCurrentPerms([]);
  };

  const handleSavePermissions = async () => {
    if (!selectedAdmin) return;
    setIsSaving(true);
    try {
      await assignAdminRole(selectedAdmin.id, 'admin', currentPerms);
      await syncUsersFromDatabase();
      addToast('Permissions Updated', `Permissions for ${selectedAdmin.full_name} have been saved and applied in backend.`, 'success');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-600" />
            <span>Granular Permission Management Matrix (اختیارات کی تقسیم)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Owner controls exact feature access for each admin. Backend enforces these permissions on all API requests.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSavePermissions}
          disabled={isSaving || !selectedAdmin}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all shrink-0 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Enforcing in Backend...' : 'Save & Enforce Permissions'}</span>
        </button>
      </div>

      {/* Select Admin Dropdown Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-400" />
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select Administrator to Configure
            </label>
            <select
              value={selectedAdminId}
              onChange={(e) => handleSelectAdmin(e.target.value)}
              className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:ring-0 p-0 cursor-pointer"
            >
              {admins.map((adm, idx) => (
                <option key={`adm-perm-opt-${adm.id || adm.user_id || adm.email || 'adm'}-${idx}`} value={adm.id} className="text-slate-900 dark:text-white dark:bg-slate-900">
                  {adm.full_name} ({adm.email}) — {adm.admin_permissions?.length || 0} permissions
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleRemoveAll}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
          >
            Remove All
          </button>
        </div>
      </div>

      {/* Permission Categories Matrix (Section 3 of spec) */}
      <div className="space-y-4">
        {PERM_CATEGORIES.map((cat) => (
          <div
            key={cat.category}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                {cat.category}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {cat.perms.filter((p) => currentPerms.includes(p.id)).length} of {cat.perms.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {cat.perms.map((p) => {
                const isChecked = currentPerms.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleTogglePerm(p.id)}
                    className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all text-xs ${
                      isChecked
                        ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-400 dark:border-purple-800 text-slate-900 dark:text-white font-medium'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">
                        {p.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {p.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
