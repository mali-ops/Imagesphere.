import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { User, AdminPermission, UserRole, UserStatus } from '../../../types';
import {
  Shield,
  ShieldCheck,
  Crown,
  Search,
  Filter,
  UserPlus,
  KeyRound,
  Trash2,
  Lock,
  Unlock,
  Sliders,
  CheckCircle2,
  X,
  Mail,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Copy,
  AlertTriangle,
} from 'lucide-react';

interface OwnerAdminsSectionProps {
  onOpenCreateAdmin: () => void;
  onEditAdmin: (admin: User) => void;
  onResetAdminPassword: (admin: User) => void;
}

export const OwnerAdminsSection: React.FC<OwnerAdminsSectionProps> = ({
  onOpenCreateAdmin,
  onEditAdmin,
  onResetAdminPassword,
}) => {
  const { users, currentUser, updateUserStatus, assignAdminRole, addToast, confirm, syncUsersFromDatabase } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'admin'>('all');

  const adminUsers = useMemo(() => {
    return users.filter((u) => u.role === 'admin' || u.role === 'owner');
  }, [users]);

  const filteredAdmins = useMemo(() => {
    return adminUsers.filter((u) => {
      const matchSearch =
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchRole = roleFilter === 'all' || u.role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [adminUsers, search, statusFilter, roleFilter]);

  const handleToggleStatus = (admin: User) => {
    // Owner protection: Cannot suspend or change status of Owner
    if (admin.role === 'owner' || admin.email === 'aliuniet@gmail.com') {
      addToast('Protected Account', 'The Super Owner account cannot be suspended or deactivated.', 'error');
      return;
    }

    const newStatus: UserStatus = admin.status === 'active' ? 'suspended' : 'active';
    updateUserStatus(admin.id, newStatus);
    addToast('Admin Status Updated', `Admin account status changed to ${newStatus}.`, 'info');
  };

  const handleRevokeAdmin = (admin: User) => {
    // Owner protection: Cannot revoke or demote Owner
    if (admin.role === 'owner' || admin.email === 'aliuniet@gmail.com') {
      addToast('Protected Account', 'The Super Owner account cannot be removed or demoted.', 'error');
      return;
    }

    confirm({
      title: `Demote ${admin.full_name}?`,
      message: `This will remove administrative access for ${admin.email} and demote their role to a regular client account.`,
      confirmLabel: 'Yes, Demote to Client',
      isDestructive: true,
      onConfirm: async () => {
        await assignAdminRole(admin.id, 'user', []);
        await syncUsersFromDatabase();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span>Administrator Roster & Management (ایڈمنز کا نظم و نسق)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Owner has full authority to appoint admins, customize granular permissions, or revoke access.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateAdmin}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Appoint New Admin</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admins by name, email, or username..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="owner">Super Owner</option>
            <option value="admin">Administrator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Modern Data Table (Section 14 of spec) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Profile & Admin Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role Tier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Permissions</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAdmins.map((admin, idx) => {
                const isSuperOwner = admin.role === 'owner' || admin.email === 'aliuniet@gmail.com';
                const permsCount = isSuperOwner ? 'ALL (100%)' : `${admin.admin_permissions?.length || 0} permissions`;

                return (
                  <tr
                    key={`owner-admin-row-${admin.id || admin.user_id || admin.email || 'adm'}-${idx}`}
                    className={`transition-colors ${
                      isSuperOwner
                        ? 'bg-amber-500/5 hover:bg-amber-500/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Profile & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={admin.avatar_url}
                          alt={admin.full_name}
                          className={`w-9 h-9 rounded-xl object-cover bg-slate-200 ${
                            isSuperOwner ? 'ring-2 ring-amber-500' : 'ring-1 ring-purple-400'
                          }`}
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{admin.full_name}</span>
                            {isSuperOwner && <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            @{admin.username || admin.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {admin.email}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {isSuperOwner ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs">
                          Super Owner
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {admin.custom_role || 'Admin'}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          admin.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>

                    {/* Assigned Permissions */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          isSuperOwner
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {permsCount}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isSuperOwner ? (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold italic">
                          Root Permanent
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditAdmin(admin)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600"
                            title="Manage Permissions & Role"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onResetAdminPassword(admin)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-600"
                            title="Reset Admin Password (Verified token)"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(admin)}
                            className={`p-1.5 rounded-lg ${
                              admin.status === 'active'
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                            title={admin.status === 'active' ? 'Suspend Admin Account' : 'Activate Admin'}
                          >
                            {admin.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRevokeAdmin(admin)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Remove Admin Role (Demote)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
