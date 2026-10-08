import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { CustomRole, AdminPermission } from '../../../types';
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sliders,
  Check,
  X,
  Users,
  Lock,
} from 'lucide-react';

const PERM_GROUPS: { name: string; perms: { id: AdminPermission; label: string }[] }[] = [
  {
    name: 'Dashboard',
    perms: [{ id: 'dashboard.view', label: 'View Dashboard' }],
  },
  {
    name: 'Users / Clients',
    perms: [
      { id: 'users.view', label: 'View Clients' },
      { id: 'users.create', label: 'Create Clients' },
      { id: 'users.edit', label: 'Edit Clients' },
      { id: 'users.delete', label: 'Delete Clients' },
      { id: 'users.suspend', label: 'Suspend Clients' },
    ],
  },
  {
    name: 'Admins',
    perms: [
      { id: 'admins.view', label: 'View Admins' },
      { id: 'admins.create', label: 'Add Admin' },
      { id: 'admins.edit', label: 'Edit Admin' },
      { id: 'admins.remove', label: 'Remove Admin' },
      { id: 'admins.suspend', label: 'Suspend Admin' },
      { id: 'admins.reset_password', label: 'Reset Password' },
    ],
  },
  {
    name: 'Resources & Media',
    perms: [
      { id: 'resources.view', label: 'View Resources' },
      { id: 'resources.create', label: 'Create Resources' },
      { id: 'resources.edit', label: 'Edit Resources' },
      { id: 'resources.delete', label: 'Delete Resources' },
    ],
  },
  {
    name: 'Projects',
    perms: [
      { id: 'projects.view', label: 'View Projects' },
      { id: 'projects.create', label: 'Create Projects' },
      { id: 'projects.edit', label: 'Edit Projects' },
      { id: 'projects.delete', label: 'Delete Projects' },
      { id: 'projects.assign', label: 'Assign Projects' },
    ],
  },
  {
    name: 'Payments',
    perms: [
      { id: 'payments.view', label: 'View Payments' },
      { id: 'payments.approve', label: 'Approve Payments' },
      { id: 'payments.reject', label: 'Reject Payments' },
      { id: 'payments.refund', label: 'Refund Payments' },
    ],
  },
  {
    name: 'Reports',
    perms: [
      { id: 'reports.view', label: 'View Reports' },
      { id: 'reports.export', label: 'Export Reports' },
    ],
  },
  {
    name: 'Website CMS',
    perms: [
      { id: 'website.content', label: 'Manage Content' },
      { id: 'website.pages', label: 'Manage Pages' },
      { id: 'website.media', label: 'Manage Media' },
      { id: 'website.seo', label: 'Manage SEO' },
    ],
  },
  {
    name: 'Settings',
    perms: [
      { id: 'settings.view', label: 'View Settings' },
      { id: 'settings.edit', label: 'Edit Settings' },
    ],
  },
  {
    name: 'Security',
    perms: [
      { id: 'security.logs', label: 'View Logs' },
      { id: 'security.sessions', label: 'Manage Sessions' },
      { id: 'security.permissions', label: 'Manage Permissions' },
    ],
  },
];

export const OwnerRolesSection: React.FC = () => {
  const { customRoles, addCustomRole, updateCustomRole, deleteCustomRole, addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<AdminPermission[]>([]);

  const handleOpenCreate = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRoleDesc('');
    setSelectedPerms(['dashboard.view', 'users.view', 'reports.view']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: CustomRole) => {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setRoleDesc(role.description);
    setSelectedPerms(role.permissions);
    setIsModalOpen(true);
  };

  const handleTogglePerm = (permId: AdminPermission) => {
    setSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAll = () => {
    const all = PERM_GROUPS.flatMap((g) => g.perms.map((p) => p.id));
    setSelectedPerms(Array.from(new Set(all)));
  };

  const handleClearAll = () => {
    setSelectedPerms([]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      addToast('Role Name Required', 'Please enter a name for the role.', 'warning');
      return;
    }

    if (editingRoleId) {
      updateCustomRole(editingRoleId, {
        name: roleName.trim(),
        description: roleDesc.trim(),
        permissions: selectedPerms,
      });
    } else {
      addCustomRole({
        name: roleName.trim(),
        description: roleDesc.trim(),
        permissions: selectedPerms,
        is_system: false,
        member_count: 0,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span>Customizable Admin Roles (کرداروں کا انتظام)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure reusable permission presets for staff members (Senior Admin, Support Admin, Finance Admin, Operations Admin).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customRoles.map((role, idx) => (
          <div
            key={`custom-role-${role.id || 'r'}-${idx}`}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {role.is_system ? 'System Preset' : 'Custom Defined'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {role.permissions.length} perms
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {role.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {role.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>{role.member_count || 0} Admins Assigned</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(role)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-[11px] text-slate-700 dark:text-slate-200"
                >
                  Configure
                </button>
                {!role.is_system && (
                  <button
                    type="button"
                    onClick={() => deleteCustomRole(role.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete custom role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingRoleId ? 'Edit Role & Permissions' : 'Create Customizable Admin Role'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define the exact access capabilities granted to this administrative role
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Senior Operations Admin"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    placeholder="e.g. Handles day-to-day operations and reviews"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Permission Groups */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Assigned Capabilities ({selectedPerms.length} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[11px] font-bold text-purple-600 hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[11px] font-bold text-slate-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
                  {PERM_GROUPS.map((group) => (
                    <div key={group.name} className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-slate-800 pb-1">
                        {group.name}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {group.perms.map((p) => {
                          const isChecked = selectedPerms.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              onClick={() => handleTogglePerm(p.id)}
                              className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors text-xs ${
                                isChecked
                                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-semibold'
                                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="truncate">{p.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md active:scale-95"
                >
                  Save Role Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
